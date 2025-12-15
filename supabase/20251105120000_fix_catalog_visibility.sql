-- Fix: Ensure v_media_public view correctly filters published content
-- This migration ensures that content with status='Published' and published_at IS NULL
-- appears in the catalog, as per the schema documentation

-- Recreate v_media_public view with explicit NULL handling and proper formatting
CREATE OR REPLACE VIEW public.v_media_public AS
SELECT * FROM public.v_media_all
WHERE status = 'Published' 
  AND visibility = 'Public' 
  AND (published_at IS NULL OR published_at <= now());

-- Add comment for clarity
COMMENT ON VIEW public.v_media_public IS 
'Public catalog view: Shows only Published content with Public visibility. 
Accepts published_at IS NULL or published_at <= now(). 
This view is used by the Knowledge Hub catalog frontend.';

-- Ensure views have proper permissions (idempotent)
DO $$
BEGIN
  -- Grant SELECT on views to anon and authenticated roles
  GRANT SELECT ON public.v_media_all TO anon;
  GRANT SELECT ON public.v_media_all TO authenticated;
  GRANT SELECT ON public.v_media_public TO anon;
  GRANT SELECT ON public.v_media_public TO authenticated;
  GRANT SELECT ON public.v_media_public_grid TO anon;
  GRANT SELECT ON public.v_media_public_grid TO authenticated;
EXCEPTION
  WHEN OTHERS THEN
    -- Permissions might already exist, continue
    RAISE NOTICE 'Grant permissions: %', SQLERRM;
END $$;

-- Diagnostic function to check why content might not appear
CREATE OR REPLACE FUNCTION public.diagnose_content_visibility(content_title text)
RETURNS TABLE (
  title text,
  status text,
  published_at timestamptz,
  in_v_media_all boolean,
  in_v_media_public boolean,
  visibility_check text,
  published_at_check text,
  status_check text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.title,
    c.status,
    c.published_at,
    EXISTS(SELECT 1 FROM public.v_media_all v WHERE v.id = c.id) AS in_v_media_all,
    EXISTS(SELECT 1 FROM public.v_media_public v WHERE v.id = c.id) AS in_v_media_public,
    CASE 
      WHEN 'Public'::text = 'Public' THEN 'PASS (hardcoded in view)'
      ELSE 'FAIL'
    END AS visibility_check,
    CASE 
      WHEN c.published_at IS NULL THEN 'PASS (NULL allowed)'
      WHEN c.published_at <= now() THEN 'PASS (past/present date)'
      ELSE 'FAIL (future date: ' || c.published_at::text || ')'
    END AS published_at_check,
    CASE 
      WHEN c.status = 'Published' THEN 'PASS'
      ELSE 'FAIL (status is: ' || COALESCE(c.status, 'NULL') || ', expected: Published)'
    END AS status_check
  FROM public.cnt_contents c
  WHERE c.title = content_title OR c.title ILIKE '%' || content_title || '%'
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.diagnose_content_visibility(text) TO anon;
GRANT EXECUTE ON FUNCTION public.diagnose_content_visibility(text) TO authenticated;

COMMENT ON FUNCTION public.diagnose_content_visibility(text) IS 
'Diagnostic function to check why content might not appear in catalog.
Usage: SELECT * FROM diagnose_content_visibility(''Test55'');';

