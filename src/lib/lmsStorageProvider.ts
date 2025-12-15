/**
 * LMS Storage Provider
 * Handles file uploads for LMS content with proper bucket structure:
 * lms-content/course/{slug}/module-folder/items
 * 
 * Supports large file uploads (videos) with chunked upload for files > 50MB
 */

import { getApiUrl } from './apiConfig';

export type LMSUploadArgs = {
  file: File;
  courseSlug: string;
  moduleSlug?: string; // Optional module folder
  itemType: 'image' | 'video' | 'document'; // Type of item being uploaded
  itemId?: string; // Optional item ID for unique naming
}

export type LMSUploadResult = {
  publicUrl: string;
  blobPath: string;
  fileSize: number;
}

const json = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Generate the storage path based on bucket structure
 * Format: lms-content/course/{slug}/module-folder/items
 */
function generateStoragePath(
  courseSlug: string,
  moduleSlug: string | undefined,
  itemType: string,
  filename: string,
  itemId?: string
): string {
  // Sanitize slugs and filename
  const sanitizeSlug = (slug: string) => 
    slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  const sanitizedCourseSlug = sanitizeSlug(courseSlug);
  const sanitizedModuleSlug = moduleSlug ? sanitizeSlug(moduleSlug) : null;
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
  
  // Generate unique filename with timestamp and optional item ID
  const timestamp = Date.now();
  const uniqueFilename = itemId 
    ? `${itemId}-${sanitizedFilename}`
    : `${timestamp}-${sanitizedFilename}`;
  
  // Build path: lms-content/course/{slug}/module-folder/items
  let path = `lms-content/course/${sanitizedCourseSlug}`;
  
  if (sanitizedModuleSlug) {
    path += `/${sanitizedModuleSlug}`;
  }
  
  // Add item type folder
  path += `/${itemType}s`; // images, videos, documents
  
  // Add filename
  path += `/${uniqueFilename}`;
  
  return path;
}

/**
 * Upload file to LMS storage bucket
 * Handles large files (>50MB) with chunked upload
 */
export async function uploadLMSFile({
  file,
  courseSlug,
  moduleSlug,
  itemType,
  itemId,
}: LMSUploadArgs): Promise<LMSUploadResult> {
  const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB in bytes
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks for large files
  
  // Check file size
  if (file.size > FILE_SIZE_LIMIT && itemType !== 'video') {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 50MB`);
  }
  
  // Generate storage path
  const storagePath = generateStoragePath(courseSlug, moduleSlug, itemType, file.name, itemId);
  
  // Determine which API to use based on environment
  const isLocalDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    !import.meta.env.PROD
  );
  
  let signUrl: string;
  if (isLocalDev) {
    signUrl = getApiUrl('/uploads/sign-lms');
  } else {
    signUrl = '/api/uploads/sign-lms';
  }
  
  console.log('📤 Requesting signed URL for LMS upload:', {
    file: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    path: storagePath,
  });
  
  // For large files (>50MB), use chunked upload
  if (file.size > FILE_SIZE_LIMIT && itemType === 'video') {
    return await uploadLargeFile(file, storagePath, signUrl, CHUNK_SIZE);
  }
  
  // For smaller files, use standard upload
  const signRes = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      path: storagePath,
      fileSize: file.size,
    }),
    credentials: 'include',
  });
  
  if (!signRes.ok) {
    const body = await json(signRes);
    const errorMsg = body?.error || `Sign failed: ${signRes.status} ${signRes.statusText}`;
    console.error('❌ Sign URL request failed:', errorMsg);
    throw new Error(errorMsg);
  }
  
  const { putUrl, publicUrl, key } = await signRes.json();
  console.log('✅ Signed URL received:', { putUrl, publicUrl, key });
  
  // Upload file directly to Azure Storage
  const headers: HeadersInit = {
    'Content-Type': file.type || 'application/octet-stream',
  };
  
  const isAzureStorage = putUrl.includes('.blob.core.windows.net');
  if (isAzureStorage) {
    headers['x-ms-blob-type'] = 'BlockBlob';
  }
  
  const put = await fetch(putUrl, {
    method: 'PUT',
    headers,
    body: file,
  });
  
  if (!(put.status === 201 || put.status === 200)) {
    const t = await put.text().catch(() => '');
    throw new Error(`Upload failed: ${put.status} ${t}`);
  }
  
  const blobPath = key || storagePath;
  
  return {
    publicUrl,
    blobPath,
    fileSize: file.size,
  };
}

/**
 * Upload large files using chunked upload (for videos > 50MB)
 */
async function uploadLargeFile(
  file: File,
  storagePath: string,
  signUrl: string,
  chunkSize: number
): Promise<LMSUploadResult> {
  console.log('📦 Starting chunked upload for large file:', file.name);
  
  // Request multipart upload initiation
  const initRes = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      path: storagePath,
      fileSize: file.size,
      chunked: true,
    }),
    credentials: 'include',
  });
  
  if (!initRes.ok) {
    const body = await json(initRes);
    throw new Error(body?.error || 'Failed to initiate chunked upload');
  }
  
  const { uploadId, chunkUrls, publicUrl } = await initRes.json();
  
  // Upload chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  console.log(`📤 Uploading ${totalChunks} chunks...`);
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const chunkUrl = chunkUrls[chunkIndex];
    if (!chunkUrl) {
      throw new Error(`Missing chunk URL for chunk ${chunkIndex}`);
    }
    
    const headers: HeadersInit = {
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
    };
    
    if (chunkUrl.includes('.blob.core.windows.net')) {
      headers['x-ms-blob-type'] = 'BlockBlob';
    }
    
    const chunkRes = await fetch(chunkUrl, {
      method: 'PUT',
      headers,
      body: chunk,
    });
    
    if (!(chunkRes.status === 201 || chunkRes.status === 200)) {
      const errorText = await chunkRes.text().catch(() => '');
      throw new Error(`Chunk ${chunkIndex} upload failed: ${chunkRes.status} ${errorText}`);
    }
    
    console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded`);
  }
  
  // Commit the upload
  const commitRes = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadId,
      action: 'commit',
    }),
    credentials: 'include',
  });
  
  if (!commitRes.ok) {
    const body = await json(commitRes);
    throw new Error(body?.error || 'Failed to commit chunked upload');
  }
  
  console.log('✅ Chunked upload completed');
  
  return {
    publicUrl,
    blobPath: storagePath,
    fileSize: file.size,
  };
}

/**
 * Delete file from LMS storage
 */
export async function deleteLMSFile(blobPath: string): Promise<{ ok: true }> {
  const isLocalDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    !import.meta.env.PROD
  );
  
  const deleteUrl = isLocalDev
    ? getApiUrl('/uploads/delete-lms')
    : '/api/uploads/delete-lms';
  
  const res = await fetch(deleteUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blobPath }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    const body = await json(res);
    throw new Error(body?.error || `Delete failed: ${res.status}`);
  }
  
  return { ok: true };
}


