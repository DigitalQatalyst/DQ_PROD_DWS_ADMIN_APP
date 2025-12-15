# Vercel Deployment Guide

This guide explains how to deploy both the frontend and API to Vercel.

## Overview

The application consists of:
- **Frontend**: React app (Vite) - can be deployed as static site or serverless
- **API**: Express server - needs to be converted to Vercel serverless functions

## Deployment Options

### Option 1: Frontend on Vercel + API on Separate Service (Recommended)

**Best for**: Production applications with complex API requirements

**Steps:**

1. **Deploy Frontend to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from project root
   vercel
   ```

2. **Set Environment Variables in Vercel:**
   - `VITE_API_BASE_URL`: Your API server URL (e.g., `https://your-api.railway.app/api`)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - Other frontend environment variables

3. **Deploy API Separately:**
   - **Railway**: Good for Node.js apps, easy PostgreSQL connection
   - **Render**: Free tier available, supports Express apps
   - **Fly.io**: Good performance, global deployment
   - **DigitalOcean App Platform**: Simple deployment

   **Example: Railway Deployment:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   cd api
   railway up
   ```

4. **Configure API Environment Variables** (on your hosting service):
   - `DATABASE_URL`: PostgreSQL connection string
   - `AZURE_STORAGE_ACCOUNT`: Azure storage account name
   - `AZURE_STORAGE_ACCOUNT_KEY`: Azure storage key
   - `AZURE_STORAGE_CONTAINER`: Container name (default: 'uploads')
   - `AZURE_CDN_URL`: Optional CDN URL for uploads
   - `PORT`: Server port (usually auto-set by hosting)

### Option 2: Convert API to Vercel Serverless Functions

**Best for**: Simple APIs, cost-effective, unified deployment

**Steps:**

1. **Create Vercel API Routes:**

   Create `api/vercel/` directory in project root with serverless functions:

   ```
   api/
   vercel/
     auth/
       login.ts
     uploads/
       sign.ts
       put.ts
       delete.ts
     contents/
       index.ts
     services/
       index.ts
   ```

2. **Example: Convert Express Route to Serverless Function**

   **Before (Express):**
   ```typescript
   // api/routes/auth.ts
   router.post('/login', async (req, res) => {
     // ... handler logic
   });
   ```

   **After (Vercel Serverless):**
   ```typescript
   // api/vercel/auth/login.ts
   import type { VercelRequest, VercelResponse } from '@vercel/node';
   
   export default async function handler(
     req: VercelRequest,
     res: VercelResponse
   ) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // ... handler logic
     res.json({ success: true });
   }
   ```

3. **Create `vercel.json` Configuration:**

   ```json
   {
     "builds": [
       {
         "src": "api/vercel/**/*.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/vercel/$1"
       }
     ],
     "env": {
       "DATABASE_URL": "@database-url",
       "AZURE_STORAGE_ACCOUNT": "@azure-storage-account"
     }
   }
   ```

4. **Update Frontend API Base URL:**

   Set `VITE_API_BASE_URL` to your Vercel deployment URL:
   ```
   VITE_API_BASE_URL=https://your-app.vercel.app/api
   ```

## Important Considerations

### Database Connection Pooling

Vercel serverless functions are stateless and short-lived. For database connections:

1. **Use Connection Pooling Service:**
   - Supabase provides built-in connection pooling
   - Use PgBouncer or similar for direct PostgreSQL

2. **Connection String Format:**
   ```
   # Direct connection (not recommended for serverless)
   postgresql://user:pass@host:5432/db
   
   # With pooling (recommended)
   postgresql://user:pass@host:6543/db?pgbouncer=true
   ```

### File Uploads

Your current API uses Azure Blob Storage. For Vercel:

1. **Keep Azure Storage** (recommended):
   - Serverless functions can still use Azure SDK
   - Set environment variables in Vercel dashboard
   - No code changes needed

2. **Alternative: Vercel Blob Storage:**
   - Native Vercel solution
   - Requires code changes in `api/routes/uploads.ts`
   - Simpler but less flexible

### Environment Variables

**Frontend (Vite) Variables:**
- Must start with `VITE_`
- Accessible in browser code
- Set in Vercel dashboard → Settings → Environment Variables

**API Variables:**
- No `VITE_` prefix
- Only accessible server-side
- Set same way in Vercel dashboard

### CORS Configuration

Update CORS in your API to allow Vercel domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Recommended Deployment Architecture

```
┌─────────────────┐
│   Vercel (FE)   │
│  React App      │
│  Static Assets  │
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│  Railway/Render │
│  Express API    │
│  Port 3001      │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼───┐  ┌──▼───┐
│  DB   │  │Azure │
│(Supabase)│ │Storage│
└───────┘  └──────┘
```

## Quick Start Checklist

- [ ] Deploy frontend to Vercel
- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Deploy API to separate service (Railway/Render/Fly.io)
- [ ] Configure API environment variables
- [ ] Update CORS on API to allow Vercel domain
- [ ] Test API health endpoint: `https://your-api.com/api/health`
- [ ] Test frontend: `https://your-app.vercel.app`
- [ ] Configure custom domain (optional)

## Troubleshooting

### API Timeout Errors

Vercel serverless functions have timeout limits:
- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 300 seconds

For long-running operations, consider:
- Moving to separate API service
- Using background jobs (Vercel Cron + Queue)

### Database Connection Errors

- Use connection pooling
- Check connection string format
- Verify database allows connections from Vercel IPs
- Consider using Supabase (handles pooling automatically)

### File Upload Issues

- Verify Azure Storage credentials
- Check CORS on Azure Storage container
- Ensure `AZURE_CDN_URL` is set correctly
- Test signed URL generation

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Railway Deployment](https://docs.railway.app/)
- [Render Deployment](https://render.com/docs)

