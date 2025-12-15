# Database Migrations for Federated Identity

## Migration Order

Apply these migrations in order:

1. `add_azure_sub.sql` - Add azure_sub column to auth_users
2. `update_auth_profiles.sql` - Add constraints to auth_user_profiles
3. `update_rls_policies.sql` - Create helper functions for federated identity
4. `update_all_rls_policies.sql` - Update all table RLS policies to use helper functions
5. `migrate_to_azure_oid.sql` - Migrate to azure_oid as PRIMARY identifier ⭐ NEW

**Important:** 
- `azure_oid` (Object ID) = PRIMARY federated identifier - stable across app registrations
- `azure_sub` (Subject) = App-specific, kept for legacy compatibility only
- Run migration 5 if you want to switch to oid-based lookups

### How to Run Migrations with Supabase

**Option 1: Using Supabase Dashboard (Recommended for Dev)**

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Create a new query and paste the contents of each migration file **in order**:
   - Copy contents of `add_azure_sub.sql` → Paste → Run
   - Copy contents of `update_auth_profiles.sql` → Paste → Run
   - Copy contents of `update_rls_policies.sql` → Paste → Run
   - Copy contents of `update_all_rls_policies.sql` → Paste → Run
   - Copy contents of `migrate_to_azure_oid.sql` → Paste → Run ⭐ NEW
4. Verify the changes by checking the table structure in the Table Editor

**Option 2: Using psql (Command Line)**

```bash
# Connect to Supabase database
psql "postgresql://postgres:[PASSWORD]@db.eipfmtuxdktbotimuunl.supabase.co:5432/postgres"

# Run migrations in order
\i database/migrations/add_azure_sub.sql
\i database/migrations/update_auth_profiles.sql
\i database/migrations/update_rls_policies.sql
\i database/migrations/update_all_rls_policies.sql
\i database/migrations/migrate_to_azure_oid.sql  # NEW - use oid as primary
```

**Option 3: Using Supabase CLI**

```bash
# If you have Supabase CLI installed
supabase db push --db-url "your-connection-string"
```

## Manual Steps Required

### 1. Add azure_oid to existing users (PRIMARY identifier)

After running `migrate_to_azure_oid.sql`, you need to manually populate the `azure_oid` column for existing test users:

**Important:** `azure_oid` (Object ID) is now the PRIMARY identifier. `azure_sub` is kept for legacy only.

```sql
-- Update azure_oid for test users (PRIMARY identifier)
-- Get oid from Azure token: decode JWT and extract 'oid' claim
UPDATE auth_users 
SET azure_oid = '<actual_azure_oid_from_token>'
WHERE email = '<user_email>';

-- Example:
-- UPDATE auth_users 
-- SET azure_oid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- WHERE email = 'john.doe@example.com';

-- Verify all users have azure_oid (required for federated identity)
SELECT id, email, azure_oid, azure_sub 
FROM auth_users 
WHERE azure_oid IS NULL;

-- Make azure_oid NOT NULL after all users are populated (PRIMARY identifier)
ALTER TABLE auth_users ALTER COLUMN azure_oid SET NOT NULL;
```

### 2. Diagnose existing data (IMPORTANT - Run this first!)

Before running `update_auth_profiles.sql`, check what invalid values exist:

```sql
-- Run this in Supabase SQL Editor
\i database/migrations/diagnose_auth_profiles.sql

-- OR paste the contents of diagnose_auth_profiles.sql
```

This will show you any `role` or `customer_type` values that don't match the allowed set.

### 3. Run the update_auth_profiles migration

The updated migration will automatically fix invalid values:
- Invalid `role` values → Set to 'viewer'
- Invalid `customer_type` values → Set to 'staff'

Then it adds the constraints.

**Note:** The migration has been updated to automatically fix invalid data before adding constraints, so it should now run without errors.

### 4. Verify auth_user_profiles data

Check that all active users have profiles:

```sql
-- Check for users without profiles
SELECT au.id, au.email, au.azure_sub
FROM auth_users au
LEFT JOIN auth_user_profiles aup ON au.id = aup.user_id
WHERE aup.id IS NULL AND au.is_active = true;
```

### 5. Set up organizations

```sql
-- View existing organizations
SELECT id, name, display_name, type, status 
FROM auth_organizations;

-- If needed, create organization
INSERT INTO auth_organizations (name, display_name, type, status)
VALUES ('DigitalQatalyst', 'DigitalQatalyst', 'staff', 'Active')
RETURNING id;
```

### 6. Link users to organizations and create profiles

```sql
-- Create user profiles for existing users
INSERT INTO auth_user_profiles (
  user_id, 
  organization_id, 
  role, 
  customer_type
)
SELECT 
  au.id,
  '<organization_uuid>',
  'admin', -- or 'viewer' as appropriate
  'staff'
FROM auth_users au
WHERE NOT EXISTS (
  SELECT 1 FROM auth_user_profiles aup WHERE aup.user_id = au.id
);
```

## Testing the Migrations

After applying migrations, verify:

```sql
-- Check table structure
\d auth_users
\d auth_user_profiles
\d auth_organizations

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('auth_users', 'auth_user_profiles', 'cnt_contents');

-- Test RLS policies
SELECT * FROM auth_user_profiles; -- Should return only rows visible to current user
```

## Rollback (if needed)

If you need to rollback:

```sql
-- Remove azure_sub column
ALTER TABLE auth_users DROP COLUMN IF EXISTS azure_sub;
ALTER TABLE auth_users DROP COLUMN IF EXISTS azure_oid;

-- Drop indexes
DROP INDEX IF EXISTS idx_auth_users_azure_sub;
DROP INDEX IF EXISTS idx_auth_users_email;

-- Revert RLS policy changes (restore original policies from database backup)
```

## Environment Variables for Supabase

After running migrations, ensure these are in your `.env.local`:

```bash
# Internal JWT configuration
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_EXPIRY=86400  # 24 hours in seconds

# Backend Supabase Configuration (for API server)
SUPABASE_URL=https://eipfmtuxdktbotimuunl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard

# PostgreSQL connection string (for migrations via psql)
# Get this from Supabase dashboard → Settings → Database
# Format: postgresql://postgres.[REF]:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.eipfmtuxdktbotimuunl.supabase.co:5432/postgres
```

### Getting Supabase Credentials

1. **Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key - it has admin permissions)
   
2. **Database Connection String**:
   - Go to Supabase Dashboard → Settings → Database
   - Copy the connection string under "Connection string" or "Connection pooling"
   - Replace `[YOUR-PASSWORD]` with your actual database password
