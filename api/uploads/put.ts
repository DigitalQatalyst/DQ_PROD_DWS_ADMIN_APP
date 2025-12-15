/**
 * Vercel Serverless Function: Upload File
 * 
 * This function handles direct file uploads to Azure Storage.
 * Located in the frontend app to avoid CORS issues.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
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

// Read request body as Buffer from Vercel's request
// Vercel's @vercel/node automatically handles binary data
async function getRequestBody(req: VercelRequest): Promise<Buffer> {
  // Vercel provides body in different formats depending on content type
  // For binary data (audio/mpeg, video/*, etc.), it may be:
  // 1. A Buffer (if Content-Type is binary)
  // 2. A base64-encoded string (Vercel's default for binary)
  // 3. An ArrayBuffer
  
  // Check if body is already a Buffer
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  
  // Check if body is ArrayBuffer
  if (req.body instanceof ArrayBuffer) {
    return Buffer.from(req.body);
  }
  
  // For binary content, Vercel may provide body as base64 string
  // This is the most common case for binary uploads
  if (typeof req.body === 'string') {
    // Try to decode as base64 first (Vercel's default for binary)
    try {
      // Check if it looks like base64
      if (/^[A-Za-z0-9+/=]+$/.test(req.body)) {
        return Buffer.from(req.body, 'base64');
      }
      // If not base64, try binary/latin1 encoding
      return Buffer.from(req.body, 'latin1');
    } catch (error) {
      console.error('Error decoding body:', error);
      throw new Error('Failed to decode request body');
    }
  }
  
  // If body is an object, it was parsed as JSON (wrong)
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    console.error('Body was parsed as JSON:', typeof req.body, Object.keys(req.body || {}));
    throw new Error('Body was parsed as JSON instead of binary. Ensure Content-Type is set correctly for binary uploads.');
  }
  
  // If body is undefined or null
  if (!req.body) {
    throw new Error('Request body is missing');
  }
  
  // Last resort: try to convert to buffer
  return Buffer.from(String(req.body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key = String(req.query.key || '').replace(/\.{2,}/g, '');
    if (!key) {
      return res.status(400).json({ error: 'key required' });
    }

    const contentType = String(
      req.query.ct || 
      req.headers['content-type'] || 
      'application/octet-stream'
    );

    // Get Azure Storage configuration
    const AZ_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || process.env.STORAGE_ACCOUNT;
    const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || process.env.STORAGE_CONTAINER || 'uploads';
    const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.STORAGE_CONNECTION_STRING;
    const AZ_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || process.env.STORAGE_ACCOUNT_KEY;

    if (!AZ_ACCOUNT && !AZ_CONN) {
      return res.status(500).json({ error: 'Azure storage not configured' });
    }

    // Get blob service client
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

    // Upload to Azure
    const containerClient = blobServiceClient.getContainerClient(AZ_CONTAINER);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(key);
    
    // Get request body as Buffer
    let uploadData: Buffer;
    try {
      uploadData = await getRequestBody(req);
    } catch (error: any) {
      console.error('Error reading request body:', error);
      return res.status(400).json({ 
        error: 'invalid_body',
        message: error?.message || 'Failed to read request body'
      });
    }

    if (!uploadData || uploadData.length === 0) {
      return res.status(400).json({ 
        error: 'empty_body',
        message: 'Request body is empty'
      });
    }

    console.log(`📤 Uploading ${uploadData.length} bytes to Azure Storage: ${key}`);

    await blockBlobClient.upload(uploadData, uploadData.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    console.log(`✅ Successfully uploaded to Azure: ${key}`);

    return res.status(201).json({ ok: true, key });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'upload_failed',
      message: error?.message || 'Failed to upload file'
    });
  }
}

