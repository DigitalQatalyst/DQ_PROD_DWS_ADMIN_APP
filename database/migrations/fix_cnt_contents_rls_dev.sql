-- Migration: Fix RLS on cnt_contents for Development (Frontend Direct Access)
-- Date: 2025-01-28
-- Purpose: Allow frontend to query directly while maintaining some isolation
-- NOTE: This is a DEVELOPMENT-ONLY solution. For production, use backend API with session variables.

-- Step 1: Drop all conflicting policies
DROP POLICY IF EXISTS "Public read" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "Users can view content in their org" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "contents_select_policy" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "org_read" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "org_rls_policy" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "admin_override" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "enforce_org_isolation" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "enforce_org_isolation_dev" ON "public"."cnt_contents";
DROP POLICY IF EXISTS "org_content_isolation" ON "public"."cnt_contents";

-- Step 2: Create a permissive policy for development
-- This allows all reads - organization filtering will be done in application code
CREATE POLICY "dev_read_all" ON "public"."cnt_contents"
FOR SELECT USING (true);

-- Add warning comment
COMMENT ON POLICY "dev_read_all" ON "public"."cnt_contents" IS 
'WARNING: Development-only policy that allows ALL reads. Organization filtering is done in application code. Replace with proper RLS in production using backend API with session variables.';

-- Step 3: Keep insert/update/delete policies restrictive
-- (Don't change these - they should already be restrictive)

