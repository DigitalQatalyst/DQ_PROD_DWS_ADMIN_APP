-- ============================================================================
-- Migration: Add Flag for Review Functionality
-- Date: 2025-01-28
-- Description: Complete migration for Flag for Review feature
-- ============================================================================

-- ============================================================================
-- PART 1: Add flag tracking columns to cnt_contents table
-- ============================================================================

ALTER TABLE cnt_contents 
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;

COMMENT ON COLUMN cnt_contents.flag_count IS 'Number of times content has been flagged for review';
COMMENT ON COLUMN cnt_contents.flagged_at IS 'Timestamp when content was last flagged for review';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_cnt_contents_flagged_at ON cnt_contents(flagged_at);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_flag_count ON cnt_contents(flag_count);

-- ============================================================================
-- PART 2: Create increment_flag_count function
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_flag_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE cnt_contents
  SET flag_count = COALESCE(flag_count, 0) + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_flag_count(UUID) IS 'Atomically increments the flag_count for a content item';

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify columns exist
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'cnt_contents'
  AND column_name IN ('flag_count', 'flagged_at');

-- Verify function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'increment_flag_count';

-- ============================================================================
-- Rollback (if needed)
-- ============================================================================
-- DROP FUNCTION IF EXISTS increment_flag_count(UUID);
-- ALTER TABLE cnt_contents DROP COLUMN IF EXISTS flagged_at;
-- ALTER TABLE cnt_contents DROP COLUMN IF EXISTS flag_count;
-- DROP INDEX IF EXISTS idx_cnt_contents_flagged_at;
-- DROP INDEX IF EXISTS idx_cnt_contents_flag_count;

