import { getApiUrl, getApiBaseUrl } from './apiConfig';

export type UploadArgs = { file: File; dir: 'thumbnails' | 'video' | 'podcast' | 'report'; mediaId?: string }
export type UploadResult = { publicUrl: string; blobPath: string }

const json = async (res: Response) => { try { return await res.json() } catch { return null } }

export async function uploadFile({ file, dir, mediaId }: UploadArgs): Promise<UploadResult> {
  // Determine which API to use based on environment
  const isLocalDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    !import.meta.env.PROD
  );
  
  let signUrl: string;
  if (isLocalDev) {
    // In local development, use the backend API server (through proxy or direct)
    signUrl = getApiUrl('/uploads/sign');
  } else {
    // In production (Vercel), use frontend serverless function (same origin, no CORS)
    signUrl = '/api/uploads/sign';
  }
  
  console.log('📤 Requesting signed URL from:', signUrl);
  
  const signRes = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type, dir, mediaId }),
    credentials: 'include',
  })
  
  if (!signRes.ok) {
    const body = await json(signRes)
    const errorMsg = body?.error || `Sign failed: ${signRes.status} ${signRes.statusText}`;
    console.error('❌ Sign URL request failed:', errorMsg, signRes);
    throw new Error(errorMsg);
  }
  
  const { putUrl, publicUrl, key } = await signRes.json()
  console.log('✅ Signed URL received:', { putUrl, publicUrl, key });

  // Determine if this is an Azure Storage URL (direct upload) or API endpoint
  const isAzureStorage = putUrl.includes('.blob.core.windows.net');
  
  // Prepare headers for upload
  const headers: HeadersInit = {
    'Content-Type': file.type || 'application/octet-stream',
  };
  
  // Azure Storage requires x-ms-blob-type header for direct uploads
  if (isAzureStorage) {
    headers['x-ms-blob-type'] = 'BlockBlob';
  }

  // Upload file: directly to Azure Storage (bypasses Vercel payload limits) or to API endpoint
  const put = await fetch(putUrl, {
    method: 'PUT',
    headers,
    body: file,
  })
  
  if (!(put.status === 201 || put.status === 200)) {
    const t = await put.text().catch(() => '')
    throw new Error(`Upload failed: ${put.status} ${t}`)
  }

  // Use the key from the API response, or extract from URL as fallback
  const blobPath = key || new URL(putUrl).pathname.replace(/^\//,'').split('?')[0];
  
  return { publicUrl, blobPath }
}

export async function deleteFile(blobPath: string): Promise<{ ok: true }> {
  const res = await fetch(getApiUrl('/uploads/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blobPath }),
  })
  if (!res.ok) {
    const body = await json(res)
    throw new Error(body?.error || `Delete failed: ${res.status}`)
  }
  return { ok: true }
}

