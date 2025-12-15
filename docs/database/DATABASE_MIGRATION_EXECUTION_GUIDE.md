# Database Migration Execution Guide

## Quick Start

Run these 4 migrations **in order** using Supabase Dashboard:

### Migration Order

1. `add_azure_sub.sql` - Adds azure_sub column
2. `update_auth_profiles.sql` - Adds constraints + fixes invalid data
3. `update_rls_policies.sql` - Creates helper functions
4. `update_all_rls_policies.sql` - Updates all table RLS policies

## Step-by-Step Execution

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `Ready-to-Review-v48-KF-Platform-Admin-Dashboard`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Migration 1 - add_azure_sub.sql

```sql
-- Copy and paste this entire file content
-- Location: database/migrations/add_azure_sub.sql
```

**Click "Run" button** (or press Ctrl+Enter)

### Step 3: Run Migration 2 - update_auth_profiles.sql

```sql
-- Copy and paste this entire file content
-- Location: database/migrations/update_auth_profiles.sql
```

**What it does:**
- Fixes any invalid `role` values (sets to 'viewer')
- Fixes any invalid `customer_type` values (sets to 'staff')
- Adds constraints to prevent future invalid data

**Click "Run" button**

### Step 4: Run Migration 3 - update_rls_policies.sql

```sql
-- Copy and paste this entire file content
-- Location: database/migrations/update_rls_policies.sql
```

**What it does:**
- Creates `get_app_organization_id()` helper function
- Creates `get_app_user_role()` helper function  
- Creates `get_app_customer_type()` helper function
- These functions read from PostgreSQL session variables set by backend

**Click "Run" button**

### Step 5: Run Migration 4 - update_all_rls_policies.sql

```sql
-- Copy and paste this entire file content
-- Location: database/migrations/update_all_rls_policies.sql
```

**What it does:**
- Drops old RLS policies (that use `get_org_id_from_claim()`)
- Creates new RLS policies for all tables with `organization_id`
- Uses `get_app_organization_id()` for federated identity
- Applies to tables: activity_logs, cnt_resources, cnt_events, cnt_experiences, 
  cnt_contents, comm_mentors, eco_business_directory, eco_growth_areas, eco_programs, 
  eco_zones, mktplc_services

**Click "Run" button**

## Verification

After running all migrations, verify the changes:

### 1. Check azure_sub column exists

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'auth_users' 
  AND column_name = 'azure_sub';
```

**Expected:** Should return 1 row with `azure_sub` column

### 2. Check constraints were added

```sql
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_name IN ('customer_type_check', 'role_check')
  AND table_name = 'auth_user_profiles';
```

**Expected:** Should return 2 rows (one for each constraint)

### 3. Check helper functions exist

```sql
SELECT routine_name 
FROM information_schema.routines
WHERE routine_name IN ('get_app_organization_id', 'get_app_user_role', 'get_app_customer_type')
  AND routine_schema = 'public';
```

**Expected:** Should return 3 rows (one for each function)

### 4. Check RLS policies were created

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public' 
  AND policyname = 'org_rls_policy';
```

**Expected:** Should return 11 rows (one for each table)

## Troubleshooting

### Error: "Helper function does not exist"

**Solution:** You're running migrations out of order. Run `update_rls_policies.sql` before `update_all_rls_policies.sql`

### Error: "check constraint violated"

**Solution:** The migration has been updated to automatically fix invalid data. Just run it again.

### Error: "policy already exists"

**Solution:** The migration uses `DROP POLICY IF EXISTS`, so running it multiple times is safe.

## Rollback (If Needed)

If you need to rollback, you can:

```sql
-- Remove azure_sub column
ALTER TABLE auth_users DROP COLUMN IF EXISTS azure_sub;
ALTER TABLE auth_users DROP COLUMN IF EXISTS azure_oid;

-- Drop indexes
DROP INDEX IF EXISTS idx_auth_users_azure_sub;
DROP INDEX IF EXISTS idx_auth_users_email;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_app_organization_id();
DROP FUNCTION IF EXISTS get_app_user_role();
DROP FUNCTION IF EXISTS get_app_customer_type();

-- Drop constraints
ALTER TABLE auth_user_profiles DROP CONSTRAINT IF EXISTS customer_type_check;
ALTER TABLE auth_user_profiles DROP CONSTRAINT IF EXISTS role_check;
```

## Next Steps

After migrations complete successfully:

1. **Manually populate azure_sub** for test users (see `database/migrations/README.md`)
2. **Set environment variables** in `.env.local`:
   - `JWT_SECRET` (min 32 characters)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
3. **Test the login flow** with federated identity
4. **Verify RLS isolation** by querying data from different organizations

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Review migration output for error messages
3. Verify helper functions exist with the verification queries above
4. Check that all required tables have RLS policies

