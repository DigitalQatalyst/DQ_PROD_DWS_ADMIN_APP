# Federated Identity Implementation Summary

## Overview

Successfully implemented federated identity authentication pattern where Azure EEI handles authentication only, and the local database manages all authorization context.

## Changes Implemented

### Phase 1: Database Schema ✅

**Created Migration Files:**
1. `database/migrations/add_azure_sub.sql`
   - Adds `azure_sub` and `azure_oid` columns to `auth_users`
   - Creates indexes for fast lookups

2. `database/migrations/update_auth_profiles.sql`
   - Adds constraints for `customer_type` and `role` fields
   - Ensures only valid enum values are allowed

3. `database/migrations/update_rls_policies.sql`
   - Updates RLS policies for federated identity pattern
   - Creates helper functions: `get_app_organization_id()`, `get_app_user_role()`, `get_app_customer_type()`

### Phase 2: Backend Services ✅

**Created Files:**
1. `api/mw/internalAuth.ts` ⭐ NEW
   - Internal JWT middleware for verifying local session tokens
   - Functions: `verifyInternalToken()`, `issueInternalToken()`, `setTokenCookie()`
   - Issues internal JWTs with: `{sub, organization_id, role, customer_type, exp}`

2. `api/routes/admin.ts` ⭐ NEW
   - Admin endpoints for user provisioning
   - `GET /api/admin/users` - List users in organization
   - `POST /api/admin/users` - Provision new user
   - `PATCH /api/admin/users/:id` - Update user role/customer_type

**Updated Files:**
1. `api/routes/auth.ts`
   - Added `POST /api/auth/login` - Federated identity login endpoint
     - Validates Azure JWT
     - Looks up user by azure_sub
     - Returns 403 if user not provisioned
     - Issues internal JWT with authorization context
   - Added `POST /api/auth/logout` - Clear session token
   - Added `GET /api/auth/me` - Get current user from internal JWT

2. `api/auth/middleware/verifyAzureToken.ts`
   - Refactored for federated identity
   - Extracts only `sub`/`oid` and `email` (authentication only)
   - Does NOT extract customerType, userRole, companyName

3. `api/server.ts`
   - Added cookie-parser middleware
   - Added CORS with credentials support
   - Registered auth and admin routes

**Updated Dependencies:**
- Added `cookie-parser`, `cors`, `pg` to package.json
- Added TypeScript types for cookie-parser and cors

### Phase 3: Frontend Updates ✅

**Created Files:**
1. `src/lib/federatedAuth.ts` ⭐ NEW
   - `exchangeAzureTokenForInternalJWT()` - Exchange Azure token for internal JWT
   - `parseInternalJWT()` - Parse internal JWT to extract claims
   - `getInternalJWT()`, `setInternalJWT()`, `clearInternalJWT()`
   - `isInternalJWTExpired()` - Check token expiration

**Updated Files:**
1. `src/components/AzureAuthWrapper.tsx`
   - Updated `handleUserLogin()` to use federated identity pattern
   - Calls backend `/api/auth/login` with Azure token
   - Receives and stores internal JWT
   - Parses internal JWT for authorization context
   - Handles user_not_provisioned error gracefully

2. `src/context/AuthContext.tsx`
   - Updated to load from internal JWT on page load
   - Checks for internal JWT first (federated identity)
   - Falls back to legacy Azure claims (migration support)
   - Builds CASL abilities from internal JWT context

3. `src/lib/apiClient.ts`
   - Updated to use internal JWT for all API requests
   - Automatically includes internal JWT in Authorization header

**Updated Configuration:**
- `.env.local` - Added `JWT_SECRET` and `JWT_EXPIRY` variables

## Migration Steps Required

### 1. Run Database Migrations

```bash
# Connect to your Supabase/PostgreSQL database
psql "your-connection-string"

# Run migrations in order
\i database/migrations/add_azure_sub.sql
\i database/migrations/update_auth_profiles.sql
\i database/migrations/update_rls_policies.sql
```

### 2. Manual User Provisioning

For each test user, update the `azure_sub` column:

```sql
-- Get the azure_sub from Azure token (decode JWT and get 'sub' claim)
UPDATE auth_users 
SET azure_sub = '<actual_azure_sub_from_token>'
WHERE email = '<user_email>';

-- Verify all users have azure_sub
SELECT id, email, azure_sub 
FROM auth_users 
WHERE azure_sub IS NULL;
```

### 3. Ensure User Profiles Exist

