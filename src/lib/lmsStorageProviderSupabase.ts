/**
 * LMS Storage Provider for Supabase Storage
 * Handles file uploads for LMS content with proper bucket structure:
 * /LMS_Uploads/{course-slug}/thumbnail.jpg (for course thumbnails)
 * /LMS_Uploads/{course-slug}/{module-folder}/{lesson-folder}/{content-files} (for lesson content)
 * /LMS_Uploads/{course-slug}/{lesson-folder}/{content-files} (for lessons without modules)
 * 
 * Uses Supabase Storage API directly (better for Supabase projects)
 */

import { getSupabaseClient } from './dbClient';

export type LMSUploadArgs = {
  file: File;
  courseSlug: string;
  moduleOrder?: number; // Module order (e.g., 01, 02)
  moduleTitle?: string; // Module title for folder name
  lessonOrder?: number; // Lesson order (e.g., 01, 02)
  lessonTitle?: string; // Lesson title for folder name
  itemType: 'thumbnail' | 'image' | 'video' | 'document';
  itemId?: string;
  onProgress?: (progress: number) => void; // Progress callback (0-100)
}

export type LMSUploadResult = {
  publicUrl: string;
  blobPath: string;
  fileSize: number;
}

/**
 * Sanitize string for use in folder/file names
 * Converts to format: 01_Module_Title or 01_Lesson_Title
 */
function sanitizeFolderName(order: number, title: string): string {
  const paddedOrder = String(order).padStart(2, '0');
  const sanitizedTitle = title
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${paddedOrder}_${sanitizedTitle}`;
}

/**
 * Generate the storage path based on new bucket structure
 * Structure: /LMS_Uploads/{course-slug}/thumbnail.jpg
 *           /LMS_Uploads/{course-slug}/{module-folder}/{lesson-folder}/{content-file}
 *           /LMS_Uploads/{course-slug}/{lesson-folder}/{content-file}
 */
function generateStoragePath(
  courseSlug: string,
  args: {
    moduleOrder?: number;
    moduleTitle?: string;
    lessonOrder?: number;
    lessonTitle?: string;
    itemType: string;
    filename: string;
    itemId?: string;
  }
): string {
  const sanitizeSlug = (slug: string) => 
    slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  const sanitizedCourseSlug = sanitizeSlug(courseSlug);
  const sanitizedFilename = args.filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
  
  // Course thumbnail goes directly under course folder
  if (args.itemType === 'thumbnail') {
    const extension = args.filename.split('.').pop()?.toLowerCase() || 'jpg';
    return `LMS_Uploads/${sanitizedCourseSlug}/thumbnail.${extension}`;
  }
  
  // Build path: LMS_Uploads/{course-slug}/
  let path = `LMS_Uploads/${sanitizedCourseSlug}`;
  
  // Add module folder if module info provided
  if (args.moduleOrder !== undefined && args.moduleTitle) {
    const moduleFolder = sanitizeFolderName(args.moduleOrder, args.moduleTitle);
    path += `/${moduleFolder}`;
  }
  
  // Add lesson folder if lesson info provided
  if (args.lessonOrder !== undefined && args.lessonTitle) {
    const lessonFolder = sanitizeFolderName(args.lessonOrder, args.lessonTitle);
    path += `/${lessonFolder}`;
  }
  
  // Add content file with numbered prefix
  const contentOrder = args.lessonOrder !== undefined ? args.lessonOrder : 1;
  const paddedContentOrder = String(contentOrder).padStart(2, '0');
  const uniqueFilename = args.itemId 
    ? `${paddedContentOrder}_${args.itemId}_${sanitizedFilename}`
    : `${paddedContentOrder}_${sanitizedFilename}`;
  
  path += `/${uniqueFilename}`;
  
  return path;
}

/**
 * Upload file to Supabase Storage LMS bucket with progress tracking
 * Uses XMLHttpRequest for progress tracking when callback is provided
 */
export async function uploadLMSFileSupabase({
  file,
  courseSlug,
  moduleOrder,
  moduleTitle,
  lessonOrder,
  lessonTitle,
  itemType,
  itemId,
  onProgress,
}: LMSUploadArgs): Promise<LMSUploadResult> {
  const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
  
  if (file.size > FILE_SIZE_LIMIT && itemType !== 'video' && itemType !== 'thumbnail') {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 50MB`);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  const storagePath = generateStoragePath(courseSlug, {
    moduleOrder,
    moduleTitle,
    lessonOrder,
    lessonTitle,
    itemType,
    filename: file.name,
    itemId,
  });
  
  console.log('📤 Uploading to Supabase Storage:', {
    file: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    path: storagePath,
    bucket: 'lms-content',
  });
  
  // If progress callback is provided, use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      // Get Supabase session for auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        // Get Supabase URL from environment or client
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        if (!supabaseUrl) {
          reject(new Error('Supabase URL not configured'));
          return;
        }
        
        // Construct the storage endpoint - Supabase uses PUT for uploads
        const storageEndpoint = `${supabaseUrl}/storage/v1/object/lms-content/${storagePath}`;
        
        // Get anon key (always required for Supabase Storage API)
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!anonKey) {
          reject(new Error('Supabase anon key not configured'));
          return;
        }
        
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(Math.min(percentComplete, 99)); // Cap at 99% until complete
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            if (onProgress) {
              onProgress(100);
            }
            
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('lms-content')
              .getPublicUrl(storagePath);
            
            const publicUrl = urlData.publicUrl;
            
            console.log('✅ File uploaded successfully:', publicUrl);
            
            resolve({
              publicUrl,
              blobPath: storagePath,
              fileSize: file.size,
            });
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.message || error.error || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
            }
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed - network error'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
        
        // Use PUT method for Supabase Storage uploads
        xhr.open('PUT', storageEndpoint);
        
        // Set headers - Supabase Storage requires Authorization header
        // Use session token if available, otherwise use anon key
        const authToken = session?.access_token || anonKey;
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        
        // Set apikey header (required by Supabase)
        xhr.setRequestHeader('apikey', anonKey);
        
        // Set content type
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        
        // Optional headers
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.setRequestHeader('cache-control', '3600');
        
        xhr.send(file);
      }).catch(reject);
    });
  } else {
    // Standard upload without progress tracking
    const { data, error } = await supabase.storage
      .from('lms-content')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('❌ Supabase Storage upload error:', error);
      throw new Error(error.message || 'Failed to upload file');
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lms-content')
      .getPublicUrl(storagePath);
    
    const publicUrl = urlData.publicUrl;
    
    console.log('✅ File uploaded successfully:', publicUrl);
    
    return {
      publicUrl,
      blobPath: storagePath,
      fileSize: file.size,
    };
  }
}

/**
 * Delete file from Supabase Storage LMS bucket
 */
export async function deleteLMSFileSupabase(blobPath: string): Promise<{ ok: true }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  const { error } = await supabase.storage
    .from('lms-content')
    .remove([blobPath]);
  
  if (error) {
    throw new Error(error.message || 'Failed to delete file');
  }
  
  return { ok: true };
}

