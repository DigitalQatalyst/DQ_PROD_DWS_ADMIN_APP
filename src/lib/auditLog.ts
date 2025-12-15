/**
 * Audit Logging Utility
 * 
 * Centralized utility for logging all user activities to the activity_logs table
 * for compliance, security, and debugging purposes.
 * 
 * Usage:
 * ```typescript
 * await logContentActivity('approved', contentId, { status: 'Published' });
 * ```
 */

import { getSupabaseClient } from './dbClient';
import { createClient } from '@supabase/supabase-js';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'unpublished'
  | 'archived'
  | 'sent_back'
  | 'viewed'
  | 'commented'
  | 'flagged';

export type EntityType =
  | 'content'
  | 'service'
  | 'business'
  | 'zone'
  | 'growth_area'
  | 'organization'
  | 'user';

// Get service role client for audit operations that need to bypass RLS
function getServiceRoleClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Service role key not available for audit logging, falling back to regular client');
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

interface AuditLogParams {
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  details?: Record<string, any>;
  organizationId?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
}

/**
 * Log an activity to the audit trail
 * 
 * @param params - Audit log parameters
 * @returns Promise resolving to the created log entry ID
 */
export async function logActivity(params: AuditLogParams): Promise<string | null> {
  try {
    // Use service role client to bypass RLS for audit operations
    const supabase = getServiceRoleClient() || getSupabaseClient();
    
    if (!supabase) {
      console.warn('⚠️ Supabase client not available, skipping audit log');
      return null;
    }
    
    console.log('🔑 Using service role client for audit logging');

    // Get current user info from localStorage as fallback if not provided
    const userId = params.userId || localStorage.getItem('user_id');
    const userName = params.userName || localStorage.getItem('azure_user_info') 
      ? JSON.parse(localStorage.getItem('azure_user_info') || '{}').name 
      : 'Unknown User';
    const userRole = params.userRole || localStorage.getItem('user_role') || 'unknown';
    const organizationId = params.organizationId || localStorage.getItem('user_organization_id');

    if (!userId) {
      console.warn('⚠️ No user ID available for audit log');
      return null;
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        performed_by: userId,
        performed_by_name: userName,
        performed_by_role: userRole,
        organization_id: organizationId || null,
        details: params.details || {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to log activity:', error);
      return null;
    }

    console.log(`✅ Activity logged: ${params.action} on ${params.entityType} ${params.entityId}`);
    return data?.id || null;
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return null;
  }
}

/**
 * Convenience functions for specific entity types
 */

export async function logContentActivity(
  action: ActivityAction,
  contentId: string,
  details?: Record<string, any>,
  organizationId?: string
): Promise<string | null> {
  const userId = localStorage.getItem('user_id');
  const userInfo = localStorage.getItem('azure_user_info');
  const userName = userInfo ? JSON.parse(userInfo).name : 'Unknown User';
  const userRole = localStorage.getItem('user_role') || 'unknown';
  
  return logActivity({
    entityType: 'content',
    entityId: contentId,
    action,
    details,
    organizationId,
    userId,
    userName,
    userRole
  });
}

export async function logServiceActivity(
  action: ActivityAction,
  serviceId: string,
  details?: Record<string, any>
): Promise<string | null> {
  const userId = localStorage.getItem('user_id');
  const userInfo = localStorage.getItem('azure_user_info');
  const userName = userInfo ? JSON.parse(userInfo).name : 'Unknown User';
  const userRole = localStorage.getItem('user_role') || 'unknown';
  const organizationId = localStorage.getItem('user_organization_id');
  
  return logActivity({
    entityType: 'service',
    entityId: serviceId,
    action,
    details,
    organizationId,
    userId,
    userName,
    userRole
  });
}

export async function logBusinessActivity(
  action: ActivityAction,
  businessId: string,
  details?: Record<string, any>
): Promise<string | null> {
  const userId = localStorage.getItem('user_id');
  const userInfo = localStorage.getItem('azure_user_info');
  const userName = userInfo ? JSON.parse(userInfo).name : 'Unknown User';
  const userRole = localStorage.getItem('user_role') || 'unknown';
  const organizationId = localStorage.getItem('user_organization_id');
  
  return logActivity({
    entityType: 'business',
    entityId: businessId,
    action,
    details,
    organizationId,
    userId,
    userName,
    userRole
  });
}

