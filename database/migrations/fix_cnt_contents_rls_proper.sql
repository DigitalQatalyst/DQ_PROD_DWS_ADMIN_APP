-- Migration: Fix RLS on cnt_contents - Production-Ready Version
-- Date: 2025-01-28
-- Purpose: Use get_app_organization_id() which reads from PostgreSQL session variables
-- This works with backend API that sets app.organization_id before each query

-- Step 1: Drop all conflicting policies
DROP POLICY IF EXISTS "Public read" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "Users can view content in their org" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "contents_select_policy" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "org_read" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "org_rls_policy" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "admin_override" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "enforce_org_isolation" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "enforce_org_isolation_dev" ON "public"."cnt_contents";

-- Step 2: Create single policy that uses get_app_organization_id()
-- This function reads from app.organization_id session variable set by backend
CREATE POLICY "org_content_isolation" ON "public"."cnt_contents"
FOR SELECT USING (
  -- Service role bypasses RLS
  "auth"."role"() = 'service_role'
  -- OR content belongs to user's organization (read from session variable)
  OR "organization_id" = "public"."get_app_organization_id"()
);

-- Add comment
COMMENT ON POLICY "org_content_isolation" ON "public"."cnt_contents" IS 
'Enforces organization isolation using app.organization_id session variable set by backend. Service role bypasses.';

