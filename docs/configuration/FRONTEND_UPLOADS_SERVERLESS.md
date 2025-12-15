# Frontend Serverless Functions for Uploads

## Overview

To avoid CORS issues and simplify the architecture, upload functionality has been moved to Vercel serverless functions within the frontend app. These functions handle file uploads directly to Azure Storage without requiring a separate API deployment.

## Architecture

### Before (Separate API)
```
Frontend (Vercel) → Separate API (Vercel) → Azure Storage
                    ❌ CORS issues
                    ❌ Complex deployment
```

### After (Frontend Serverless Functions)
```
Frontend (Vercel) → /api/uploads/* (Same Origin) → Azure Storage
                    ✅ No CORS issues
                    ✅ Simpler deployment
                    ✅ Single project
```

## Files

### `api/uploads/sign.ts`
Generates signed URLs for file uploads.

**Endpoint:** `POST /api/uploads/sign`

**Request:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "dir": "thumbnails"
}
```

**Response:**
```json
{
  "putUrl": "https://...",
  "publicUrl": "https://...",
  "key": "thumbnails/1234567890-image.jpg"
}
```

### `api/uploads/put.ts`
Handles the actual file upload to Azure Storage.

**Endpoint:** `PUT /api/uploads/put?key=...&ct=...`

**Request:** Raw file data in request body

**Response:**
```json
{
  "ok": true,
  "key": "thumbnails/1234567890-image.jpg"
}
```

## Environment Variables

Set these in your Vercel project settings:

- `AZURE_STORAGE_ACCOUNT` - Azure Storage account name
- `AZURE_STORAGE_ACCOUNT_KEY` - Azure Storage account key
- `AZURE_STORAGE_CONNECTION_STRING` - Alternative: connection string (if using, don't need account/key)
- `AZURE_STORAGE_CONTAINER` - Container name (default: `uploads`)
- `AZURE_CDN_URL` (optional) - CDN URL for public file access

## How It Works

1. **Frontend calls `/api/uploads/sign`** with file metadata
2. **Serverless function generates Azure SAS URL** for direct upload (bypasses Vercel payload limits)
3. **Frontend uploads file directly to Azure Storage** using the SAS URL
4. **Public URL is returned** for use in the application

### Direct Upload to Azure Storage

**Important:** Files are now uploaded directly to Azure Storage, bypassing Vercel's serverless functions entirely. This allows uploads of any size (limited only by Azure Storage, which supports files up to 4.75 TB).

**Benefits:**
- ✅ No Vercel payload limits (4.5MB/50MB)
- ✅ Faster uploads (direct to Azure)
- ✅ Lower Vercel costs (no function invocations for uploads)
- ✅ Scalable (Azure Storage handles large files)

## Azure Storage CORS Configuration

**CRITICAL:** Since files are uploaded directly from the browser to Azure Storage, you **must** configure CORS on your Azure Storage account.

### Configure CORS via Azure Portal

1. Go to Azure Portal → Your Storage Account → Settings → Resource sharing (CORS)
2. Add a CORS rule for Blob service:
   - **Allowed origins**: `https://your-app.vercel.app`, `https://your-custom-domain.com`
   - **Allowed methods**: `PUT`, `GET`, `HEAD`, `OPTIONS`
   - **Allowed headers**: `*` (or specify: `Content-Type`, `x-ms-blob-type`, `x-ms-version`, `Authorization`)
   - **Exposed headers**: `*`
   - **Max age**: `3600` (1 hour)

### Configure CORS via Azure CLI

```bash
az storage cors add \
  --services b \
  --methods PUT GET HEAD OPTIONS \
  --origins https://your-app.vercel.app https://your-custom-domain.com \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name YOUR_STORAGE_ACCOUNT
```

### Configure CORS via Azure Storage SDK

```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const serviceClient = blobServiceClient.getServiceClient();

await serviceClient.setProperties({
  cors: [
    {
      allowedOrigins: ['https://your-app.vercel.app', 'https://your-custom-domain.com'],
      allowedMethods: ['PUT', 'GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600,
    },
  ],
});
```

### Local Development

For local development (`localhost:3000`), add `http://localhost:3000` to the allowed origins in Azure Storage CORS settings.

## Fallback to Separate API

The `storageProvider.ts` automatically detects the environment:
- **Production (Vercel)**: Uses `/api/uploads/sign` (frontend serverless)
- **Local Development**: Uses separate API server if `VITE_API_BASE_URL` is not set

## Benefits

1. ✅ **No CORS Issues**: Same origin, no preflight needed
2. ✅ **Simpler Deployment**: Single Vercel project
3. ✅ **Better Performance**: No extra network hop
4. ✅ **Easier Debugging**: Logs in same project
5. ✅ **Cost Effective**: Fewer serverless function invocations

## Migration Notes

The frontend code (`src/lib/storageProvider.ts`) automatically detects which API to use:
- If `getApiBaseUrl()` points to a localhost or separate API, it uses the separate API
- Otherwise, it uses the frontend serverless functions

This ensures backward compatibility during development while using the optimized serverless approach in production.

