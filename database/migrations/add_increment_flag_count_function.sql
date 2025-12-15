-- Migration: Create increment_flag_count function
-- Date: 2025-01-28
-- Description: Creates a Postgres function to atomically increment flag_count

CREATE OR REPLACE FUNCTION increment_flag_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE cnt_contents
  SET flag_count = COALESCE(flag_count, 0) + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_flag_count(UUID) IS 'Atomically increments the flag_count for a content item';

