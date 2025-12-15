# Environment Variables Setup

This guide explains how to configure environment variables for both local development and production deployment.

## Local Development

### Frontend (.env file)

Create a `.env` file in the project root:

```bash
# API Configuration - Leave empty for local dev (uses Vite proxy)
VITE_API_BASE_URL=

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_TENANT_ID=your_azure_tenant_id
# Primary redirect URI for this branch (required)
VITE_AZURE_REDIRECT_URI_CUSTOM=http://localhost:3000
# Note: VITE_AZURE_REDIRECT_URI and NEXT_PUBLIC_REDIRECT_URI are not used in this branch
```

**Note:** For local development, `VITE_API_BASE_URL` should be empty or omitted. The Vite proxy will automatically route `/api` requests to `http://localhost:3001`.

### API Server (.env file in api/ directory)

Create a `.env` file in the `api/` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Azure Storage
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
AZURE_STORAGE_CONTAINER=uploads
AZURE_CDN_URL=https://your-cdn.azureedge.net

# Server
PORT=3001
NODE_ENV=development
```

## Production (Vercel)

### Frontend Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# API Configuration - Set to your Vercel API deployment URL
VITE_API_BASE_URL=https://your-api-repo.vercel.app/api

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_TENANT_ID=your_azure_tenant_id
# Primary redirect URI for this branch (required)
VITE_AZURE_REDIRECT_URI_CUSTOM=https://your-frontend.vercel.app
# Note: VITE_AZURE_REDIRECT_URI and NEXT_PUBLIC_REDIRECT_URI are not used in this branch
```

**Important:** `VITE_API_BASE_URL` must be set to your deployed API URL in production.

### API Environment Variables (Vercel)

In your API Vercel project settings, add:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Azure Storage
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
AZURE_STORAGE_CONTAINER=uploads
AZURE_CDN_URL=https://your-cdn.azureedge.net

# Server
NODE_ENV=production
```

## How It Works

### Local Development Flow

```
Frontend (localhost:3000)
    ↓
Vite Proxy (/api → http://localhost:3001)
    ↓
API Server (localhost:3001)
```

- Frontend uses relative paths: `/api/...`
- Vite proxy automatically forwards to `http://localhost:3001`
- No `VITE_API_BASE_URL` needed

### Production Flow

```
Frontend (Vercel)
    ↓
Direct API calls to VITE_API_BASE_URL
    ↓
API Server (Vercel)
```

- Frontend uses absolute URL: `https://your-api.vercel.app/api/...`
- `VITE_API_BASE_URL` must be set to your API deployment URL
- No proxy needed

## Azure Redirect URI Configuration

**For this branch:** The application uses `VITE_AZURE_REDIRECT_URI_CUSTOM` as the **primary redirect URI**. This is the main redirect URI variable for this branch.

### Configuration Priority

1. **`VITE_AZURE_REDIRECT_URI_CUSTOM`** (primary) - Main redirect URI for this branch
2. **`window.location.origin`** (fallback) - Only used if `VITE_AZURE_REDIRECT_URI_CUSTOM` is not set

**Note:** The old variables (`VITE_AZURE_REDIRECT_URI`, `NEXT_PUBLIC_REDIRECT_URI`) are **not used** in this branch.

### Example Configuration

```bash
# .env file - Required for this branch
VITE_AZURE_REDIRECT_URI_CUSTOM=https://your-frontend.vercel.app
```

**Important:** 
- Make sure `VITE_AZURE_REDIRECT_URI_CUSTOM` is set in your environment variables
- Register the redirect URI in your Azure AD app registration under "Authentication" → "Redirect URIs"
- If `VITE_AZURE_REDIRECT_URI_CUSTOM` is not set, the app will fallback to `window.location.origin`

## Troubleshooting

### API calls failing in production

1. **Check `VITE_API_BASE_URL` is set:**
   ```bash
   # In Vercel dashboard → Settings → Environment Variables
   # Should be: https://your-api-repo.vercel.app/api
   ```

2. **Verify API is deployed and accessible:**
   ```bash
   curl https://your-api-repo.vercel.app/api/health
   ```

3. **Check CORS configuration:**
   - API must allow requests from your frontend domain
   - Update CORS in `api/server.ts` to include your Vercel domain

### API calls failing locally

1. **Ensure API server is running:**
   ```bash
   cd api
   npm run dev
   ```

2. **Check Vite proxy configuration:**
   - Verify `vite.config.ts` has proxy setup for `/api`
   - Should proxy to `http://localhost:3001`

3. **Verify no conflicting `VITE_API_BASE_URL`:**
   - Should be empty or unset in local `.env`

## Testing

### Test Local Setup

```bash
# Terminal 1: Start API
cd api
npm run dev

# Terminal 2: Start Frontend
npm run dev
```

Visit `http://localhost:3000` - should connect to API at `localhost:3001` via proxy.

### Test Production Setup

1. Deploy API to Vercel
2. Deploy frontend to Vercel with `VITE_API_BASE_URL` set
3. Visit your deployed frontend URL
4. Check browser console for API errors
5. Verify API health endpoint is accessible

