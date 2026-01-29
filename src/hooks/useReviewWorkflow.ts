/**
 * useReviewWorkflow Hook
 * 
 * Handles review workflow state transitions, comment submissions, and audit logging
 * for content, services, and business listings.
 */

import { useState, useCallback } from 'react';
import { getSupabaseClient, setSupabaseSession } from '../lib/dbClient';
import { useAuth } from '../context/AuthContext';
import { useAbility } from './useAbility';
import { Toast } from '../components/ui/Toast';
import { createClient } from '@supabase/supabase-js';
import { supabase2 } from '../lib/supabase2';

export interface WorkflowTransition {
  fromStatus: string;
  toStatus: string;
  action: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  author_id?: string;
  comment_type?: string;
  action_type?: string;
  related_status_change?: string;
  is_resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface AuditLogEntry {
  id: string;
  date: string;
  action: string;
  performedBy: string;
}

const STATUS_MAP = {
  'Draft': { step: 0, label: 'Draft' },
  'Pending Review': { step: 1, label: 'Initial Review' },
  'Approved': { step: 2, label: 'Final Approval' },
  'Published': { step: 3, label: 'Published' },
  'Archived': { step: 4, label: 'Archived' },
  'Rejected': { step: 1, label: 'Rejected' }
};

// Get service role client for operations that need to bypass RLS
function getServiceRoleClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Service role key not available, falling back to regular client');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Format action text to be more descriptive
function formatActionText(actionType: string, newStatus?: string): string {
  switch (actionType) {
    case 'Submit':
      return newStatus === 'Published' ? 'Published' : 'Submitted for Review';
    case 'Resubmit':
      return 'Resubmitted for Review';
    case 'Approve':
      return 'Approved';
    case 'Reject':
      return 'Rejected';
    case 'Send Back':
      return 'Sent Back for Revision';
    case 'Unpublish':
      return 'Unpublished';
    case 'Archive':
      return 'Archived';
    case 'Restore':
      return 'Restored to Published';
    case 'Publish':
      return 'Published';
    case 'Flag':
      return 'Flagged for Review';
    case 'Assign':
      return 'Assigned for Review';
    case 'Reassign':
      return 'Reassigned to Reviewer';
    default:
      return actionType;
  }
}

// Interface for reviewer candidate
interface ReviewerCandidate {
  user_id: string;
  name: string;
  role: string;
  organization_id: string | null;
  workload: number; // Count of active assignments
  last_assigned_at: string | null; // When they were last assigned
}

/**
 * Find and rank eligible reviewers (internal approvers/admins)
 */
async function findAndRankReviewers(
  supabase: any,
  contentOrganizationId: string | null
): Promise<ReviewerCandidate[]> {
  try {
    // Find all internal approvers and admins
    // Query auth_user_profiles for internal approvers/admins
    const { data: profiles, error } = await supabase
      .from('auth_user_profiles')
      .select('user_id, role, organization_id')
      .eq('user_segment', 'internal')
      .in('role', ['approver', 'admin']);

    if (error) {
      console.error('Failed to fetch reviewer candidates:', error);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.warn('No eligible reviewers found');
      return [];
    }

    // Get user names from auth_users table
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from('auth_users')
      .select('id, name')
      .in('id', userIds);

    if (usersError) {
      console.warn('Failed to fetch user names:', usersError);
    }

    // Create a map of user_id -> name
    const userNameMap = new Map<string, string>();
    if (users) {
      users.forEach((user: any) => {
        userNameMap.set(user.id, user.name || 'Unknown');
      });
    }

    // Get workload for each candidate (count of active assignments)
    const candidateIds = profiles.map((p: any) => p.user_id);

    const { data: assignments, error: assignmentError } = await supabase
      .from('wf_review_assignments')
      .select('assigned_reviewer_id, assigned_at')
      .in('assigned_reviewer_id', candidateIds)
      .in('status', ['Assigned', 'Accepted', 'In Progress']);

    // Calculate workload per reviewer
    const workloadMap = new Map<string, number>();
    const lastAssignedMap = new Map<string, string | null>();

    if (assignments) {
      assignments.forEach((assignment: any) => {
        const reviewerId = assignment.assigned_reviewer_id;
        workloadMap.set(reviewerId, (workloadMap.get(reviewerId) || 0) + 1);

        // Track most recent assignment
        const existing = lastAssignedMap.get(reviewerId);
        if (!existing || assignment.assigned_at > existing) {
          lastAssignedMap.set(reviewerId, assignment.assigned_at);
        }
      });
    }

    // Build candidates array
    const candidates: ReviewerCandidate[] = profiles
      .map((profile: any) => ({
        user_id: profile.user_id,
        name: userNameMap.get(profile.user_id) || 'Unknown',
        role: profile.role,
        organization_id: profile.organization_id,
        workload: workloadMap.get(profile.user_id) || 0,
        last_assigned_at: lastAssignedMap.get(profile.user_id) || null
      }))
      .filter((c: ReviewerCandidate) => c.user_id); // Remove invalid entries

    // Rank candidates:
    // 1. Same organization (if content has one)
    // 2. Lower workload
    // 3. Earlier last_assigned_at (or null = never assigned)
    candidates.sort((a, b) => {
      // Priority 1: Same org match (if content has org)
      if (contentOrganizationId) {
        const aSameOrg = a.organization_id === contentOrganizationId;
        const bSameOrg = b.organization_id === contentOrganizationId;
        if (aSameOrg && !bSameOrg) return -1;
        if (!aSameOrg && bSameOrg) return 1;
      }

      // Priority 2: Lower workload
      if (a.workload !== b.workload) {
        return a.workload - b.workload;
      }

      // Priority 3: Earlier last assignment (or null = never assigned = better)
      if (!a.last_assigned_at && b.last_assigned_at) return -1;
      if (a.last_assigned_at && !b.last_assigned_at) return 1;
      if (a.last_assigned_at && b.last_assigned_at) {
        return new Date(a.last_assigned_at).getTime() - new Date(b.last_assigned_at).getTime();
      }

      return 0;
    });

    console.log('✅ Found and ranked reviewers:', candidates.length);
    return candidates;
  } catch (error) {
    console.error('Failed to find reviewers:', error);
    return [];
  }
}

/**
 * Auto-assign a reviewer to the review cycle
 */
async function autoAssignReviewer(
  supabase: any,
  reviewCycleId: string,
  contentId: string,
  contentOrganizationId: string | null,
  assignedBy: string,
  assignedByName: string
): Promise<{ reviewerId: string | null; reviewerName: string | null }> {
  try {
    // Find eligible reviewers and rank them
    const candidates = await findAndRankReviewers(supabase, contentOrganizationId);

    if (candidates.length === 0) {
      console.warn('⚠️ No eligible reviewers found for auto-assignment');
      return { reviewerId: null, reviewerName: null };
    }

    // Pick the top candidate
    const selectedReviewer = candidates[0];
    console.log('✅ Selected reviewer:', {
      id: selectedReviewer.user_id,
      name: selectedReviewer.name,
      workload: selectedReviewer.workload
    });

    // Create assignment record
    const { error: assignError } = await supabase
      .from('wf_review_assignments')
      .insert({
        review_cycle_id: reviewCycleId,
        content_id: contentId,
        assigned_reviewer_id: selectedReviewer.user_id,
        assigned_reviewer_name: selectedReviewer.name,
        assignment_type: 'Primary',
        assigned_by: assignedBy,
        assigned_by_name: assignedByName,
        status: 'Assigned',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      });

    if (assignError) {
      console.error('Failed to create review assignment:', assignError);
      return { reviewerId: null, reviewerName: null };
    }

    // Update review cycle with assigned reviewer
    await supabase
      .from('wf_review_cycles')
      .update({
        assigned_reviewer_id: selectedReviewer.user_id,
        assigned_reviewer_name: selectedReviewer.name
      })
      .eq('id', reviewCycleId);

    return {
      reviewerId: selectedReviewer.user_id,
      reviewerName: selectedReviewer.name
    };
  } catch (error) {
    console.error('Failed to auto-assign reviewer:', error);
    return { reviewerId: null, reviewerName: null };
  }
}

interface UseReviewWorkflowProps {
  itemId: string;
  itemType: 'content' | 'service' | 'business';
  currentStatus: string;
  tableName: string; // e.g., 'cnt_contents', 'mktplc_services'
  onStatusChange?: (newStatus: string) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export function useReviewWorkflow({
  itemId,
  itemType,
  currentStatus,
  tableName,
  onStatusChange,
  showToast
}: UseReviewWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const { user, role, userSegment } = useAuth();
  const ability = useAbility();
  const organizationId = user?.organization_id || user?.id || null;

  // Helper to get user ID from multiple sources
  const getUserId = (): string | null => {
    if (user?.id) return user.id;

    // Fall back to localStorage
    const localStorageId = localStorage.getItem('user_id') ||
      localStorage.getItem('azure_user_id');

    if (localStorageId) {
      console.log('⚠️ Using localStorage user ID as fallback:', localStorageId);
    }

    return localStorageId;
  };

  // Helper to get user name from multiple sources
  const getUserName = (): string => {
    if (user?.name) return user.name;

    const azureUserInfo = localStorage.getItem('azure_user_info');
    if (azureUserInfo) {
      try {
        const parsed = JSON.parse(azureUserInfo);
        return parsed.name || parsed.email || 'Unknown';
      } catch {
        return 'Unknown';
      }
    }

    return 'Unknown';
  };

  // Debug: Log auth state on mount (reduced logging)
  if (Math.random() < 0.01) { // Only log 1% of the time to reduce spam
    console.log('🔍 useReviewWorkflow initialized:', {
      itemId,
      itemType,
      currentStatus,
      tableName,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      role,
      userSegment
    });
  }

  /**
   * Get current workflow step
   */
  const getCurrentStep = useCallback(() => {
    return STATUS_MAP[currentStatus as keyof typeof STATUS_MAP] || { step: 0, label: currentStatus };
  }, [currentStatus]);

  /**
   * Transition workflow status
   */
  const transitionStatus = useCallback(async (
    action: string,
    newStatus: string,
    previousStatus?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // Map action to CASL permission
      const getRequiredPermission = (action: string, newStatus: string): { action: string; subject: string } | null => {
        switch (action) {
          case 'Approve':
          case 'Reject':
          case 'Send Back':
            return { action: 'approve', subject: itemType === 'service' ? 'Service' : 'Content' };
          case 'Publish':
            return { action: 'publish', subject: itemType === 'service' ? 'Service' : 'Content' };
          case 'Unpublish':
            return { action: 'publish', subject: itemType === 'service' ? 'Service' : 'Content' }; // Publish is bidirectional
          case 'Archive':
            return { action: 'archive', subject: itemType === 'service' ? 'Service' : 'Content' };
          case 'Flag':
            return { action: 'flag', subject: itemType === 'service' ? 'Service' : 'Content' };
          default:
            return null;
        }
      };

      // Check RBAC permissions before proceeding
      const permission = getRequiredPermission(action, newStatus);
      if (permission) {
        const subject = permission.subject as 'Service' | 'Content';
        if (!ability.can(permission.action as any, subject)) {
          const errorMsg = `You don't have permission to ${action.toLowerCase()} this ${subject.toLowerCase()}`;
          console.error(`❌ RBAC check failed: ${errorMsg}`);
          if (showToast) {
            showToast(errorMsg, 'error');
          }
          setLoading(false);
          return false;
        }

        // For non-internal users, verify organization_id matches
        if (userSegment !== 'internal' && organizationId) {
          const supabase = getSupabaseClient();
          const { data: itemData, error: fetchError } = await supabase
            .from(tableName)
            .select('organization_id')
            .eq('id', itemId)
            .maybeSingle();

          if (fetchError) {
            console.error('Failed to fetch item organization:', fetchError);
            if (showToast) {
              showToast('Failed to verify permissions', 'error');
            }
            setLoading(false);
            return false;
          }

          if (itemData?.organization_id !== organizationId) {
            const errorMsg = `You can only ${action.toLowerCase()} ${subject.toLowerCase()}s from your organization`;
            console.error(`❌ Organization mismatch: item org=${itemData?.organization_id}, user org=${organizationId}`);
            if (showToast) {
              showToast(errorMsg, 'error');
            }
            setLoading(false);
            return false;
          }
        }
      }

      // Use service role client to bypass RLS for status updates
      let supabase = getServiceRoleClient() || getSupabaseClient();
      if (tableName === 'marketplace_services') {
        supabase = supabase2;
      }

      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      console.log('🔑 Using service role client for status updates');
      console.log('🔄 Updating status:', { from: previousStatus || currentStatus, to: newStatus, itemId, tableName });

      // Map status for services table (mktplc_services or marketplace_services) - database constraint doesn't allow 'Pending Review'
      // Map 'Pending Review' to 'Pending' for services
      let mappedStatus = newStatus;
      if (tableName === 'mktplc_services' || tableName === 'marketplace_services') {
        if (newStatus === 'Pending Review') {
          mappedStatus = 'Pending';
          console.log(`🔄 Mapping status for services (${tableName}): "Pending Review" -> "Pending"`);
        }
        // Ensure Unpublished and Archived are valid (they should be after migration)
        // No mapping needed as they're already valid statuses
      }

      // Guard: no-op if record already in target status
      const { data: currentRow, error: fetchErr } = await supabase
        .from(tableName)
        .select('id, status')
        .eq('id', itemId)
        .maybeSingle();
      if (fetchErr) {
        console.warn('Failed to read current status before update:', fetchErr);
      }
      if (currentRow?.status === mappedStatus) {
        console.log('ℹ️ Status unchanged, skipping update and audit log');
        if (showToast) showToast('No status change', 'success');
        return false;
      }
      // TODO: set up optimistic locking with a version column in Supabase (Postgres)
      // Update the main record status
      const expectedStatus = currentRow?.status ?? previousStatus ?? currentStatus;

      const { data: updateData, error: updateError } = await supabase
        .from(tableName)
        .update({
          status: mappedStatus,
          updated_at: new Date().toISOString()
        })
        // Only update if previous status matches, to avoid race conditions
        .eq('id', itemId)
        .eq('status', expectedStatus)
        .select('id, status');
      console.log(tableName, newStatus, itemId, previousStatus, currentRow?.status, currentStatus);

      if (updateError) {
        console.error('❌ Failed to update status in database:', updateError);
        throw updateError;
      }
      // If no row updated, skip logging (another user likely already changed it)
      if (!updateData || (Array.isArray(updateData) && updateData.length === 0)) {
        console.log('ℹ️ No row updated (possible concurrent update). Skipping audit log');
        return false;
      }

      console.log('✅ Status updated in database:', updateData);

      // Get content organization_id for reviewer assignment
      const { data: contentData } = await supabase
        .from(tableName)
        .select('organization_id')
        .eq('id', itemId)
        .maybeSingle();

      const contentOrganizationId = contentData?.organization_id || null;

      // Get or create review cycle for audit logging (don't filter by status)
      let { data: cycleData } = await supabase
        .from('wf_review_cycles')
        .select('id')
        .eq('content_id', itemId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Create review cycle if it doesn't exist (needed for new submissions)
      if (!cycleData?.id && (newStatus === 'Pending Review' || action === 'Submit' || action === 'Resubmit')) {
        const { data: newCycle, error: cycleError } = await supabase
          .from('wf_review_cycles')
          .insert({
            content_id: itemId,
            status: 'Pending Review',
            submitted_by_name: getUserName(),
            cycle_number: 1,
            submitted_by: getUserId() || '00000000-0000-0000-0000-000000000000'
          })
          .select('id')
          .single();

        if (cycleError) {
          console.warn('Failed to create review cycle:', cycleError);
        } else {
          cycleData = newCycle;
        }
      }

      // Auto-assign reviewer when status becomes "Pending Review"
      let assignedReviewerId: string | null = null;
      let assignedReviewerName: string | null = null;

      if (newStatus === 'Pending Review' && cycleData?.id) {
        const auditUserId = getUserId() || '00000000-0000-0000-0000-000000000000';
        const auditUserName = getUserName();

        const assignment = await autoAssignReviewer(
          supabase,
          cycleData.id,
          itemId,
          contentOrganizationId,
          auditUserId,
          auditUserName
        );

        assignedReviewerId = assignment.reviewerId;
        assignedReviewerName = assignment.reviewerName;

        if (assignedReviewerId) {
          console.log('✅ Reviewer auto-assigned:', assignedReviewerName);
        } else {
          console.warn('⚠️ Failed to auto-assign reviewer');
        }
      }

      // Get user info for audit log
      const auditUserId = getUserId() || '00000000-0000-0000-0000-000000000000';
      const auditUserName = getUserName();

      // Log audit entry in wf_review_actions
      const auditMetadata = {
        ...(metadata || {}),
        ...(assignedReviewerId ? {
          assigned_reviewer_id: assignedReviewerId,
          assigned_reviewer_name: assignedReviewerName
        } : {})
      };

      const { error: auditError } = await supabase
        .from('wf_review_actions')
        .insert({
          review_cycle_id: cycleData?.id || '00000000-0000-0000-0000-000000000000',
          content_id: itemId,
          action_type: action,
          action_by: auditUserId,
          action_by_name: auditUserName,
          action_reason: metadata?.reason,
          action_notes: metadata?.notes,
          previous_status: previousStatus || currentStatus,
          new_status: newStatus,
          metadata: auditMetadata
        });

      if (auditError) {
        console.warn('Failed to log audit entry:', auditError);
      }

      // Call callback if provided
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Show toast if provided
      if (showToast) {
        showToast(`${action} successful!`, 'success');
      }

      return true;
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()}:`, error);
      if (showToast) {
        showToast(`Failed to ${action.toLowerCase()}. Please try again.`, 'error');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType, tableName, currentStatus, user, role, userSegment, organizationId, ability, onStatusChange, showToast]);

  /**
   * Submit a comment
   */
  const submitComment = useCallback(async (
    comment: string,
    metadata?: Record<string, any>
  ): Promise<ReviewComment | null> => {
    if (!comment.trim()) {
      return null;
    }

    setLoading(true);

    try {
      // Use service role client to bypass RLS for comment operations
      let supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      console.log('🔑 Using service role client for comment operations');

      // Debug: Check localStorage for user info
      const azureUserInfo = localStorage.getItem('azure_user_info');
      const azureUserId = localStorage.getItem('user_id');
      console.log('🔍 Auth debug for comments:', {
        'authContext.user': user,
        'localStorage azure_user_info': azureUserInfo,
        'localStorage user_id': azureUserId,
        'authContext.role': role,
        'authContext.userSegment': userSegment
      });

      // Get user ID from multiple sources
      const userId = getUserId();
      const userName = getUserName();

      if (!userId) {
        console.error('❌ No user ID available for comment submission');
        console.error('User object:', user);
        console.error('localStorage items:', {
          azure_user_info: localStorage.getItem('azure_user_info'),
          user_id: localStorage.getItem('user_id'),
          azure_user_id: localStorage.getItem('azure_user_id'),
          user_role: localStorage.getItem('user_role'),
          user_segment: localStorage.getItem('user_segment')
        });

        if (showToast) {
          showToast('User not authenticated. Please log in again.', 'error');
        }
        return null;
      }

      console.log('✅ User validated for comment:', { id: userId, name: userName });

      // Determine if this is a service comment (uses different table)
      const isServiceComment = tableName === 'mktplc_services' || tableName === 'marketplace_services';
      const commentTable = isServiceComment ? 'mktplc_service_comments' : 'wf_review_comments';

      // Get organization_id for service comments (for RLS)
      let organizationId: string | null = null;
      if (isServiceComment) {
        const { data: serviceData } = await supabase
          .from(tableName)
          .select('organization_id')
          .eq('id', itemId)
          .maybeSingle();
        organizationId = serviceData?.organization_id || null;
      }

      // Get or create review cycle for this item (don't filter by status)
      // Only needed for non-service comments or if review_cycle_id is provided
      let reviewCycleId: string | null = null;
      if (!isServiceComment || metadata?.review_cycle_id) {
        const { data: cycleData } = await supabase
          .from('wf_review_cycles')
          .select('id')
          .eq('content_id', itemId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        reviewCycleId = cycleData?.id || metadata?.review_cycle_id || null;

        if (!reviewCycleId && !isServiceComment) {
          // Map content status to review cycle status
          const cycleStatus = currentStatus === 'Pending Review' ? 'Pending Review' :
            currentStatus === 'Published' ? 'Published' :
              currentStatus === 'Archived' ? 'Archived' : 'Draft';

          const { data: newCycle, error: cycleError } = await supabase
            .from('wf_review_cycles')
            .insert({
              content_id: itemId,
              status: cycleStatus,
              submitted_by_name: getUserName(),
              cycle_number: 1,
              submitted_by: getUserId() || '00000000-0000-0000-0000-000000000000'
            })
            .select('id')
            .single();

          if (cycleError) {
            console.error('Failed to create review cycle:', cycleError);
            console.error('Cycle error details:', {
              message: cycleError.message,
              details: cycleError.details,
              hint: cycleError.hint,
              code: cycleError.code
            });
            throw cycleError;
          }

          reviewCycleId = newCycle?.id;
        }
      }

      // Extract mentions from comment text (format: @username)
      const mentionRegex = /@(\w+)/g;
      const mentions: string[] = [];
      let match;
      while ((match = mentionRegex.exec(comment)) !== null) {
        mentions.push(match[1]);
      }

      // Build comment payload based on table type
      let commentPayload: any;

      if (isServiceComment) {
        // For service comments, use mktplc_service_comments table structure
        commentPayload = {
          service_id: itemId,
          comment_text: comment.trim(),
          comment_type: metadata?.comment_type || 'Review',
          author_id: userId,
          author_name: userName,
          author_role: role || userSegment || 'unknown',
          author_email: user?.email || metadata?.author_email || null,
          review_cycle_id: reviewCycleId || metadata?.review_cycle_id || null,
          is_internal: metadata?.is_internal || false,
          visibility: metadata?.visibility || 'All',
          mentions: mentions.length > 0 ? mentions : null,
          parent_comment_id: metadata?.parent_comment_id || null,
          related_status_change: metadata?.related_status_change || null,
          action_type: metadata?.action_type || null,
          organization_id: organizationId,
          created_by: userId,
          updated_by: userId
        };
      } else {
        // For other content types, use wf_review_comments table structure
        commentPayload = {
          review_cycle_id: reviewCycleId,
          content_id: itemId,
          author_id: userId,
          author_name: userName,
          author_role: role || userSegment || 'unknown',
          comment_text: comment.trim(),
          mentions: mentions.length > 0 ? mentions : null
        };
      }

      console.log('💬 Attempting to insert comment with payload:', commentPayload);

      const { data, error } = await supabase
        .from(commentTable)
        .insert(commentPayload)
        .select()
        .single();

      if (error) {
        console.error('❌ Comment insert error:', error);
        console.error('Comment error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Comment inserted successfully:', data);

      // Show toast if provided
      if (showToast) {
        showToast('Comment added successfully!', 'success');
      }

      // Return formatted comment
      return {
        id: data.id,
        author: data.author_name,
        role: data.author_role,
        text: data.comment_text,
        timestamp: new Date(data.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        author_id: data.author_id,
        comment_type: data.comment_type || 'Review',
        action_type: data.action_type || null,
        related_status_change: data.related_status_change || null
      };
    } catch (error) {
      console.error('Failed to submit comment:', error);
      if (showToast) {
        showToast('Failed to add comment. Please try again.', 'error');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType, tableName, currentStatus, user, role, userSegment, showToast]);

  /**
   * Fetch comments for this item
   */
  const fetchComments = useCallback(async (): Promise<ReviewComment[]> => {
    try {
      // Use service role client to bypass RLS for comment fetching
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        return [];
      }

      console.log('🔑 Using service role client for comment fetching');

      // Determine if this is a service comment (uses different table)
      const isServiceComment = tableName === 'mktplc_services' || tableName === 'marketplace_services';
      const commentTable = isServiceComment ? 'mktplc_service_comments' : 'wf_review_comments';
      const foreignKeyField = isServiceComment ? 'service_id' : 'content_id';

      const { data, error } = await supabase
        .from(commentTable)
        .select('*')
        .eq(foreignKeyField, itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(comment => ({
        id: comment.id,
        author: comment.author_name,
        role: comment.author_role,
        text: comment.comment_text,
        timestamp: new Date(comment.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        author_id: comment.author_id,
        comment_type: comment.comment_type || 'Review',
        action_type: comment.action_type || null,
        related_status_change: comment.related_status_change || null,
        is_resolved: comment.is_resolved || false,
        resolved_by: comment.resolved_by || null,
        resolved_at: comment.resolved_at ? new Date(comment.resolved_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null
      }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  }, [itemId, itemType, tableName]);

  /**
   * Fetch audit log entries for this item
   */
  const fetchAuditLog = useCallback(async (): Promise<AuditLogEntry[]> => {
    try {
      // Use service role client to bypass RLS for audit log fetching
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        return [];
      }

      console.log('🔑 Using service role client for audit log fetching');

      const { data, error } = await supabase
        .from('wf_review_actions')
        .select('*')
        .eq('content_id', itemId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        action: formatActionText(log.action_type, log.new_status),
        performedBy: log.action_by_name
      }));
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      return [];
    }
  }, [itemId, itemType]);

  /**
   * Fetch current reviewer assignment
   */
  const fetchReviewerAssignment = useCallback(async (): Promise<{
    reviewerId: string | null;
    reviewerName: string | null;
    status: string | null;
    assignedAt: string | null;
    dueDate: string | null;
  }> => {
    try {
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        return { reviewerId: null, reviewerName: null, status: null, assignedAt: null, dueDate: null };
      }

      // Get the latest review cycle
      const { data: cycleData } = await supabase
        .from('wf_review_cycles')
        .select('id')
        .eq('content_id', itemId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cycleData?.id) {
        return { reviewerId: null, reviewerName: null, status: null, assignedAt: null, dueDate: null };
      }

      // Get primary assignment for this cycle
      const { data: assignment, error } = await supabase
        .from('wf_review_assignments')
        .select('assigned_reviewer_id, assigned_reviewer_name, status, assigned_at, due_date')
        .eq('review_cycle_id', cycleData.id)
        .eq('assignment_type', 'Primary')
        .in('status', ['Assigned', 'Accepted', 'In Progress'])
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch reviewer assignment:', error);
        return { reviewerId: null, reviewerName: null, status: null, assignedAt: null, dueDate: null };
      }

      if (!assignment) {
        return { reviewerId: null, reviewerName: null, status: null, assignedAt: null, dueDate: null };
      }

      return {
        reviewerId: assignment.assigned_reviewer_id,
        reviewerName: assignment.assigned_reviewer_name,
        status: assignment.status,
        assignedAt: assignment.assigned_at,
        dueDate: assignment.due_date
      };
    } catch (error) {
      console.error('Failed to fetch reviewer assignment:', error);
      return { reviewerId: null, reviewerName: null, status: null, assignedAt: null, dueDate: null };
    }
  }, [itemId]);

  /**
   * Reassign reviewer to a different reviewer
   */
  const reassignReviewer = useCallback(async (newReviewerId: string, newReviewerName: string): Promise<boolean> => {
    try {
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      // Get the latest review cycle
      const { data: cycleData } = await supabase
        .from('wf_review_cycles')
        .select('id')
        .eq('content_id', itemId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cycleData?.id) {
        console.warn('No review cycle found for reassignment');
        return false;
      }

      // Mark existing primary assignment as Reassigned
      await supabase
        .from('wf_review_assignments')
        .update({ status: 'Reassigned' })
        .eq('review_cycle_id', cycleData.id)
        .eq('assignment_type', 'Primary')
        .in('status', ['Assigned', 'Accepted', 'In Progress']);

      // Create new assignment
      const auditUserId = getUserId() || '00000000-0000-0000-0000-000000000000';
      const auditUserName = getUserName();

      const { error: assignError } = await supabase
        .from('wf_review_assignments')
        .insert({
          review_cycle_id: cycleData.id,
          content_id: itemId,
          assigned_reviewer_id: newReviewerId,
          assigned_reviewer_name: newReviewerName,
          assignment_type: 'Primary',
          assigned_by: auditUserId,
          assigned_by_name: auditUserName,
          status: 'Assigned',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (assignError) {
        console.error('Failed to create reassignment:', assignError);
        throw assignError;
      }

      // Update review cycle
      await supabase
        .from('wf_review_cycles')
        .update({
          assigned_reviewer_id: newReviewerId,
          assigned_reviewer_name: newReviewerName
        })
        .eq('id', cycleData.id);

      // Log reassignment action
      await supabase
        .from('wf_review_actions')
        .insert({
          review_cycle_id: cycleData.id,
          content_id: itemId,
          action_type: 'Reassign',
          action_by: auditUserId,
          action_by_name: auditUserName,
          previous_status: currentStatus,
          new_status: currentStatus,
          metadata: {
            previous_reviewer_id: null, // Could be fetched if needed
            new_reviewer_id: newReviewerId,
            new_reviewer_name: newReviewerName
          }
        });

      if (showToast) {
        showToast(`Reviewer reassigned to ${newReviewerName}`, 'success');
      }

      return true;
    } catch (error) {
      console.error('Failed to reassign reviewer:', error);
      if (showToast) {
        showToast('Failed to reassign reviewer. Please try again.', 'error');
      }
      return false;
    }
  }, [itemId, currentStatus, showToast]);

  /**
   * Get list of eligible reviewers for reassignment
   */
  const getEligibleReviewers = useCallback(async (): Promise<ReviewerCandidate[]> => {
    try {
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        return [];
      }

      // Get content organization_id
      const { data: contentData } = await supabase
        .from(tableName)
        .select('organization_id')
        .eq('id', itemId)
        .maybeSingle();

      const contentOrganizationId = contentData?.organization_id || null;

      return await findAndRankReviewers(supabase, contentOrganizationId);
    } catch (error) {
      console.error('Failed to get eligible reviewers:', error);
      return [];
    }
  }, [itemId, tableName]);

  /**
   * Resolve a rejection comment
   */
  const resolveComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not available');
      }

      // Determine comment table
      const isServiceComment = tableName === 'mktplc_services' || tableName === 'marketplace_services';
      const commentTable = isServiceComment ? 'mktplc_service_comments' : 'wf_review_comments';

      const { error } = await supabase
        .from(commentTable)
        .update({
          is_resolved: true,
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', commentId)
        .eq('comment_type', 'Rejection');

      if (error) {
        console.error('Failed to resolve comment:', error);
        throw error;
      }

      if (showToast) {
        showToast('Rejection comment resolved', 'success');
      }

      return true;
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      if (showToast) {
        showToast('Failed to resolve comment. Please try again.', 'error');
      }
      return false;
    }
  }, [tableName, showToast]);

  /**
   * Check if there are unresolved rejection comments
   */
  const hasUnresolvedRejections = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = (tableName === 'marketplace_services')
        ? supabase2
        : (getServiceRoleClient() || getSupabaseClient());

      if (!supabase) {
        return false;
      }

      // Determine comment table
      const isServiceComment = tableName === 'mktplc_services' || tableName === 'marketplace_services';
      const commentTable = isServiceComment ? 'mktplc_service_comments' : 'wf_review_comments';
      const foreignKeyField = isServiceComment ? 'service_id' : 'content_id';

      const { data, error } = await supabase
        .from(commentTable)
        .select('id')
        .eq(foreignKeyField, itemId)
        .eq('comment_type', 'Rejection')
        .eq('is_resolved', false)
        .limit(1);

      if (error) {
        console.error('Failed to check unresolved rejections:', error);
        return false;
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Failed to check unresolved rejections:', error);
      return false;
    }
  }, [itemId, tableName]);

  return {
    loading,
    getCurrentStep,
    transitionStatus,
    submitComment,
    fetchComments,
    fetchAuditLog,
    fetchReviewerAssignment,
    reassignReviewer,
    getEligibleReviewers,
    resolveComment,
    hasUnresolvedRejections
  };
}

