# Business Directory Data Fetching Issue - Diagnostic Guide

## Issue
The `/business-directory` route is not fetching data from Supabase.

## Root Cause
The `useCRUD` hook has a CASL permission check that blocks data fetching if the user doesn't have read permission for the `Business` subject.

## Diagnostic Steps

### 1. Check Browser Console
Open the browser console and navigate to `/business-directory`. Look for these messages:

**Permission Denied:**
```
❌ Permission denied: Cannot read Business. Ability rules: [...]
```

**Auth Debug Info:**
```
🔍 Auth Debug Info: {
  tableName: "eco_business_directory",
  recordCount: 0,
  ...
}
```

### 2. Check localStorage
In the browser console, run:
```javascript
console.log({
  user: localStorage.getItem('platform_admin_user'),
  user_segment: localStorage.getItem('user_segment'),
  user_role: localStorage.getItem('user_role'),
  organization_id: localStorage.getItem('user_organization_id'),
  azure_organisation_name: localStorage.getItem('azure_organisation_name')
});
```

### 3. Check User Abilities
In the browser console, run:
```javascript
// This will show what permissions the current user has
const authContext = JSON.parse(localStorage.getItem('platform_admin_user'));
console.log('User context:', authContext);
```

## Common Issues & Solutions

### Issue 1: User Not Authenticated
**Symptom:** `user_segment` or `user_role` is null/undefined in localStorage

**Solution:** Ensure user is properly logged in through Azure authentication

### Issue 2: Role Doesn't Have Business Read Permission
**Symptom:** User is authenticated but `ability.can('read', 'Business')` returns false

**Solution:** Check the ability configuration in `src/auth/ability.ts`. The role should have read access to 'Business':
- `viewer` role should have read access
- `editor` role should have read and write access
- `admin` role should have full access

### Issue 3: Auth Context Still Loading
**Symptom:** Permission check runs before auth context is fully initialized

**Solution:** The code has a 100ms wait at line 67 of `useCRUD.ts`, but this might not be enough. The auth context loads with a 500ms delay in `AuthContext.tsx` line 131.

### Issue 4: Supabase Credentials Not Configured
**Symptom:** Console shows "Supabase credentials not configured"

**Solution:** Check that `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Quick Fix Options

### Option 1: Increase Auth Loading Wait Time
In `src/hooks/useCRUD.ts` line 67, increase the wait time:
```typescript
if (authLoading) {
  logger.debug('Auth still loading, waiting...');
  await new Promise(resolve => setTimeout(resolve, 600)); // Increased from 100ms to 600ms
}
```

### Option 2: Add Retry Logic
Modify the `list` function to retry if auth is still loading:
```typescript
// If auth is still loading after wait, retry once
if (authLoading) {
  logger.debug('Auth still loading after wait, retrying...');
  await new Promise(resolve => setTimeout(resolve, 500));
  if (authLoading) {
    logger.error('Auth still loading after retry, aborting');
    setError(new Error('Authentication still loading'));
    setLoading(false);
    return;
  }
}
```

### Option 3: Remove Permission Check (Temporary Debug)
**WARNING: Only for debugging, not for production**

Comment out the permission check in `src/hooks/useCRUD.ts` lines 71-77 to see if data fetches without it:
```typescript
// TEMPORARY DEBUG - REMOVE IN PRODUCTION
// if (!ability.can('read', subject)) {
//   logger.error(`Permission denied: Cannot read ${subject}`);
//   setError(new Error(`You don't have permission to read ${subject.toLowerCase()}s`));
//   setLoading(false);
//   return;
// }
```

## Files to Check

1. **Permission Configuration:**
   - `src/auth/ability.ts` - CASL ability rules
   - `src/hooks/useCRUD.ts` - Permission checks

2. **Auth Context:**
   - `src/context/AuthContext.tsx` - User authentication state
   - `src/lib/federatedAuth.ts` - JWT handling

3. **Database Client:**
   - `src/lib/dbClient.ts` - Supabase connection
   - `.env` - Environment variables

4. **Business Directory Page:**
   - `src/components/BusinessDirectoryPage.tsx` - Main component
   - `src/pages/business-directory.tsx` - Route wrapper

## Next Steps

1. Open browser console and check for error messages
2. Verify localStorage has proper user context
3. Check if Supabase credentials are configured
4. Try one of the quick fix options above
5. If issue persists, check Supabase RLS policies
