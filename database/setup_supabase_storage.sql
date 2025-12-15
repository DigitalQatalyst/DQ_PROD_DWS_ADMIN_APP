-- Supabase Storage Bucket Setup for LMS Content
-- Run this in Supabase SQL Editor after creating the schema

-- Create the lms-content storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lms-content',
  'lms-content',
  true, -- Public bucket for course content
  52428800, -- 50MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lms-content bucket
-- Allow public read access (course content is public)
CREATE POLICY "Allow public read LMS content"
ON storage.objects FOR SELECT
USING (bucket_id = 'lms-content');

-- Storage policies - Allow authenticated users to upload/update/delete
-- For MS Entra ID, we allow authenticated users (auth.role() = 'authenticated')
-- If using anon key, the role will be 'anon' but we still allow uploads
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

