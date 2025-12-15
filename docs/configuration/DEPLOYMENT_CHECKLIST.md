# Deployment Checklist

Use this checklist to ensure your app works correctly in both local and production environments.

## Pre-Deployment

### 1. API Deployment (Vercel)

- [ ] API repository is on GitHub
- [ ] API deployed to Vercel
- [ ] API health endpoint accessible: `https://your-api.vercel.app/api/health`
- [ ] Environment variables configured in Vercel API project:
  - [ ] `DATABASE_URL`
  - [ ] `AZURE_STORAGE_ACCOUNT`
  - [ ] `AZURE_STORAGE_ACCOUNT_KEY`
  - [ ] `AZURE_STORAGE_CONTAINER`
  - [ ] `AZURE_CDN_URL` (optional)
  - [ ] `NODE_ENV=production`

### 2. Frontend Configuration

- [ ] `.env.example` file exists and is up to date
- [ ] No hardcoded API URLs in code
- [ ] All API calls use `apiConfig` utility or `apiClient`
- [ ] Vite proxy configured correctly for local dev

### 3. Environment Variables

**Local Development (.env):**
- [ ] `VITE_API_BASE_URL` is empty or unset (uses Vite proxy)
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Azure AD variables are set

**Production (Vercel Frontend):**
- [ ] `VITE_API_BASE_URL` = `https://your-api.vercel.app/api`
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Azure AD variables are set (with production redirect URI)

## Testing

### Local Development

1. **Start API Server:**
   ```bash
   cd api
   npm run dev
   ```
   - [ ] API starts on port 3001
   - [ ] Health check works: `http://localhost:3001/api/health`

2. **Start Frontend:**
   ```bash
   npm run dev
   ```
   - [ ] Frontend starts on port 3000
   - [ ] Can login with Azure AD
   - [ ] API calls work (check browser network tab)
   - [ ] File uploads work
   - [ ] No CORS errors in console

### Production (Vercel)

1. **Deploy Frontend:**
   - [ ] Push to GitHub
   - [ ] Vercel auto-deploys
   - [ ] Build succeeds

2. **Test Production:**
   - [ ] Visit deployed frontend URL
   - [ ] Can login with Azure AD
   - [ ] API calls work (check browser network tab)
   - [ ] API calls go to correct Vercel API URL
   - [ ] File uploads work
   - [ ] No console errors
   - [ ] No CORS errors

## Common Issues

### Issue: API calls failing in production

**Symptoms:**
- Network errors in browser console
- 404 errors for API endpoints
- CORS errors

**Solutions:**
1. Check `VITE_API_BASE_URL` is set correctly in Vercel
2. Verify API is deployed and accessible
3. Check API CORS configuration allows your frontend domain
4. Test API health endpoint directly in browser

### Issue: API calls failing locally

**Symptoms:**
- Network errors when calling `/api/*`
- 404 errors

**Solutions:**
1. Ensure API server is running on port 3001
2. Check `VITE_API_BASE_URL` is empty or unset in `.env`
3. Verify Vite proxy is configured in `vite.config.ts`
4. Restart dev server after changing `.env`

### Issue: File uploads not working

**Symptoms:**
- Upload fails with network error
- Signed URL generation fails

**Solutions:**
1. Check Azure Storage credentials in API environment variables
2. Verify `AZURE_STORAGE_CONTAINER` is set correctly
3. Check API `/api/uploads/sign` endpoint is accessible
4. Verify CORS on Azure Storage container

## Quick Verification Commands

```bash
# Test API locally
curl http://localhost:3001/api/health

# Test API in production
curl https://your-api.vercel.app/api/health

# Check environment variables (in browser console)
console.log(import.meta.env.VITE_API_BASE_URL)
```

## After Deployment

- [ ] Monitor Vercel logs for errors
- [ ] Test all critical user flows
- [ ] Verify file uploads work
- [ ] Check API response times
- [ ] Monitor error tracking (if configured)

