-- Migration: Add 'Assign' and 'Reassign' action types to wf_review_actions
-- This migration extends the allowed action types to support automated reviewer assignment

-- Drop the existing constraint
ALTER TABLE wf_review_actions 
DROP CONSTRAINT IF EXISTS review_approval_actions_action_type_check;

-- Add the new constraint with additional action types: 'Assign' and 'Reassign'
ALTER TABLE wf_review_actions
ADD CONSTRAINT review_approval_actions_action_type_check 
CHECK (action_type IN (
  'Submit',
  'Resubmit',
  'Approve',
  'Reject',
  'Send Back',
  'Publish',
  'Unpublish',
  'Archive',
  'Restore',
  'Flag for Review',
  'Assign',
  'Reassign'
));

COMMENT ON CONSTRAINT review_approval_actions_action_type_check ON wf_review_actions IS 
'Updated to include Assign (auto-assignment of reviewer) and Reassign (manual reassignment of reviewer) action types';

