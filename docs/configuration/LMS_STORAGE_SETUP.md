# LMS Storage Setup Guide

## Overview

The LMS system supports file uploads with a structured bucket organization:
```
lms-content/
  course/
    {course-slug}/
      {module-slug}/          (optional)
        videos/
          {item-id}-{filename}
        images/
          {item-id}-{filename}
        documents/
          {item-id}-{filename}
```

## Storage Options

### Option 1: Supabase Storage (Recommended)

Supabase Storage is integrated and easier to manage for Supabase projects.

#### Setup Steps:

1. **Create the bucket in Supabase Dashboard:**
   - Go to Storage → Create Bucket
   - Name: `lms-content`
   - Public: Yes (for course content)
   - File size limit: 50MB
   - Allowed MIME types: Add image/*, video/*, application/pdf

2. **Run the SQL setup script:**
   ```sql
   -- Run database/setup_supabase_storage.sql in Supabase SQL Editor
   ```

3. **Update your code to use Supabase Storage:**
   ```typescript
   // In your form components, change:
   import { uploadLMSFile } from '@/lib/lmsStorageProvider';
   
   // To:
   import { uploadLMSFileSupabase } from '@/lib/lmsStorageProviderSupabase';
   ```

#### Environment Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_URL` - Frontend Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Option 2: Azure Storage

Azure Storage supports larger files and chunked uploads for videos > 50MB.

#### Setup Steps:

1. **Create Azure Storage Account:**
   - Create a storage account in Azure Portal
   - Create a container named `lms-content`
   - Set container access level to "Blob" (public read)

2. **Configure Environment Variables:**
   ```env
   AZURE_STORAGE_ACCOUNT=your-storage-account
   AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
   AZURE_STORAGE_CONTAINER=lms-content
   AZURE_CDN_URL=https://your-cdn.azureedge.net  # Optional
   ```

3. **Configure CORS:**
   - In Azure Portal → Storage Account → CORS
   - Add your frontend domain
   - Allowed methods: PUT, GET, HEAD, OPTIONS
   - Allowed headers: *

#### Large File Uploads (>50MB)

For videos larger than 50MB, the system automatically uses chunked upload:
- Files are split into 4MB chunks
- Each chunk is uploaded separately
- Chunks are committed together

## File Path Structure

### Examples:

**Learning Path Image:**
```
lms-content/course/introduction-to-cloud/images/path-abc123-image.jpg
```

**Course Image:**
```
lms-content/course/introduction-to-cloud/images/course-def456-image.jpg
```

**Lesson Video (with module):**
```
lms-content/course/introduction-to-cloud/module-1-basics/videos/lesson-ghi789-video.mp4
```

**Lesson Video (no module):**
```
lms-content/course/introduction-to-cloud/videos/lesson-ghi789-video.mp4
```

## Usage in Forms

### Learning Path Form:
```typescript
const result = await uploadLMSFile({
  file: imageFile,
  courseSlug: formData.slug || 'temp-slug',
  itemType: 'image',
  itemId: id,
});
```

### Course Form:
```typescript
const result = await uploadLMSFile({
  file: imageFile,
  courseSlug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
  itemType: 'image',
  itemId: id,
});
```

### Lesson Form (Video):
```typescript
const result = await uploadLMSFile({
  file: videoFile,
  courseSlug: selectedCourse.slug,
  moduleSlug: undefined, // Can be added when modules are linked
  itemType: 'video',
  itemId: id,
});
```

## File Size Limits

- **Images**: 50MB limit
- **Videos**: No hard limit (uses chunked upload for >50MB)
- **Documents**: 50MB limit

## Troubleshooting

### Upload Fails with CORS Error
- **Azure**: Check CORS settings in Azure Portal
- **Supabase**: Check bucket policies in Supabase Dashboard

### Large Video Upload Fails
- Check network connection stability
- Verify chunked upload is enabled
- Check Azure Storage account limits

### File Not Found After Upload
- Verify public URL is correct
- Check bucket permissions
- Ensure file was uploaded to correct path

## Migration from Old Storage

If you have existing files in a different structure:

1. **List old files:**
   ```sql
   SELECT * FROM storage.objects WHERE bucket_id = 'old-bucket';
   ```

2. **Migrate files:**
   - Use Supabase Storage API or Azure Storage SDK
   - Copy files to new structure
   - Update database records with new URLs

3. **Update references:**
   ```sql
   UPDATE lms_courses 
   SET image_url = REPLACE(image_url, 'old-path', 'new-path')
   WHERE image_url LIKE '%old-path%';
   ```



