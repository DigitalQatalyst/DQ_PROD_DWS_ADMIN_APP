-- Migration: Add flag tracking fields to cnt_contents table
-- Date: 2025-01-28
-- Description: Adds flag_count and flagged_at fields to track content flags

ALTER TABLE cnt_contents 
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;

COMMENT ON COLUMN cnt_contents.flag_count IS 'Number of times content has been flagged for review';
COMMENT ON COLUMN cnt_contents.flagged_at IS 'Timestamp when content was last flagged for review';

-- Create index on flagged_at for efficient querying of flagged content
CREATE INDEX IF NOT EXISTS idx_cnt_contents_flagged_at ON cnt_contents(flagged_at);

-- Create index on flag_count for querying frequently flagged content
CREATE INDEX IF NOT EXISTS idx_cnt_contents_flag_count ON cnt_contents(flag_count);

