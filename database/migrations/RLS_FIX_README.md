# RLS Policy Fix for eco_business_directory

## Problem

The `/business-form` submission is failing with a 401 Unauthorized error:
```
Error: new row violates row-level security policy for table "eco_business_directory"
```

## Root Cause

The RLS INSERT policy for `eco_business_directory` uses `get_current_organisation_id()` which expects the JWT to contain `organisation_id` or `organization_id` as a UUID claim.

However, the JWT being generated only contains:
- `organization_name`: "Partner Org 1" (string)
- `customer_type`: "partner" (string)
- `user_role`: "admin" (string)

The function `get_current_organisation_id()` returns NULL because it can't find the organization ID in the JWT claims, causing the RLS policy check to fail.

## Solution

The database already has a function `get_org_id_from_claim()` that:
1. Reads the `organization_name` from JWT claims (trying multiple claim name variations)
2. Looks up the corresponding `organization_id` UUID from the `auth_organizations` table
3. Returns the UUID

The fix is to update the RLS policies to use `get_org_id_from_claim()` instead of `get_current_organisation_id()`.

## Migration Steps

1. **Run the SQL migration**: Execute `fix_eco_business_directory_rls.sql` on your Supabase database

2. **Verify the fix**:
   - The user with organization "Partner Org 1" should now be able to submit the business form
   - The RLS policy will:
     - Allow staff users to insert any record
     - Allow partner users to insert records where `organization_id` matches their organization (looked up via `organization_name`)

## Technical Details

### Before (Broken)
```sql
CREATE POLICY "business_directory_insert_policy" ON "public"."eco_business_directory" 
FOR INSERT WITH CHECK (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      "organization_id" = "public"."get_current_organisation_id"()  -- Returns NULL!
    )
    ELSE false
  END
);
```

### After (Fixed)
```sql
CREATE POLICY "business_directory_insert_policy" ON "public"."eco_business_directory" 
FOR INSERT WITH CHECK (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      "organization_id" = "public"."get_org_id_from_claim"()  -- Maps name to UUID!
    )
    ELSE false
  END
);
```

## Functions Used

### `get_org_id_from_claim()`
```sql
CREATE OR REPLACE FUNCTION "public"."get_org_id_from_claim"() RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  org_name text;
  org_id uuid;
BEGIN
  -- Read org_name from JWT claim - try multiple possible claim names
  org_name := COALESCE(
    current_setting('jwt.claims.Company Name', true),
    current_setting('jwt.claims.organization_name', true),
    current_setting('jwt.claims.organisationName', true),
    current_setting('jwt.claims.organizationName', true),
    current_setting('jwt.claims.organisation_name', true)
  );

  -- If no organization name found, return null
  IF org_name IS NULL OR org_name = '' THEN
    RETURN NULL;
  END IF;

  -- Map it to org_id
  SELECT id INTO org_id
  FROM auth_organizations
  WHERE name = org_name;

  RETURN org_id;
END;
$$;
```

### `is_partner_user()`
```sql
CREATE OR REPLACE FUNCTION "public"."is_partner_user"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN get_current_customer_type() = 'partner';
END;
$$;
```

### `get_current_customer_type()`
```sql
CREATE OR REPLACE FUNCTION "public"."get_current_customer_type"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'customerType',
    auth.jwt() ->> 'customer_type',
    'staff'  -- Default to staff for backward compatibility
  );
END;
$$;
```

## Testing

After applying the migration, test with:
```sql
-- Verify the policy exists
SELECT * FROM pg_policies WHERE tablename = 'eco_business_directory';

-- Test the function with your JWT claims
SELECT get_org_id_from_claim();

-- Should return the UUID for "Partner Org 1"
SELECT id FROM auth_organizations WHERE name = 'Partner Org 1';
```

## Notes

- The JWT is being created in `src/lib/dbClient.ts` but currently not being properly set in the Supabase session (line 196 shows it's being skipped to prevent infinite loop)
- This migration fixes the RLS policy side, but you may also want to properly implement JWT session setting in the future
- For now, Supabase RLS can read the claims from the JWT header if it's properly signed and sent with requests
