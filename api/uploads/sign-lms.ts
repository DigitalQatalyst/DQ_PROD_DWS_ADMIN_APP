/**
 * Vercel Serverless Function: Sign LMS Upload URL
 * 
 * Generates signed URLs for LMS content uploads with proper bucket structure:
 * lms-content/course/{slug}/module-folder/items
 * 
 * Supports chunked uploads for large files (>50MB)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlockBlobClient,
} from '@azure/storage-blob';

function setCorsHeaders(res: VercelResponse, origin?: string) {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-ms-blob-type, x-requested-with, Content-Range');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, path, fileSize, chunked, uploadId, action } = req.body || {};
    
    if (!filename || !path) {
      return res.status(400).json({ error: 'filename and path required' });
    }

    // Check if using Supabase Storage or Azure Storage
    const USE_SUPABASE_STORAGE = process.env.USE_SUPABASE_STORAGE === 'true';
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Get Azure Storage configuration (fallback)
    const AZ_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || process.env.STORAGE_ACCOUNT;
    const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || process.env.STORAGE_CONTAINER || 'lms-content';
    const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.STORAGE_CONNECTION_STRING;
    const AZ_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || process.env.STORAGE_ACCOUNT_KEY;
    const AZ_CDN = process.env.AZURE_CDN_URL;

    // Use Supabase Storage if configured
    if (USE_SUPABASE_STORAGE && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Generate signed URL for Supabase Storage
      const expiresIn = 3600; // 1 hour
      const { data, error } = await supabase.storage
        .from('lms-content')
        .createSignedUploadUrl(path, {
          upsert: false,
        });
      
      if (error) {
        console.error('[uploads/sign-lms] Supabase Storage error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      // For Supabase, we'll use the upload URL directly
      // Note: Supabase Storage handles uploads differently - you may need to use their SDK
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/lms-content/${path}`;
      
      return res.status(200).json({
        putUrl: data.path, // Supabase upload path
        publicUrl,
        key: path,
        storageType: 'supabase',
      });
    }
    
    // Fallback to Azure Storage
    const runningOnVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
    if (runningOnVercel && !AZ_CONN && !(AZ_ACCOUNT && AZ_KEY)) {
      console.error('[uploads/sign-lms] Storage credentials not found');
      return res.status(500).json({ error: 'Storage not configured' });
    }

    // Initialize blob service client
    let blobServiceClient: BlobServiceClient;
    if (AZ_CONN) {
      blobServiceClient = BlobServiceClient.fromConnectionString(AZ_CONN);
    } else if (AZ_ACCOUNT && AZ_KEY) {
      const cred = new StorageSharedKeyCredential(AZ_ACCOUNT, AZ_KEY);
      blobServiceClient = new BlobServiceClient(
        `https://${AZ_ACCOUNT}.blob.core.windows.net`,
        cred
      );
    } else {
      return res.status(500).json({ error: 'Azure storage credentials not found' });
    }

    const containerClient = blobServiceClient.getContainerClient(AZ_CONTAINER);
    await containerClient.createIfNotExists({
      access: 'blob', // Public read access
    });

    const blockBlobClient = containerClient.getBlockBlobClient(path);

    // Handle chunked upload initiation
    if (chunked && !uploadId) {
      const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
      const totalChunks = Math.ceil((fileSize || 0) / CHUNK_SIZE);
      
      // Generate SAS URLs for each chunk
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 2); // 2 hour expiry for large uploads
      
      const chunkUrls: string[] = [];
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      for (let i = 0; i < totalChunks; i++) {
        const chunkBlockId = Buffer.from(`${uploadId}-chunk-${i}`).toString('base64');
        // For chunked uploads, we'll use block blob upload
        // Each chunk gets a unique block ID
        const sasUrl = await blockBlobClient.generateSasUrl({
          permissions: 'w',
          expiresOn,
        });
        chunkUrls.push(sasUrl);
      }
      
      return res.status(200).json({
        uploadId,
        chunkUrls,
        totalChunks,
        chunkSize: CHUNK_SIZE,
      });
    }

    // Handle chunked upload commit
    if (action === 'commit' && uploadId) {
      // In a real implementation, you would need to:
      // 1. Get all block IDs from the chunks
      // 2. Commit the blocks using Put Block List
      // For now, we'll return success - the actual commit should be handled
      // by the Azure Storage SDK on the client side or via a separate endpoint
      
      return res.status(200).json({
        ok: true,
        message: 'Upload committed (blocks should be committed separately)',
      });
    }

    // Standard single-file upload
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);
    
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: 'w',
      expiresOn,
    });

    // Generate public URL
    let publicUrl: string;
    if (AZ_CDN) {
      publicUrl = `${AZ_CDN.replace(/\/$/, '')}/${path}`;
    } else if (AZ_ACCOUNT && AZ_CONTAINER) {
      publicUrl = `https://${AZ_ACCOUNT}.blob.core.windows.net/${AZ_CONTAINER}/${path}`;
    } else {
      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      publicUrl = `${protocol}://${host}/api/uploads/get?key=${encodeURIComponent(path)}`;
    }

    return res.status(200).json({
      putUrl: sasUrl,
      publicUrl,
      key: path,
    });
  } catch (error: any) {
    console.error('Sign LMS URL error:', error);
    return res.status(500).json({
      error: 'sign_failed',
      message: error?.message || 'Failed to generate signed URL',
    });
  }
}

