-- Migration: Update storage policies to allow authenticated and anon users
-- This fixes the RLS policy error for storage uploads

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload LMS content" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update LMS content" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete LMS content" ON storage.objects;

-- Create updated policies that allow both authenticated and anon users
-- (anon users can upload when using anon key)
CREATE POLICY "Allow authenticated users to upload LMS content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lms-content'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Allow authenticated users to update LMS content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lms-content'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Allow authenticated users to delete LMS content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lms-content'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);



