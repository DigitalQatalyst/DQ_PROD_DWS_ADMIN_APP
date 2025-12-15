import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlockBlobClient,
} from '@azure/storage-blob';

const router = Router();

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const AZ_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || process.env.STORAGE_ACCOUNT || 'kfmediaitems';
const AZ_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || process.env.STORAGE_CONTAINER || 'mediaitems';
const AZ_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.STORAGE_CONNECTION_STRING;
const AZ_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || process.env.STORAGE_ACCOUNT_KEY || 'Lracbl9qzhQcHxMeESg13AtwKaSTLV5siILhBwN4lBdFu1YBepkaayFr2z9QDtCZ1VGzAoe8K/zo+AStwv5tdQ==';
const AZ_CDN = process.env.AZURE_CDN_URL;

// Debug: print which storage configuration is present when the module loads
console.log('Uploads route config -> AZ_CONN:', !!AZ_CONN, 'AZ_ACCOUNT:', !!AZ_ACCOUNT, 'AZ_KEY:', !!AZ_KEY, 'AZ_CDN:', !!AZ_CDN);

function hasAzureConfig() {
  return Boolean((AZ_ACCOUNT && AZ_KEY) || AZ_CONN);
}

function getBlobServiceClient() {
  if (AZ_CONN) return BlobServiceClient.fromConnectionString(AZ_CONN);
  if (AZ_ACCOUNT && AZ_KEY) {
    const cred = new StorageSharedKeyCredential(AZ_ACCOUNT, AZ_KEY);
    return new BlobServiceClient(`https://${AZ_ACCOUNT}.blob.core.windows.net`, cred);
  }
  throw new Error('Azure storage not configured');
}

function getPublicUrl(key: string, req?: Request) {
  // If Azure CDN is configured, use it
  if (AZ_CDN) return `${AZ_CDN.replace(/\/$/, '')}/${key}`;
  
  // If Azure Storage is configured, use the blob storage URL
  if (AZ_ACCOUNT && AZ_CONTAINER) {
    return `https://${AZ_ACCOUNT}.blob.core.windows.net/${AZ_CONTAINER}/${key}`;
  }
  
  // Fallback: use the API server to serve files (local dev or when Azure not configured)
  // Use request host if available, otherwise fallback to localhost
  if (req) {
    const host = `${req.protocol}://${req.get('host')}`;
    return `${host}/api/uploads/get?key=${encodeURIComponent(key)}`;
  }
  
  // Last resort: localhost (shouldn't happen in normal flow)
  const host = `http://localhost:${process.env.API_PORT || 3001}`;
  return `${host}/api/uploads/get?key=${encodeURIComponent(key)}`;
}
function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function slugName(name: string) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

router.post('/sign', async (req: Request, res: Response) => {
  try {
    const { filename, contentType, dir = 'editor' } = req.body || {};
    if (!filename) return res.status(400).json({ error: 'filename required' });
    const key = `${dir}/${Date.now()}-${slugName(filename)}`;
    const host = `${req.protocol}://${req.get('host')}`;
    // If Azure is configured we prefer to return a direct SAS URL from the serverless
    // sign implementation. However, when running the express API locally we may still
    // return a proxied PUT URL which streams the upload to Azure or local disk.
    const putUrl = `${host}/api/uploads/put?key=${encodeURIComponent(key)}&ct=${encodeURIComponent(contentType || 'application/octet-stream')}`;
    const publicUrl = getPublicUrl(key, req);

    console.log('[uploads/sign] key=', key, 'usingAzure=', hasAzureConfig());

    return res.status(200).json({ putUrl, publicUrl, key });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'sign failed' });
  }
});

router.put('/put', async (req: Request, res: Response) => {
  try {
    const key = String(req.query.key || '').replace(/\.{2,}/g, '');
    if (!key) return res.status(400).json({ error: 'key required' });
    const contentType = String(req.query.ct || req.headers['content-type'] || 'application/octet-stream');

    if (hasAzureConfig()) {
      // Stream request body to Azure blob
      const svc = getBlobServiceClient();
      const container = svc.getContainerClient(AZ_CONTAINER!);
      await container.createIfNotExists();
      const blob: BlockBlobClient = container.getBlockBlobClient(key);
      const uploadOptions = { blobHTTPHeaders: { blobContentType: contentType } } as any;
      // Pipe the incoming request into Azure using uploadStream
      const maxBuffers = 5;
      const bufferSize = 4 * 1024 * 1024;
      await blob.uploadStream(req, bufferSize, maxBuffers, uploadOptions);
      return res.status(201).end();
    } else {
      // Fallback: write to local disk
      const destPath = path.join(UPLOAD_ROOT, key);
      ensureDirSync(path.dirname(destPath));
      const tmpPath = destPath + '.uploading';
      const w = fs.createWriteStream(tmpPath);
      req.pipe(w);
      w.on('finish', () => { fs.renameSync(tmpPath, destPath); res.status(201).end(); });
      w.on('error', (err) => { try { fs.unlinkSync(tmpPath); } catch {}; res.status(500).json({ error: err?.message || 'write failed' }); });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'upload failed' });
  }
});

// GET route to serve uploaded files
router.get('/get', async (req: Request, res: Response) => {
  try {
    const key = String(req.query.key || '').replace(/\.{2,}/g, '');
    if (!key) return res.status(400).json({ error: 'key required' });

    if (hasAzureConfig()) {
      // Serve from Azure Storage
      const svc = getBlobServiceClient();
      const container = svc.getContainerClient(AZ_CONTAINER!);
      const blob = container.getBlockBlobClient(key);
      
      // Check if blob exists
      const exists = await blob.exists();
      if (!exists) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get blob properties for content type
      const properties = await blob.getProperties();
      res.setHeader('Content-Type', properties.contentType || 'application/octet-stream');
      res.setHeader('Content-Length', properties.contentLength?.toString() || '0');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Stream the blob to the response
      const downloadResponse = await blob.download();
      if (downloadResponse.readableStreamBody) {
        downloadResponse.readableStreamBody.pipe(res);
        
        downloadResponse.readableStreamBody.on('error', (err) => {
          console.error('Error streaming blob:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming file' });
          } else {
            res.end();
          }
        });
      } else {
        res.status(500).json({ error: 'Unable to stream blob' });
      }
    } else {
      // Serve from local disk
      const filePath = path.join(UPLOAD_ROOT, key);
      
      // Security: ensure file is within uploads directory
      const resolvedPath = path.resolve(filePath);
      const resolvedRoot = path.resolve(UPLOAD_ROOT);
      if (!resolvedPath.startsWith(resolvedRoot)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Set content type based on file extension
      const contentTypeMap: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
      };
      
      const contentType = contentTypeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });
    }
  } catch (e: any) {
    console.error('Error serving file:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: e?.message || 'Error serving file' });
    }
  }
});

router.post('/delete', async (req: Request, res: Response) => {
  try {
    const { blobPath } = req.body || {};
    if (!blobPath) return res.status(400).json({ error: 'blobPath required' });
    const clean = String(blobPath).replace(/^\/+/, '');
    if (hasAzureConfig()) {
      const svc = getBlobServiceClient();
      const container = svc.getContainerClient(AZ_CONTAINER!);
      const blob = container.getBlockBlobClient(clean);
      try { await blob.deleteIfExists(); } catch {}
    } else {
      const p = path.join(UPLOAD_ROOT, clean);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'delete failed' });
  }
});

export default router;