```sql
-- Check for users without profiles
SELECT au.id, au.email, au.azure_sub
FROM auth_users au
LEFT JOIN auth_user_profiles aup ON au.id = aup.user_id
WHERE aup.id IS NULL;

-- Create profiles for existing users
INSERT INTO auth_user_profiles (
  user_id, 
  organization_id, 
  role, 
  customer_type
)
SELECT 
  au.id,
  '<organization_uuid>',
  'admin', -- first user
  'staff'
FROM auth_users au
WHERE NOT EXISTS (
  SELECT 1 FROM auth_user_profiles aup WHERE aup.user_id = au.id
)
LIMIT 1;
```

### 4. Update Environment Variables

Update `.env.local` with strong JWT secret:

```bash
JWT_SECRET=<generate-a-random-32-char-secret>
JWT_EXPIRY=86400  # 24 hours
```

## How It Works

### Authentication Flow

1. **User logs in with Azure EEI** → Gets Azure JWT token
2. **Frontend calls `/api/auth/login`** with Azure token
3. **Backend validates Azure JWT** → Extracts only `sub` and `email`
4. **Backend looks up user** in `auth_users` by `azure_sub`
5. **If user not found** → Returns 403 "user_not_provisioned"
6. **If user found** → Fetches authorization context from `auth_user_profiles`
7. **Backend issues internal JWT** with: `{sub, organization_id, role, customer_type}`
8. **Frontend stores internal JWT** in localStorage + httpOnly cookie
9. **All subsequent API requests** use internal JWT (not Azure token)

### Authorization Flow

1. **API request** includes internal JWT in Authorization header
2. **Backend middleware** verifies internal JWT signature
3. **Backend extracts** organization_id, role, customer_type from JWT
4. **Backend sets PostgreSQL context** for RLS policies
5. **RLS policies** filter data by organization_id automatically
6. **CASL abilities** use role and customer_type for permission checks

## Benefits

- **Centralized Authorization**: All permissions managed in local database
- **Flexible RBAC**: Admins can change roles without Azure reconfiguration
- **Better Security**: Azure tokens not used for ongoing authorization
- **Easier Auditing**: All authorization decisions traced to local database
- **Database-Driven**: Authorization logic uses standard SQL queries
- **No Self-Service**: Users must be provisioned by admin (better security)

## Testing Checklist

- [ ] Run database migrations successfully
- [ ] Provision test users with azure_sub values
- [ ] Test `/api/auth/login` endpoint
- [ ] Verify internal JWT is issued correctly
- [ ] Test API requests use internal JWT
- [ ] Verify RLS policies enforce org isolation
- [ ] Test CASL permissions work with new context
- [ ] Test user logout clears internal JWT
- [ ] Verify session persists on page refresh

## Next Steps

1. Run migrations on test database
2. Provision test users with actual azure_sub values
3. Test the complete login flow
4. Verify RLS policies work correctly
5. Test that existing features still work
6. Add admin UI for user provisioning (optional)
7. Remove legacy Azure claim-based code after validation

## Files Changed

**New Files (8):**
- `database/migrations/add_azure_sub.sql`
- `database/migrations/update_auth_profiles.sql`
- `database/migrations/update_rls_policies.sql`
- `database/migrations/README.md`
- `api/mw/internalAuth.ts`
- `api/routes/admin.ts`
- `src/lib/federatedAuth.ts`
- `docs/FEDERATED_IDENTITY_IMPLEMENTATION.md`

**Updated Files (9):**
- `package.json` - Added dependencies
- `api/server.ts` - Added cookie-parser, CORS, routes
- `api/routes/auth.ts` - Added federated login endpoint
- `api/auth/middleware/verifyAzureToken.ts` - Simplified for auth only
- `src/components/AzureAuthWrapper.tsx` - Updated login flow
- `src/context/AuthContext.tsx` - Load from internal JWT
- `src/lib/apiClient.ts` - Use internal JWT
- `.env.local` - Added JWT config
- `api/mw/authModeToggle.ts` - Fixed TypeScript errors

## Security Notes

1. **JWT_SECRET**: Must be 32+ characters, randomly generated
2. **httpOnly cookies**: Prevent XSS attacks on internal JWT
3. **Token expiry**: 24 hours by default, configurable
4. **No self-service**: Users must be pre-provisioned (better security)
5. **Azure token validation**: Still required but only for authentication
6. **RLS policies**: Enforce data isolation at database level

## Rollback Plan

If issues arise, you can rollback by:

1. Keep using Azure claims (revert frontend changes)
2. Revert database migrations
3. Remove internal JWT middleware
4. Restore legacy authorization flow

The system has been implemented with backward compatibility in mind during the transition period.

