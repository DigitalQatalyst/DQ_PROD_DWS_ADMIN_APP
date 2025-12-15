# Vercel API Deployment: Module Not Found Fix

## Problem

When deploying the AdminApp_API to Vercel, you may encounter:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server' import
```

This happens because Vercel's serverless function environment cannot resolve the TypeScript module imports correctly.

## Root Cause

1. **ESM Module Resolution**: The `package.json` has `"type": "module"`, which requires ESM imports
2. **Vercel Build Configuration**: The `@vercel/node` builder needs explicit configuration to include all TypeScript files
3. **Module Resolution**: TypeScript's `moduleResolution: "bundler"` may not work well with Vercel's build process

## Solution

### 1. Updated `vercel.json`

Added explicit file inclusion in the build configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": [
          "server.ts",
          "routes/**",
          "mw/**",
          "db/**",
          "auth/**",
          "shared/**",
          "ability.ts"
        ]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### 2. Updated `tsconfig.json`

Changed `moduleResolution` from `"bundler"` to `"node"` for better compatibility:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    // ... other options
  }
}
```

### 3. Created `.vercelignore`

Excludes unnecessary files from deployment:

```
node_modules
dist
uploads
*.log
.env.local
.env.*.local
```

## Verification

After deploying, check:

1. **Vercel Build Logs**: Should show successful TypeScript compilation
2. **Function Logs**: No `ERR_MODULE_NOT_FOUND` errors
3. **Health Endpoint**: `GET /api/health` should return 200

## Alternative: Use Frontend Serverless Functions

If you continue to have issues with the separate API deployment, consider using the frontend serverless functions approach (see `FRONTEND_UPLOADS_SERVERLESS.md`), which eliminates many deployment complexity issues.

## Troubleshooting

### Still seeing module not found?

1. **Check file paths**: Ensure all imported files exist in the repository
2. **Verify includeFiles**: All directories containing imports should be listed
3. **Check import syntax**: Use relative imports (`../server` not `/server`)
4. **Review build logs**: Look for TypeScript compilation errors

### Function timeout?

Increase timeout in `vercel.json`:

```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 60
    }
  }
}
```

### Missing environment variables?

Ensure all required environment variables are set in Vercel project settings:
- `DATABASE_URL`
- `AZURE_STORAGE_ACCOUNT`
- `AZURE_STORAGE_ACCOUNT_KEY`
- `JWT_SECRET`
- etc.

