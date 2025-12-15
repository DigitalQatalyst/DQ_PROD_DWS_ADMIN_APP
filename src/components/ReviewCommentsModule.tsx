import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XIcon,
  MessageSquareIcon,
  ClockIcon,
  FlagIcon,
  ArchiveIcon,
  AlertCircleIcon,
  UserIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Can } from './auth/Can';
import { useReviewWorkflow, ReviewComment as WorkflowComment } from '../hooks/useReviewWorkflow';
import { useAuth } from '../context/AuthContext';

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  comment_type?: string;
  action_type?: string;
  related_status_change?: string;
  is_resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface Activity {
  date: string;
  action: string;
  performedBy: string;
}

interface ReviewCommentsModuleProps {
  // Item identification
  itemId: string;
  itemType: 'Content' | 'Service' | 'Business';
  currentStatus: string;

  // Status helpers
  isDraft?: boolean;
  isPending?: boolean;
  isPublished?: boolean;
  isArchived?: boolean;
  isRejected?: boolean;

  // Callbacks
  onApprove?: () => void;
  onReject?: () => void;
  onSendBack?: () => void;
  onUnpublish?: () => void;
  onArchive?: () => void;
  onFlag?: () => void;

  // Permissions (computed from CASL)
  canApprove: boolean;
  canReject: boolean;
  canSendBack: boolean;
  canUnpublish: boolean;
  canArchive: boolean;
  canFlag: boolean;

  // Data (optional - can be loaded from database)
  comments?: Comment[];
  activityLog?: Activity[];
  onAddComment?: (comment: string) => void;

