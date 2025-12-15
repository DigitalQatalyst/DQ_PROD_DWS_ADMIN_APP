/**
 * Vercel Serverless Function: Sign Upload URL
 * 
 * This function generates a signed URL for file uploads to Azure Storage.
 * Located in the frontend app to avoid CORS issues.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlockBlobClient,
} from '@azure/storage-blob';

// CORS headers helper
function setCorsHeaders(res: VercelResponse, origin?: string) {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-ms-blob-type, x-requested-with');
  }
}

function slugName(name: string) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, dir = 'editor' } = req.body || {};
    
    if (!filename) {
      return res.status(400).json({ error: 'filename required' });
    }

    // Get Azure Storage configuration
    const AZ_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || process.env.STORAGE_ACCOUNT;
    const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || process.env.STORAGE_CONTAINER || 'uploads';
    const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.STORAGE_CONNECTION_STRING;
    const AZ_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || process.env.STORAGE_ACCOUNT_KEY;
    const AZ_CDN = process.env.AZURE_CDN_URL;

    // Log environment detection for easier debugging
    console.log('[uploads/sign] AZ_CONN=', !!AZ_CONN, 'AZ_ACCOUNT=', !!AZ_ACCOUNT, 'AZ_KEY=', !!AZ_KEY, 'AZ_CONTAINER=', !!AZ_CONTAINER, 'AZ_CDN=', !!AZ_CDN);

    // On serverless platforms (Vercel) we must have Azure credentials available.
    // If they're missing, return a clear 500 so callers do not silently fall
    // back to the API get/put paths which may store files locally in other runtimes.
    const runningOnVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
    if (runningOnVercel && !AZ_CONN && !(AZ_ACCOUNT && AZ_KEY)) {
      console.error('[uploads/sign] Azure storage credentials not found in serverless environment');
      return res.status(500).json({ error: 'Azure storage not configured for serverless environment' });
    }

    // Generate blob key
    const key = `${dir}/${Date.now()}-${slugName(filename)}`;

    // Generate signed URL for upload
    let putUrl: string;
    let publicUrl: string;

    if (AZ_CONN) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZ_CONN);
      const containerClient = blobServiceClient.getContainerClient(AZ_CONTAINER);
      await containerClient.createIfNotExists();

      const blockBlobClient = containerClient.getBlockBlobClient(key);
      
      // Generate SAS URL for upload (expires in 1 hour)
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 1);
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: 'w', // write permission
        expiresOn,
      });

      putUrl = sasUrl;
    } else if (AZ_ACCOUNT && AZ_KEY) {
      const cred = new StorageSharedKeyCredential(AZ_ACCOUNT, AZ_KEY);
      const blobServiceClient = new BlobServiceClient(
        `https://${AZ_ACCOUNT}.blob.core.windows.net`,
        cred
      );
      const containerClient = blobServiceClient.getContainerClient(AZ_CONTAINER);
      await containerClient.createIfNotExists();

      const blockBlobClient = containerClient.getBlockBlobClient(key);
      
      // Generate SAS URL for upload
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 1);
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: 'w',
        expiresOn,
      });

      putUrl = sasUrl;
    } else {
      return res.status(500).json({ error: 'Azure storage credentials not found' });
    }

    // Generate public URL
    if (AZ_CDN) {
      publicUrl = `${AZ_CDN.replace(/\/$/, '')}/${key}`;
    } else if (AZ_ACCOUNT && AZ_CONTAINER) {
      publicUrl = `https://${AZ_ACCOUNT}.blob.core.windows.net/${AZ_CONTAINER}/${key}`;
    } else {
      // Fallback: use the API endpoint (shouldn't happen if Azure is configured)
      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      publicUrl = `${protocol}://${host}/api/uploads/get?key=${encodeURIComponent(key)}`;
    }

    // Return Azure Storage SAS URL for direct upload
    // This bypasses Vercel's payload limit (4.5MB/50MB) by uploading directly to Azure
    // Note: Azure Storage CORS must be configured to allow uploads from your frontend domain
    return res.status(200).json({ putUrl, publicUrl, key });
  } catch (error: any) {
    console.error('Sign URL error:', error);
    return res.status(500).json({
      error: 'sign_failed',
      message: error?.message || 'Failed to generate signed URL'
    });
  }
}

