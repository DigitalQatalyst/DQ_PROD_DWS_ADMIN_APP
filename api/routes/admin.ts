/**
 * Admin Routes
 * 
 * Administrative endpoints for user provisioning and management.
 * These endpoints require admin authentication via internal JWT.
 */

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../auth/utils/supabaseClient';
import { verifyInternalToken } from '../mw/internalAuth';

const router = Router();

/**
 * GET /api/admin/users
 * List all users in the current organization
 */
router.get('/users', verifyInternalToken, async (req: any, res: Response) => {
  try {
    const { organization_id } = req.user;
    
    if (!organization_id) {
      return res.status(403).json({
        error: 'forbidden',
        message: 'Organization context required'
      });
    }

    const { data: users, error } = await supabaseAdmin
      .from('auth_users')
      .select(`
        id,
        email,
        name,
        azure_sub,
        is_active,
        created_at,
        updated_at,
        auth_user_profiles (
          role,
          customer_type,
          organization_id
        )
      `)
      .eq('auth_user_profiles.organization_id', organization_id);

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        error: 'internal_server_error',
        message: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: users
    });

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Error fetching users'
    });
  }
});

/**
 * POST /api/admin/users
 * Create a new user (provision access)
 */
router.post('/users', verifyInternalToken, async (req: any, res: Response) => {
  try {
    const { organization_id } = req.user;
    const { azure_oid, email, name, role = 'viewer', customer_type = 'staff', azure_sub } = req.body;

    if (!azure_oid || !email) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'azure_oid and email are required'
      });
    }

    // Check if user already exists by azure_oid
    const { data: existingUser } = await supabaseAdmin
      .from('auth_users')
      .select('id')
      .eq('azure_oid', azure_oid)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'conflict',
        message: 'User already exists with this azure_oid'
      });
    }

    // Create user with azure_oid as PRIMARY identifier
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('auth_users')
      .insert({
        azure_oid, // PRIMARY identifier
        azure_sub, // Keep for legacy
        email,
        name: name || email.split('@')[0],
        is_active: true,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({
        error: 'internal_server_error',
        message: userError.message
      });
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .insert({
        user_id: newUser.id,
        organization_id: organization_id,
        role,
        customer_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Rollback user creation
      await supabaseAdmin.from('auth_users').delete().eq('id', newUser.id);
      
      return res.status(500).json({
        error: 'internal_server_error',
        message: profileError.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'User provisioned successfully',
      data: {
        id: newUser.id,
        email,
        role,
        customer_type
      }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Error provisioning user'
    });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user role and/or customer_type
 */
router.patch('/users/:id', verifyInternalToken, async (req: any, res: Response) => {
  try {
    const { organization_id } = req.user;
    const { id } = req.params;
    const { role, customer_type } = req.body;

    if (!role && !customer_type) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'At least one field (role or customer_type) must be provided'
      });
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (role) updates.role = role;
    if (customer_type) updates.customer_type = customer_type;

    const { error } = await supabaseAdmin
      .from('auth_user_profiles')
      .update(updates)
      .eq('user_id', id)
      .eq('organization_id', organization_id);

    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        error: 'internal_server_error',
        message: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/users/:id:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Error updating user'
    });
  }
});

export default router;