  // NEW: Workflow integration
  tableName?: string; // e.g., 'cnt_contents', 'mktplc_services'
  onStatusChange?: (newStatus: string) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export const ReviewCommentsModule: React.FC<ReviewCommentsModuleProps> = ({
  itemId,
  itemType,
  currentStatus,
  isDraft = false,
  isPending = false,
  isPublished = false,
  isArchived = false,
  isRejected = false,
  onApprove,
  onReject,
  onSendBack,
  onUnpublish,
  onArchive,
  onFlag,
  canApprove,
  canReject,
  canSendBack,
  canUnpublish,
  canArchive,
  canFlag,
  comments = [],
  activityLog = [],
  onAddComment,
  tableName,
  onStatusChange,
  showToast
}) => {
  const [newComment, setNewComment] = useState('');
  const [workflowComments, setWorkflowComments] = useState<Comment[]>(comments);
  const [workflowActivity, setWorkflowActivity] = useState<Activity[]>(activityLog);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // State for reject/send back modals
  const [showRejectNoteModal, setShowRejectNoteModal] = useState(false);
  const [showSendBackNoteModal, setShowSendBackNoteModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [sendBackNote, setSendBackNote] = useState('');

  // Pagination state for audit trail
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reviewer assignment state
  const [reviewerAssignment, setReviewerAssignment] = useState<{
    reviewerId: string | null;
    reviewerName: string | null;
    status: string | null;
    assignedAt: string | null;
    dueDate: string | null;
  } | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [eligibleReviewers, setEligibleReviewers] = useState<Array<{
    user_id: string;
    name: string;
    role: string;
    workload: number;
  }>>([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [hasUnresolvedRejections, setHasUnresolvedRejections] = useState(false);
  const [resolvingCommentId, setResolvingCommentId] = useState<string | null>(null);

  // Get color scheme based on comment type
  const getCommentTypeStyles = (commentType?: string) => {
    const type = commentType || 'Review';
    const styles: Record<string, { bg: string; border: string; text: string; badge: string; }> = {
      'Rejection': {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800 border-red-200'
      },
      'Revision': {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      'Approval': {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800 border-green-200'
      },
      'action_note': {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      'System': {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-900',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      },
      'General': {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      'Review': {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    };
    return styles[type] || styles['Review'];
  };

  // Format comment text - clean up redundant mentions and improve readability
  const formatCommentText = (text: string, author?: string) => {
    if (!text) return '';

    let cleaned = text.trim();

    // Remove common prefixes that are redundant (we show type badge separately)
    cleaned = cleaned.replace(/^(Rejection reason|Sent back for revision|Reason):\s*/i, '');

    // Remove trailing @mentions that match the author (redundant)
    if (author) {
      // Remove patterns like "@Author Name" or "@Author Name – org" at the end
      const authorMentionPattern = new RegExp(`\\s*@${author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*$`, 'i');
      cleaned = cleaned.replace(authorMentionPattern, '').trim();
    }

    // Handle newlines - convert to <br> for proper display
    cleaned = cleaned.replace(/\n/g, '<br>');

    // Replace @mentions with styled spans for better visibility
    cleaned = cleaned.replace(/@([^\s\n<]+)/g, '<span class="font-semibold text-blue-700">@$1</span>');

    return cleaned;
  };

  // Get display label for comment type
  const getCommentTypeLabel = (commentType?: string, actionType?: string) => {
    if (actionType) {
      const actionLabels: Record<string, string> = {
        'Reject': 'Rejection',
        'Send Back': 'Revision',
        'Unpublish': 'Unpublished',
        'Archive': 'Archived',
        'Flag': 'Flagged',
        'Approve': 'Approval',
        'Publish': 'Published'
      };
      return actionLabels[actionType] || actionType;
    }

    const typeLabels: Record<string, string> = {
      'Rejection': 'Rejection',
      'Revision': 'Revision',
      'Approval': 'Approval',
      'action_note': 'Action Note',
      'System': 'System',
      'General': 'General',
      'Review': 'Review'
    };
    return typeLabels[commentType || 'Review'] || 'Comment';
  };

  // Calculate all status flags from currentStatus prop (don't rely on parent)
  const computedIsDraft = currentStatus === 'Draft' || currentStatus.toLowerCase() === 'draft';
  const computedIsPending = currentStatus === 'Pending Review' || currentStatus.toLowerCase() === 'pending review';
  const computedIsPublished = currentStatus === 'Published' || currentStatus.toLowerCase() === 'published';
  const computedIsArchived = currentStatus === 'Archived' || currentStatus.toLowerCase() === 'archived';
  const computedIsRejected = currentStatus === 'Rejected' || currentStatus.toLowerCase() === 'rejected';

  // Use computed values if props not provided, otherwise use props (allows override)
  const finalIsDraft = isDraft !== false ? isDraft : computedIsDraft;
  const finalIsPending = isPending !== false ? isPending : computedIsPending;
  const finalIsPublished = isPublished !== false ? isPublished : computedIsPublished;
  const finalIsArchived = isArchived !== false ? isArchived : computedIsArchived;
  const finalIsRejected = isRejected !== false ? isRejected : computedIsRejected;

  // Get current user for tagging
  const { user } = useAuth();
  const currentUserName = user?.name || 'Unknown';

  // Initialize workflow hook if tableName is provided
  const workflow = tableName ? useReviewWorkflow({
    itemId,
    itemType: itemType.toLowerCase() as 'content' | 'service' | 'business',
    currentStatus,
    tableName,
    onStatusChange,
    showToast
  }) : null;

  // Fetch comments, activity, and reviewer assignment from database on mount
  useEffect(() => {
    if (!workflow) return;

    const loadData = async () => {
      setLoadingComments(true);
      const fetchedComments = await workflow.fetchComments();
      setWorkflowComments(fetchedComments);
      setLoadingComments(false);

      // Check for unresolved rejection comments
      if (finalIsRejected) {
        const unresolved = await workflow.hasUnresolvedRejections();
        setHasUnresolvedRejections(unresolved);
      } else {
        setHasUnresolvedRejections(false);
      }

      setLoadingActivity(true);
      const fetchedActivity = await workflow.fetchAuditLog();
      setWorkflowActivity(fetchedActivity);
      setLoadingActivity(false);

      // Fetch reviewer assignment
      const assignment = await workflow.fetchReviewerAssignment();
      setReviewerAssignment(assignment);
    };

    loadData();
    // Reset to first page when itemId or status changes
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, currentStatus, finalIsRejected]); // Removed workflow to prevent infinite loop

  // Update local state when props change
  useEffect(() => {
    if (comments.length > 0) {
      setWorkflowComments(comments);
    }
  }, [comments]);

  useEffect(() => {
    if (activityLog.length > 0) {
      setWorkflowActivity(activityLog);
    }
  }, [activityLog]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // Use workflow hook if available
    if (workflow) {
      try {
        const comment = await workflow.submitComment(newComment.trim());
        if (comment) {
          console.log('✅ Comment submitted successfully:', comment);
          setWorkflowComments([comment, ...workflowComments]);
          setNewComment('');
        } else {
          console.warn('⚠️ Comment submission returned null - error handling in workflow hook');
        }
      } catch (error) {
        console.error('❌ Error in handleAddComment:', error);
      }
    }
    // Fall back to callback if provided
    else if (onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  // Handle reject with required note
  const handleRejectWithNote = async () => {
    if (!rejectNote.trim()) {
      if (showToast) {
        showToast('Please provide a reason for rejection', 'error');
      }
      return;
    }

    if (workflow) {
      try {
        // First, create comment with approver tagged - this must succeed before status update
        const commentText = `Rejection reason: ${rejectNote.trim()}\n\n@${currentUserName}`;

        // Pass metadata for service comments
        const commentMetadata = tableName === 'mktplc_services' ? {
          comment_type: 'Rejection',
          related_status_change: 'Rejected',
          action_type: 'Reject',
          visibility: 'All'
        } : {};

        const comment = await workflow.submitComment(commentText, commentMetadata);

        // If comment failed to be added, do not proceed with status update
        if (!comment) {
          if (showToast) {
            showToast('Failed to add comment. Status was not updated.', 'error');
          }
          return;
        }

        // Only update status if comment was successfully added
        const mappedStatus = tableName === 'mktplc_services' ? 'Rejected' : 'Rejected';
        const success = await workflow.transitionStatus('Reject', mappedStatus, currentStatus, {
          reason: rejectNote.trim(),
          notes: rejectNote.trim()
        });

        if (success) {
          setWorkflowComments([comment, ...workflowComments]);
          if (onStatusChange) {
            onStatusChange(mappedStatus);
          }
          setShowRejectNoteModal(false);
          setRejectNote('');
          if (showToast) {
            showToast('Service rejected successfully', 'success');
          }
        } else {
          // Status update failed, but comment was added - show warning
          setWorkflowComments([comment, ...workflowComments]);
          if (showToast) {
            showToast('Comment added but status update failed. Please try updating status manually.', 'error');
          }
        }
      } catch (error) {
        console.error('Error rejecting service:', error);
        if (showToast) {
          showToast('Failed to reject service. Please try again.', 'error');
        }
      }
    } else if (onReject) {
      onReject();
      setShowRejectNoteModal(false);
      setRejectNote('');
    }
  };

  // Handle send back with required note
  const handleSendBackWithNote = async () => {
    if (!sendBackNote.trim()) {
      if (showToast) {
        showToast('Please provide feedback for sending back', 'error');
      }
      return;
    }

    if (workflow) {
      try {
        // First, create comment with approver tagged - this must succeed before status update
        const commentText = `Sent back for revision: ${sendBackNote.trim()}\n\n@${currentUserName}`;

        // Pass metadata for service comments
        const commentMetadata = tableName === 'mktplc_services' ? {
          comment_type: 'Revision',
          related_status_change: 'Draft',
          action_type: 'Send Back',
          visibility: 'All'
        } : {};

        const comment = await workflow.submitComment(commentText, commentMetadata);

        // If comment failed to be added, do not proceed with status update
        if (!comment) {
          if (showToast) {
            showToast('Failed to add comment. Status was not updated.', 'error');
          }
          return;
        }

        // Only update status if comment was successfully added
        const mappedStatus = tableName === 'mktplc_services' ? 'Draft' : 'Draft';
        const success = await workflow.transitionStatus('Send Back', mappedStatus, currentStatus, {
          reason: sendBackNote.trim(),
          notes: sendBackNote.trim()
        });

        if (success) {
          setWorkflowComments([comment, ...workflowComments]);
          if (onStatusChange) {
            onStatusChange(mappedStatus);
          }
          setShowSendBackNoteModal(false);
          setSendBackNote('');
          if (showToast) {
            showToast('Service sent back successfully', 'success');
          }
        } else {
          // Status update failed, but comment was added - show warning
          setWorkflowComments([comment, ...workflowComments]);
          if (showToast) {
            showToast('Comment added but status update failed. Please try updating status manually.', 'error');
          }
        }
      } catch (error) {
        console.error('Error sending back service:', error);
        if (showToast) {
          showToast('Failed to send back service. Please try again.', 'error');
        }
      }
    } else if (onSendBack) {
      onSendBack();
      setShowSendBackNoteModal(false);
      setSendBackNote('');
    }
  };

  // Render approval flow tracker - Enterprise UX Pattern
  const renderApprovalFlow = () => {
    const getStepStatus = (step: number) => {
      if (finalIsRejected) return step <= 1 ? 'completed' : 'rejected';
      if (finalIsArchived) return step <= 2 ? 'completed' : 'current';
      if (finalIsPublished) return step <= 2 ? 'completed' : 'completed';
      if (finalIsPending) return step <= 1 ? 'completed' : 'current';
      if (finalIsDraft) return step === 1 ? 'current' : 'pending';
      return 'pending';
    };

    const steps = [
      { id: 1, label: 'Draft', description: 'Content preparation' },
      { id: 2, label: 'Review', description: 'Internal review' },
      { id: 3, label: 'Published', description: 'Live content' }
    ];

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Content Lifecycle
        </h3>
        {/* Nodes with connectors, with labels placed directly under each node */}
        <div className="flex items-start">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isActive = status === 'current';
            const isCompleted = status === 'completed';
            const isRejected = status === 'rejected';

            const nodeClass = isRejected
              ? 'bg-red-500 text-white'
              : isCompleted
                ? 'bg-blue-500 text-white'
                : isActive
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-400';

            // Determine connector color to next step
            const nextCompleted = getStepStatus(step.id + 1) === 'completed';
            const connectorClass = isRejected
              ? 'bg-red-200'
              : nextCompleted || isCompleted
                ? 'bg-blue-500'
                : 'bg-gray-200';

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${nodeClass}`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                      {step.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mt-4 ${connectorClass}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 lg:px-8">
      {/* Approval Flow Tracker */}
      {renderApprovalFlow()}

      {/* Workflow Status - Enterprise UX Pattern */}
      {(() => {
        const getWorkflowStatus = () => {
          if (finalIsRejected) {
            return {
              status: 'Rejected',
              description: 'This content has been rejected and requires revisions before resubmission.',
              nextAction: 'Edit to address feedback and resubmit',
              color: 'red'
            };
          }
          if (finalIsArchived) {
            return {
              status: 'Archived',
              description: 'This content has been archived and is no longer active.',
              nextAction: 'Restore to make it live again',
              color: 'gray'
            };
          }
          if (finalIsPublished) {
            return {
              status: 'Live',
              description: 'This content is published and visible to users.',
              nextAction: 'Unpublish to remove from public view',
              color: 'green'
            };
          }
          if (finalIsPending) {
            return {
              status: 'Under Review',
              description: 'Awaiting approval from internal reviewers.',
              nextAction: 'Approve to publish or send back for revisions',
              color: 'yellow'
            };
          }
          if (finalIsDraft) {
            return {
              status: 'Draft',
              description: 'Content is being prepared and not yet submitted for review.',
              nextAction: 'Submit for review when ready',
              color: 'blue'
            };
          }
          return {
            status: 'Unknown',
            description: 'Status unclear',
            nextAction: 'Contact support',
            color: 'gray'
          };
        };

        const workflow = getWorkflowStatus();
        const colorClasses = {
          gray: 'bg-gray-100 text-gray-800 border-gray-200',
          green: 'bg-green-100 text-green-800 border-green-200',
          yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          blue: 'bg-blue-100 text-blue-800 border-blue-200',
          red: 'bg-red-100 text-red-800 border-red-200'
        };

        return (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[workflow.color as keyof typeof colorClasses]}`}>
                    {workflow.status}
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {workflow.description}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Next: {workflow.nextAction}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reviewer Assignment */}
      {finalIsPending && reviewerAssignment?.reviewerName && (
        <div className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assigned Reviewer
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600 font-medium">
                  {reviewerAssignment.reviewerName}
                </p>
                <span className="text-sm text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                  {reviewerAssignment.status || 'Assigned'}
                </span>
              </div>
              {reviewerAssignment.dueDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Due: {new Date(reviewerAssignment.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
            {workflow && (canApprove || canReject) && (
              <button
                type="button"
                onClick={async () => {
                  setLoadingReviewers(true);
                  const reviewers = await workflow.getEligibleReviewers();
                  setEligibleReviewers(reviewers.map(r => ({
                    user_id: r.user_id,
                    name: r.name,
                    role: r.role,
                    workload: r.workload
                  })));
                  setLoadingReviewers(false);
                  setShowReassignModal(true);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                <RefreshCwIcon className="h-4 w-4 mr-1.5" />
                Reassign
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowReassignModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reassign Reviewer
              </h3>
              {loadingReviewers ? (
                <p className="text-sm text-gray-500">Loading reviewers...</p>
              ) : eligibleReviewers.length === 0 ? (
                <p className="text-sm text-gray-500">No eligible reviewers found</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {eligibleReviewers.map((reviewer) => (
                    <button
                      key={reviewer.user_id}
                      type="button"
                      onClick={async () => {
                        if (workflow) {
                          const success = await workflow.reassignReviewer(reviewer.user_id, reviewer.name);
                          if (success) {
                            const assignment = await workflow.fetchReviewerAssignment();
                            setReviewerAssignment(assignment);
                            setShowReassignModal(false);
                          }
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${reviewer.user_id === reviewerAssignment?.reviewerId
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reviewer.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {reviewer.role} • {reviewer.workload} active assignment{reviewer.workload !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {reviewer.user_id === reviewerAssignment?.reviewerId && (
                          <span className="text-sm text-blue-600 font-medium">Current</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {(() => {
        // Count available actions to show/hide section
        const hasPublishedActions = finalIsPublished && (canUnpublish || canFlag || canArchive);
        const hasArchivedActions = finalIsArchived;
        const hasDraftActions = finalIsDraft;
        const hasRejectedActions = finalIsRejected;
        const hasPendingActions = !finalIsPublished && !finalIsArchived && !finalIsDraft && !finalIsRejected && (canApprove || canReject || canSendBack);
        const hasAnyActions = hasPublishedActions || hasArchivedActions || hasDraftActions || hasRejectedActions || hasPendingActions;

        if (!hasAnyActions) return null;

        return (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {finalIsPublished ? (
                <>
                  <Can I="publish" a={itemType as any} fallback={null}>
                    {canUnpublish && onUnpublish && (
                      <button
                        type="button"
                        onClick={onUnpublish}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        Unpublish
                      </button>
                    )}
                  </Can>
                  <Can I="flag" a={itemType as any} fallback={null}>
                    {canFlag && onFlag && (
                      <button
                        type="button"
                        onClick={onFlag}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-150"
                      >
                        <FlagIcon className="h-4 w-4 mr-1.5" />
                        Flag for Review
                      </button>
                    )}
                  </Can>
                  <Can I="archive" a={itemType as any} fallback={null}>
                    {canArchive && onArchive && (
                      <button
                        type="button"
                        onClick={onArchive}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
                      >
                        <ArchiveIcon className="h-4 w-4 mr-1.5" />
                        Archive
                      </button>
                    )}
                  </Can>
                </>
              ) : finalIsArchived ? (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                    onClick={async () => {
                      if (workflow) {
                        const success = await workflow.transitionStatus('Restore', 'Published', currentStatus);
                        if (success && onStatusChange) {
                          onStatusChange('Published');
                        }
                      }
                    }}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    onClick={() => {
                      // Navigate to edit page with content data in state
                      if (typeof window !== 'undefined') {
                        const contentData = {
                          id: itemId,
                          status: currentStatus
                        };
                        window.history.pushState({ content: contentData }, '', `/content-form/${itemId}`);
                        window.location.href = `/content-form/${itemId}`;
                      }
                    }}
                  >
                    Edit
                  </button>
                </>
              ) : finalIsRejected ? (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    onClick={() => {
                      // Navigate to edit page with content data in state
                      if (typeof window !== 'undefined') {
                        const contentData = {
                          id: itemId,
                          status: currentStatus
                        };
                        window.history.pushState({ content: contentData }, '', `/service-form/${itemId}`);
                        window.location.href = `/service-form/${itemId}`;
                      }
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (workflow) {
                        // Check for unresolved rejections before resubmitting
                        const hasUnresolved = await workflow.hasUnresolvedRejections();
                        if (hasUnresolved) {
                          if (showToast) {
                            showToast('Please resolve all rejection comments before resubmitting', 'error');
                          }
                          return;
                        }

                        const success = await workflow.transitionStatus('Resubmit', 'Pending Review', currentStatus);
                        if (success && onStatusChange) {
                          onStatusChange('Pending Review');
                        }
                      }
                    }}
                    disabled={hasUnresolvedRejections || (workflow?.loading || false)}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${hasUnresolvedRejections
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    title={hasUnresolvedRejections ? 'Please resolve all rejection comments before resubmitting' : ''}
                  >
                    Resubmit for Review
                  </button>
                  {hasUnresolvedRejections && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ Please resolve all rejection comments before resubmitting
                    </p>
                  )}
                </>
              ) : finalIsDraft ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (workflow) {
                      const success = await workflow.transitionStatus('Submit', 'Pending Review', currentStatus);
                      if (success && onStatusChange) {
                        onStatusChange('Pending Review');
                      }
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  Submit for Review
                </button>
              ) : (
                <>
                  {canReject && (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                      onClick={() => setShowRejectNoteModal(true)}
                    >
                      Reject
                    </button>
                  )}
                  {canSendBack && (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      onClick={() => setShowSendBackNoteModal(true)}
                    >
                      Send Back
                    </button>
                  )}
                  {canApprove && (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                      onClick={async () => {
                        if (workflow) {
                          const success = await workflow.transitionStatus('Approve', 'Published', currentStatus);
                          if (success && onStatusChange) {
                            onStatusChange('Published');
                          }
                        } else if (onApprove) {
                          onApprove();
                        }
                      }}
                    >
                      Approve & Publish
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Comments Thread */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reviewer Comments
          {loadingComments && <span className="ml-2 text-sm text-gray-600 font-normal">(Loading...)</span>}
        </h3>
        {workflowComments && workflowComments.length > 0 ? (
          workflowComments.map((comment) => {
            const typeStyles = getCommentTypeStyles(comment.comment_type);
            const typeLabel = getCommentTypeLabel(comment.comment_type, comment.action_type);
            const formattedText = formatCommentText(comment.text, comment.author);

            return (
              <div
                key={comment.id}
                className={`${typeStyles.bg} rounded-lg p-4 border ${typeStyles.border} transition-shadow hover:shadow-sm`}
              >
                {/* Header: Author, Role, Type Badge, Timestamp */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${typeStyles.text} truncate`}>
                      {comment.author}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600 border border-gray-200 whitespace-nowrap">
                      {comment.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyles.badge} whitespace-nowrap`}>
                      {typeLabel}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {comment.timestamp}
                  </span>
                </div>

                {/* Comment Text */}
                <div className={`mt-2 text-sm ${typeStyles.text} leading-relaxed`}>
                  <div
                    dangerouslySetInnerHTML={{ __html: formattedText }}
                    className="prose prose-sm max-w-none"
                  />
                </div>

                {/* Resolution Status and Resolve Button for Rejection Comments */}
                {comment.comment_type === 'Rejection' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    {comment.is_resolved ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Resolved {comment.resolved_at ? `on ${comment.resolved_at}` : ''}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!workflow) return;
                            setResolvingCommentId(comment.id);
                            const success = await workflow.resolveComment(comment.id);
                            if (success) {
                              // Refresh comments to show updated resolution status
                              const fetchedComments = await workflow.fetchComments();
                              setWorkflowComments(fetchedComments);
                              // Update unresolved rejections check
                              const hasUnresolved = await workflow.hasUnresolvedRejections();
                              setHasUnresolvedRejections(hasUnresolved);
                            }
                            setResolvingCommentId(null);
                          }}
                          disabled={resolvingCommentId === comment.id || (workflow?.loading || false)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resolvingCommentId === comment.id ? (
                            <>
                              <RefreshCwIcon className="h-3 w-3 mr-1.5 animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                              Mark as Resolved
                            </>
                          )}
                        </button>
                        <span className="text-xs text-amber-600">Action required</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
            <MessageSquareIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No comments yet.</p>
          </div>
        )}
      </div>

      {/* Add Comment */}
      {(onAddComment || workflow) && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Add a Review Note
          </label>
          <textarea
            id="comment"
            rows={3}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
            placeholder="Add a note or tag a reviewer using @name..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              onClick={handleAddComment}
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {workflowActivity && workflowActivity.length > 0 && (() => {
        const totalPages = Math.ceil(workflowActivity.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedActivities = workflowActivity.slice(startIndex, endIndex);

        return (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Audit Trail
              {loadingActivity && <span className="ml-2 text-sm text-gray-600 font-normal">(Loading...)</span>}
            </h3>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider w-32">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider min-w-0 flex-1">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 tracking-wider w-40">
                        Performed By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedActivities.map((activity, index) => (
                      <tr key={startIndex + index}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                          {activity.date}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {activity.action}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                          {activity.performedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, workflowActivity.length)} of {workflowActivity.length} entries
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ${currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Reject Note Modal */}
      {showRejectNoteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowRejectNoteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowRejectNoteModal(false)}>
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <XIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reject Service
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please provide a reason for rejecting this service. This note will be added to the comments section.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="rejectNote" className="block text-sm font-medium text-gray-700">
                  Reason for rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="rejectNote"
                  name="rejectNote"
                  rows={4}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                  placeholder="Explain why this service is being rejected..."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleRejectWithNote}
                >
                  Reject Service
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowRejectNoteModal(false);
                    setRejectNote('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Back Note Modal */}
      {showSendBackNoteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowSendBackNoteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowSendBackNoteModal(false)}>
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <RefreshCwIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Send Back for Revision
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please provide feedback for sending this service back. This note will be added to the comments section.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="sendBackNote" className="block text-sm font-medium text-gray-700">
                  Feedback for revision <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="sendBackNote"
                  name="sendBackNote"
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                  placeholder="Provide specific feedback for improvements..."
                  value={sendBackNote}
                  onChange={e => setSendBackNote(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSendBackWithNote}
                >
                  Send Back
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowSendBackNoteModal(false);
                    setSendBackNote('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

