-- Recreate _jtxt helper function that was accidentally removed during cleanup
-- This function is used by create_media_item and update_media_item functions
-- It extracts text values from jsonb, returning empty string for NULL

CREATE OR REPLACE FUNCTION public._jtxt(j jsonb, key text) 
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
AS $$ 
  SELECT NULLIF(j->>key, '') 
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public._jtxt(jsonb, text) TO anon, authenticated, service_role;

-- Add comment
COMMENT ON FUNCTION public._jtxt(jsonb, text) IS 'Extract text value from jsonb, returning empty string for NULL. Used by create_media_item and update_media_item functions.';

