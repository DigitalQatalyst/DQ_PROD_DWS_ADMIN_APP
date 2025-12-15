# Federated Identity Troubleshooting

## Current Issue: "Missing Claims" Error

You're seeing: `customerType` and `userRole` are `null` in the Auth Debugger.

## Root Cause

The old Azure claims-based authentication is still active in your browser localStorage. The new federated identity code is in place but hasn't run yet.

## Solution

### Step 1: Clear Browser localStorage

Open browser console and run:
```javascript
localStorage.clear()
location.reload()
```

Or manually remove these keys:
```javascript
localStorage.removeItem('azure_user_info')
localStorage.removeItem('azure_customer_type')
localStorage.removeItem('azure_user_role')
localStorage.removeItem('azure_organisation_name')
```

### Step 2: Ensure Backend is Running

The federated identity login requires the backend API server to be running:

```bash
# In a separate terminal
cd api
npm install
npm run dev  # or however you start the API server
```

The backend should be running on `http://localhost:3001` (default).

### Step 3: Verify Database Migrations

Make sure you've run the database migrations to add the `azure_oid` column:

```sql
-- In Supabase SQL Editor, run these migrations in order:
1. add_azure_sub.sql
2. update_auth_profiles.sql
3. update_rls_policies.sql
4. update_all_rls_policies.sql
5. migrate_to_azure_oid.sql
```

### Step 4: Provision Test User

You need to have a user in the database with `azure_oid` populated:

```sql
-- Check if user exists with azure_oid
SELECT id, email, azure_oid, azure_sub 
FROM auth_users 
WHERE email = 'your-test-user-email';

-- If missing, add azure_oid from the Azure token
UPDATE auth_users 
SET azure_oid = 'actual-oid-from-azure-jwt'
WHERE email = 'your-test-user-email';
```

### Step 5: Check Login Flow

After clearing localStorage and restarting:

1. Login with Azure EEI
2. Frontend calls `/api/auth/login` with Azure token
3. Backend looks up user by `azure_oid`
4. Backend returns internal JWT with authorization context
5. Frontend stores internal JWT in localStorage
6. AuthContext loads customerType/userRole from internal JWT

## Debugging

### Check Console Logs

Look for these messages:
- `🔐 Got Azure ID token, exchanging for internal JWT...`
- `✅ Received internal JWT with authorization context`
- `🔄 Loading from internal JWT (federated identity)`

If you don't see these, the new flow isn't running.

### Check Network Tab

Look for:
- `POST /api/auth/login` - Should return 200 with token
- `GET /api/auth/me` - Should return user info

If you see 403 errors, the user isn't provisioned in the database.

### Verify Backend Configuration

Check `.env.local` has:
```bash
SUPABASE_URL=https://eipfmtuxdktbotimuunl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-actual-key>
JWT_SECRET=52sdrQaVIjUpjHsOMPaUbQCXgAwsI42AM3vz6PYfMs
```

## Expected Flow

### Old Flow (Azure Claims)
```
Azure Login → Azure Claims → Local Storage → ProtectedRoute checks claims
```

### New Flow (Federated Identity)
```
Azure Login → /api/auth/login → Backend looks up by azure_oid → Internal JWT → Local Storage → ProtectedRoute checks internal JWT context
```

The key difference: **Authorization context comes from the database, not Azure claims.**

