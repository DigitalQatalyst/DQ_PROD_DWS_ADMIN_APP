/**
 * User Synchronization Endpoint
 * 
 * Synchronizes authenticated Azure External Identities users with Supabase tables
 * (users, user_profiles, organisations) and returns RLS-ready context for RBAC.
 */

import { Request, Response } from 'express';
import { verifyAzureToken, AuthenticatedRequest } from './middleware/verifyAzureToken';
import { normalizeClaims, NormalizedClaims } from './utils/normalizeClaims';
import { supabaseAdmin } from './utils/supabaseClient';

interface SyncUserRequest extends AuthenticatedRequest {
  user?: NormalizedClaims;
}

interface SyncUserResponse {
  status: 'synced' | 'error';
  user?: {
    email: string;
    organisation_id: string;
    customer_type: string;
    user_role: string;
  };
  error?: string;
  details?: string;
}

/**
 * Sync user endpoint handler
 * @param req Express request object with authenticated user
 * @param res Express response object
 */
export default async function handler(
  req: SyncUserRequest, 
  res: Response<SyncUserResponse>
): Promise<void> {
  try {
    console.log('🔄 Starting user synchronization...');

    // Verify token and get normalized claims
    await new Promise<void>((resolve, reject) => {
      verifyAzureToken(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        error: 'authentication_required',
        details: 'User authentication failed'
      });
    }

    const { azureUserId, email, customerType, userRole, companyName } = req.user;
    
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
    const responseData: SyncUserResponse = {
      status: 'synced',
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
}
