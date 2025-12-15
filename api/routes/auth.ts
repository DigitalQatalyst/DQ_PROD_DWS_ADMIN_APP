/**
 * Authentication Routes
 * 
 * Routes for user authentication and synchronization.
 */

import { Router, Request, Response } from 'express';
import { verifyAzureToken, AuthenticatedRequest } from '../auth/middleware/verifyAzureToken';
import { supabaseAdmin } from '../auth/utils/supabaseClient';
import { issueInternalToken, setTokenCookie, verifyInternalToken } from '../mw/internalAuth';

const router = Router();

/**
 * POST /api/auth/login
 * Federated identity login endpoint
 * - Validates Azure JWT (authentication only)
 * - Looks up user in local database
 * - Issues internal JWT with authorization context
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Federated identity login started');

    // Verify Azure JWT token (authentication only)
    await new Promise<void>((resolve, reject) => {
      verifyAzureToken(req as AuthenticatedRequest, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        error: 'authentication_required',
        message: 'Azure authentication failed'
      });
    }

    // Extract only minimal auth info (azure_oid and email)
    const { azureOid, email } = authReq.user;
    
    console.log('🔍 Looking up user by azure_oid:', azureOid);

    // Look up user in local database by azure_oid (PRIMARY identifier)
    const { data: user, error: userError } = await supabaseAdmin
      .from('auth_users')
      .select(`
        id,
        email,
        azure_oid,
        auth_user_profiles (
          organization_id,
          role,
          user_segment
        )
      `)
      .eq('azure_oid', azureOid)
      .single();

    if (userError || !user) {
      console.warn('❌ User not provisioned:', azureOid);
      
      return res.status(403).json({
        error: 'user_not_provisioned',
        message: 'Your account has not been provisioned. Please contact your administrator or support to request access.',
        email: email
      });
    }

    // Get user profile for authorization context (get first profile)
    const profile = Array.isArray(user.auth_user_profiles) ? user.auth_user_profiles[0] : user.auth_user_profiles;
    if (!profile || !profile.organization_id || !profile.role || !profile.user_segment) {
      console.error('⚠️ User profile incomplete:', user.id);
      
      return res.status(500).json({
        error: 'incomplete_profile',
        message: 'Your user profile is incomplete. Please contact your administrator.'
      });
    }

    console.log('✅ User found:', {
      user_id: user.id,
      organization_id: profile.organization_id,
      role: profile.role,
      user_segment: profile.user_segment
    });

    // Issue internal JWT with local authorization context
    const internalToken = issueInternalToken({
      id: user.id,
      organization_id: profile.organization_id,
      role: profile.role,
      user_segment: profile.user_segment
    });

    // Set httpOnly cookie
    setTokenCookie(res, internalToken);

    // Update last login timestamp
    await supabaseAdmin
      .from('auth_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Return success response
    res.status(200).json({
      status: 'authenticated',
      user: {
        id: user.id,
        email: user.email,
        organization_id: profile.organization_id,
        role: profile.role,
        user_segment: profile.user_segment
      },
      token: internalToken // Also return token for localStorage fallback
    });

    console.log('🎉 Federated identity login successful');

  } catch (error) {
    console.error('❌ Login error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: 'internal_server_error',
      message: errorMessage
    });
  }
});

/**
 * POST /api/auth/logout
 * Clears the session token cookie
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session_token', { path: '/' });
  res.status(200).json({ status: 'logged_out' });
});

/**
 * GET /api/auth/me
 * Get current user information from internal JWT
 */
router.get('/me', verifyInternalToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    user: req.user
  });
});

/**
 * POST /api/auth/sync-user
 * Synchronizes authenticated Azure External Identities users with Supabase tables
 * @deprecated - Use /api/auth/login instead with federated identity pattern
 */
router.post('/sync-user', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting user synchronization...');

    // Verify token and get normalized claims
    await new Promise<void>((resolve, reject) => {
      verifyAzureToken(req as AuthenticatedRequest, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        status: 'error',
        error: 'authentication_required',
        details: 'User authentication failed'
      });
    }

    const { azureUserId, email, customerType, userRole, companyName } = authReq.user;
    
    console.log('📋 User claims:', {
      azureUserId,
      email,
      customerType,
      userRole,
      companyName
    });

    // 1. Find or create organization
    console.log('🏢 Looking up organization:', companyName);
    
    let { data: org, error: orgError } = await supabaseAdmin
      .from('organisations')
      .select('id')
      .eq('name', companyName)
      .single();

    if (orgError && orgError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Organization lookup error:', orgError);
      throw new Error(`Failed to lookup organization: ${orgError.message}`);
    }

    if (!org) {
      console.log('🏢 Creating new organization:', companyName);
      
      const { data: newOrg, error: createOrgError } = await supabaseAdmin
        .from('organisations')
        .insert({
          name: companyName,
          display_name: companyName,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createOrgError) {
        console.error('Organization creation error:', createOrgError);
        throw new Error(`Failed to create organization: ${createOrgError.message}`);
      }

      org = newOrg;
      console.log('✅ Organization created with ID:', org.id);
    } else {
      console.log('✅ Organization found with ID:', org.id);
    }

    // 2. Upsert user
    console.log('👤 Upserting user:', email);
    
    const { data: upsertedUser, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        azure_user_id: azureUserId,
        email,
        organisation_id: org.id,
        is_active: true,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'azure_user_id',
        ignoreDuplicates: false
      })
      .select('id')
      .single();

    if (userError) {
      console.error('User upsert error:', userError);
      throw new Error(`Failed to upsert user: ${userError.message}`);
    }

    console.log('✅ User upserted with ID:', upsertedUser.id);

    // 3. Upsert user profile
    console.log('📝 Upserting user profile for user:', upsertedUser.id);
    
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: upsertedUser.id,
        organisation_id: org.id,
        organisation_name: companyName,
        customer_type: customerType,
        user_role: userRole,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (profileError) {
      console.error('User profile upsert error:', profileError);
      throw new Error(`Failed to upsert user profile: ${profileError.message}`);
    }

    console.log('✅ User profile upserted successfully');

    // 4. Return RLS context
    const responseData = {
      status: 'synced' as const,
      user: {
        email,
        organisation_id: org.id,
        customer_type: customerType,
        user_role: userRole
      }
    };

    console.log('🎉 User synchronization completed successfully');
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Sync user error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      status: 'error',
      error: 'sync_failed',
      details: errorMessage
    });
  }
});

export default router;
