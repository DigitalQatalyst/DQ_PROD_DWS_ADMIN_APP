-- Fix RLS policy for eco_business_directory table
-- Issue: The INSERT policy was failing because get_current_organisation_id() 
-- returns NULL when organization_id is not in JWT claims.
-- The JWT only contains organization_name, not organization_id.

-- Drop existing policies
DROP POLICY IF EXISTS "business_directory_insert_policy" ON "public"."eco_business_directory";
DROP POLICY IF EXISTS "business_directory_select_policy" ON "public"."eco_business_directory";
DROP POLICY IF EXISTS "business_directory_update_policy" ON "public"."eco_business_directory";
DROP POLICY IF EXISTS "business_directory_delete_policy" ON "public"."eco_business_directory";
DROP POLICY IF EXISTS "org_write" ON "public"."eco_business_directory";

-- Create new INSERT policy that uses get_org_id_from_claim() which maps organization_name to organization_id
CREATE POLICY "business_directory_insert_policy" ON "public"."eco_business_directory" 
FOR INSERT 
WITH CHECK (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      -- Allow insert if organization_id matches the org from JWT claim (via organization_name lookup)
      "organization_id" = "public"."get_org_id_from_claim"()
    )
    ELSE false
  END
);

-- Create new SELECT policy
CREATE POLICY "business_directory_select_policy" ON "public"."eco_business_directory" 
FOR SELECT
USING (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      "organization_id" = "public"."get_org_id_from_claim"()
    )
    ELSE false
  END
);

-- Create new UPDATE policy
CREATE POLICY "business_directory_update_policy" ON "public"."eco_business_directory" 
FOR UPDATE
USING (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      "organization_id" = "public"."get_org_id_from_claim"()
    )
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    WHEN "public"."is_partner_user"() THEN (
      "organization_id" = "public"."get_org_id_from_claim"()
    )
    ELSE false
  END
);

-- Create new DELETE policy
CREATE POLICY "business_directory_delete_policy" ON "public"."eco_business_directory" 
FOR DELETE
USING (
  CASE
    WHEN "public"."is_staff_user"() THEN true
    ELSE false
  END
);

-- Add comments for documentation
COMMENT ON POLICY "business_directory_insert_policy" ON "public"."eco_business_directory" 
IS 'RLS policy for business directory table inserts - uses get_org_id_from_claim() to map organization_name to organization_id';

COMMENT ON POLICY "business_directory_select_policy" ON "public"."eco_business_directory" 
IS 'RLS policy for business directory table selects - organization scoped for partners, all access for staff';

COMMENT ON POLICY "business_directory_update_policy" ON "public"."eco_business_directory" 
IS 'RLS policy for business directory table updates - organization scoped for partners, all access for staff';

COMMENT ON POLICY "business_directory_delete_policy" ON "public"."eco_business_directory" 
IS 'RLS policy for business directory table deletes - staff only';
