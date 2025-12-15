# Business Directory - 0 Records Issue Fix

## Problem
The query shows 0 records even though there are 6 businesses in the database.

## Root Cause
The `useCRUD` hook is applying an `organization_id` filter that's blocking the records.

## Check Your Console
Look for this log message in the browser console:
```
🔍 Query Filter Decision: {
  organizationId: "...",
  userSegment: "...",
  tableName: "eco_business_directory",
  willApplyOrgFilter: true/false
}
```

## Solutions

### Solution 1: Set User Segment to 'internal' (Recommended)
If you're an internal user and should see all businesses:

**In browser console, run:**
```javascript
localStorage.setItem('user_segment', 'internal');
location.reload();
```

This will bypass the organization filter and show all businesses.

### Solution 2: Match Organization IDs
If the businesses in your database have a specific `organization_id`, make sure your localStorage has the same value:

**Check database records:**
```sql
SELECT DISTINCT organization_id FROM eco_business_directory;
```

**Set matching organization_id in browser console:**
```javascript
localStorage.setItem('user_organization_id', 'YOUR_ORG_ID_FROM_DB');
location.reload();
```

### Solution 3: Temporarily Disable Organization Filter (Debug Only)
**WARNING: Only for debugging, remove before production**

In `src/hooks/useCRUD.ts` around line 120, comment out the organization filter:

```typescript
// TEMPORARY DEBUG - REMOVE BEFORE PRODUCTION
// if (organizationId && userSegment !== 'internal') {
//   const orgScopedTables = ['cnt_contents', 'eco_business_directory', 'eco_growth_areas', 'mktplc_services'];
//   if (orgScopedTables.includes(tableName)) {
//     logger.warn(`⚠️ Applying org filter with organization_id: ${organizationId}`);
//     query = query.eq('organization_id', organizationId);
//   }
// }
```

### Solution 4: Update Database Records
If your businesses don't have an `organization_id` set, add one that matches your user's organization:

```sql
UPDATE eco_business_directory 
SET organization_id = 'YOUR_USER_ORG_ID'
WHERE organization_id IS NULL;
```

## Quick Diagnostic Commands

Run these in your browser console to diagnose:

```javascript
// 1. Check current user context
console.log('User Context:', {
  user_segment: localStorage.getItem('user_segment'),
  user_organization_id: localStorage.getItem('user_organization_id'),
  azure_organisation_name: localStorage.getItem('azure_organisation_name')
});

// 2. Check if you're internal user
console.log('Is Internal User:', localStorage.getItem('user_segment') === 'internal');

// 3. Set as internal user (if applicable)
// localStorage.setItem('user_segment', 'internal');
// location.reload();
```

## Expected Console Output After Fix

After applying Solution 1 (internal user), you should see:
```
✅ Internal user - no org filter applied (can see all content)
Fetched 6 records from eco_business_directory
📋 Businesses data updated: { total: 6, filtered: 6, paginated: 6 }
```

## Database Schema Check

Make sure your `eco_business_directory` table has these columns:
- `id` (primary key)
- `name`
- `type`
- `industry`
- `size`
- `status`
- `founded_year` (or `foundedYear`)
- `organization_id` (nullable or with default value)

If `organization_id` is required but your records don't have it, that's the issue.
