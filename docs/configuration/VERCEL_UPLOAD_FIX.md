# Vercel Upload Fix: CORS and Serverless Function Issues

## Problems Identified

1. **CORS Error**: Preflight requests failing with "No 'Access-Control-Allow-Origin' header"
2. **Serverless Function Crash**: 500 INTERNAL_SERVER_ERROR when calling the API

## Solutions Implemented

### Solution 1: Frontend Serverless Functions (Recommended)

**Location**: `api/uploads/sign.ts` and `api/uploads/put.ts`

These serverless functions are in the frontend app, eliminating CORS issues entirely.

**Benefits**:
- ✅ No CORS issues (same origin)
- ✅ Simpler deployment (single Vercel project)
- ✅ Better performance
- ✅ Easier debugging

**How it works**:
1. Frontend calls `/api/uploads/sign` (same origin)
2. Serverless function generates upload URL
3. Frontend uploads to `/api/uploads/put` (same origin)
4. Serverless function uploads to Azure Storage

**Environment Variables Required** (in frontend Vercel project):
- `AZURE_STORAGE_ACCOUNT` - Azure Storage account name
- `AZURE_STORAGE_ACCOUNT_KEY` - Azure Storage account key
- `AZURE_STORAGE_CONNECTION_STRING` - Alternative to account/key
- `AZURE_STORAGE_CONTAINER` - Container name (default: `uploads`)
- `AZURE_CDN_URL` (optional) - CDN URL for public access

### Solution 2: Fixed Separate API Handler

**Location**: `AdminApp_API/api/index.ts`

Fixed the CORS and error handling issues:

1. **CORS Headers Set First**: Before any request processing
2. **OPTIONS Handling**: Immediate response for preflight requests
3. **Error Handling**: Proper error responses with CORS headers

**Changes**:
- Set CORS headers before any logic
- Handle OPTIONS requests immediately
- Ensure CORS headers on error responses
- Simplified Express app integration

## Setup Instructions

### Option A: Use Frontend Serverless Functions (Recommended)

1. **Install dependencies**:
   ```bash
   npm install @azure/storage-blob
   ```

2. **Set environment variables** in Vercel (frontend project):
   - `AZURE_STORAGE_ACCOUNT`
   - `AZURE_STORAGE_ACCOUNT_KEY` (or `AZURE_STORAGE_CONNECTION_STRING`)
   - `AZURE_STORAGE_CONTAINER` (optional, default: `uploads`)

3. **Deploy**: The functions will automatically be available at `/api/uploads/sign` and `/api/uploads/put`

4. **No code changes needed**: `storageProvider.ts` automatically detects and uses frontend serverless functions in production

### Option B: Fix Separate API Deployment

1. **Update `AdminApp_API/package.json`**:
   ```json
   {
     "devDependencies": {
       "@vercel/node": "^3.0.7"
     }
   }
   ```

2. **Deploy API** to Vercel

3. **Set environment variable** in frontend Vercel project:
   - `VITE_API_BASE_URL` = `https://your-api-deployment.vercel.app`

4. **Redeploy frontend**

## Testing

### Test Frontend Serverless Functions

```bash
# Test sign endpoint
curl -X POST https://your-frontend.vercel.app/api/uploads/sign \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg","dir":"thumbnails"}'

# Should return: {"putUrl":"...","publicUrl":"...","key":"..."}
```

### Test Upload

```bash
# Use the putUrl from sign response
curl -X PUT "<putUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

## Troubleshooting

### Still seeing CORS errors?

1. **Check if using frontend serverless functions**: Look for `/api/uploads/sign` in network tab (should be same origin)
2. **Verify CORS headers**: Check response headers for `Access-Control-Allow-Origin`
3. **Clear browser cache**: Old responses might be cached

### Serverless function crashes?

1. **Check Vercel logs**: Go to Vercel dashboard → Functions → Logs
2. **Verify environment variables**: All Azure Storage variables must be set
3. **Check function timeout**: Large files may need increased timeout (see `vercel.json`)

### Upload fails with 400?

1. **Check Content-Type header**: Must match file type
2. **Verify body is binary**: Not JSON-encoded
3. **Check file size**: Vercel has limits (10MB for Hobby, 50MB for Pro)

## Configuration Files

### `vercel.json` (Frontend)
```json
{
  "functions": {
    "api/uploads/put.ts": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables Checklist

**Frontend Vercel Project**:
- ✅ `AZURE_STORAGE_ACCOUNT`
- ✅ `AZURE_STORAGE_ACCOUNT_KEY` (or `AZURE_STORAGE_CONNECTION_STRING`)
- ✅ `AZURE_STORAGE_CONTAINER` (optional)
- ✅ `AZURE_CDN_URL` (optional)

**If using separate API**:
- ✅ `VITE_API_BASE_URL` (frontend)
- ✅ `AZURE_STORAGE_ACCOUNT` (API)
- ✅ `AZURE_STORAGE_ACCOUNT_KEY` (API)
- ✅ `AZURE_STORAGE_CONTAINER` (API)

## Next Steps

1. **Deploy frontend** with serverless functions
2. **Test upload** functionality
3. **Monitor Vercel logs** for any errors
4. **Remove separate API deployment** if not needed (optional)
