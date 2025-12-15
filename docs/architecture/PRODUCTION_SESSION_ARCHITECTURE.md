# Production Session Architecture

## Overview

This document explains how the federated identity pattern will work in production with proper RLS enforcement.

## Current Architecture (Development)

```
┌─────────────┐
│   Azure     │ ──> Issues JWT with oid claim
│     EEI     │
└─────────────┘
     │
     v
┌─────────────┐
│  Frontend   │ ──> Extracts oid, queries Supabase DIRECTLY
│   (React)   │     (No session, RLS doesn't work properly)
└─────────────┘
     │
     v
┌─────────────┐
│  Supabase   │ ──> RLS policies check auth.uid() = NULL
│   Database  │     Result: All data or no data (depending on policy)
└─────────────┘
```

## Production Architecture

```
┌─────────────┐
│   Azure     │ ──> Issues JWT with oid claim
│     EEI     │
└─────────────┘
     │
     v
┌─────────────┐
│  Frontend   │ ──> Sends Azure token to backend
│   (React)   │
└─────────────┘
     │
     v
┌─────────────┐     ┌─────────────┐
│   Backend   │────>│  Supabase   │ ──> Queries auth_users by oid
│     API     │     │  Database   │     Returns organization_id, role, customer_type
│  (Express)  │<────│   (admin)   │
└─────────────┘     └─────────────┘
     │                      │
     │                      v
     │              ┌─────────────┐
     │              │  Supabase   │ ──> SET LOCAL app.organization_id = 'uuid'
     │              │  Database   │     SET LOCAL app.user_role = 'contributor'
     │              │  (session)  │     Queries cnt_contents
     │              │             │     RLS uses get_app_organization_id()
     │              │             │     Returns only user's org content
     │              └─────────────┘
     v
┌─────────────┐
│  Frontend   │ ──> Receives filtered results
│   (React)   │     Displays content
└─────────────┘
```

## How PostgreSQL Session Variables Work

### 1. Backend Sets Session Variables

```typescript
// In backend API (Express.js)
app.post('/api/contents', verifyInternalToken, async (req, res) => {
  // req.user contains { id, organization_id, role, customer_type }
  
  // Query with organization context
  const { data } = await supabase.rpc('query_contents_with_context', {
    // Pass user context
    user_org_id: req.user.organization_id,
    user_role: req.user.role
  });
  
  // OR use raw SQL with SET LOCAL
  const result = await db.query(`
    BEGIN;
    SET LOCAL app.organization_id = $1;
    SET LOCAL app.user_role = $2;
    SELECT * FROM cnt_contents;
    COMMIT;
  `, [req.user.organization_id, req.user.role]);
});
```

### 2. RLS Policy Uses the Variable

```sql
-- In database
CREATE POLICY "org_content_isolation" ON "public"."cnt_contents"
FOR SELECT USING (
  organization_id = get_app_organization_id()  -- Reads from app.organization_id session variable
);
```

### 3. Flow

1. Frontend requests `/api/contents`
2. Backend middleware verifies internal JWT, extracts `req.user.organization_id`
3. Backend queries with `SET LOCAL app.organization_id = '<org-id>'`
4. RLS policy `get_app_organization_id()` reads the session variable
5. Only content matching that organization is returned
6. Frontend displays filtered results

## Implementation Steps

### 1. Backend API Endpoints

Create endpoints in `api/routes/`:
- `GET /api/contents` - Query with RLS
- `GET /api/services` - Query with RLS
- `POST /api/contents` - Insert with RLS
- etc.

### 2. Use PostgreSQL Client with Session Variables

```typescript
// In api/lib/dbClient.ts
export async function queryWithContext(query: string, params: any[], context: {
  organization_id: string;
  role: string;
}) {
  await db.query('SET LOCAL app.organization_id = $1', [context.organization_id]);
  await db.query('SET LOCAL app.user_role = $1', [context.role]);
  return await db.query(query, params);
}
```

### 3. Frontend Queries Backend (Not Supabase Directly)

```typescript
// Frontend queries backend API instead of Supabase
const response = await fetch('/api/contents', {
  headers: {
    'Authorization': `Bearer ${internalJWT}`
  }
});
```

## Benefits

1. **Proper RLS**: Session variables ensure RLS policies work correctly
2. **Centralized Logic**: All filtering happens in database
3. **Secure**: No bypassing RLS with service role key in frontend
4. **Production-Ready**: Same pattern works with Azure PostgreSQL
5. **Scalable**: Database does the heavy lifting

## Migration Path

**Phase 1 (Current - Dev)**
- Frontend queries Supabase directly
- Permissive RLS for development
- Organization filtering in application code

**Phase 2 (Intermediate)**
- Frontend queries backend API
- Backend queries Supabase with session variables
- RLS enforces organization isolation

**Phase 3 (Production)**
- Backend queries Azure PostgreSQL with session variables
- RLS enforces organization isolation
- No Supabase dependency

## Files to Create/Update

1. `api/routes/contents.ts` - Add session variable logic
2. `api/lib/postgresSession.ts` - Helper for setting session variables
3. `src/lib/apiClient.ts` - Use backend API instead of Supabase
4. `database/migrations/fix_cnt_contents_rls_proper.sql` - Production RLS policy

