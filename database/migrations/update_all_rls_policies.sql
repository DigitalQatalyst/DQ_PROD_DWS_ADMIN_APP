-- Migration: Update All RLS Policies for Federated Identity
-- Purpose: Update all existing RLS policies to use federated identity helper functions
-- Date: 2025-01-27
--
-- This migration updates all "org_rls_policy" policies to use the new
-- get_app_organization_id() function which reads from app context (set by internal JWT)
-- or falls back to auth_user_profiles lookup
--
-- IMPORTANT: Run update_rls_policies.sql FIRST to create the helper functions
-- This migration will fail if helper functions don't exist

-- Pre-flight check: Verify helper function exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_app_organization_id') THEN
    RAISE EXCEPTION 'Helper function get_app_organization_id() does not exist. Please run update_rls_policies.sql first.';
  END IF;
END $$;

-- Step 1: Drop all old policies that use get_org_id_from_claim()
-- Only drop policies for tables that actually exist and have organization_id
DROP POLICY IF EXISTS "org_rls_policy" ON "activity_logs";
DROP POLICY IF EXISTS "org_rls_policy" ON "auth_user_profiles";
DROP POLICY IF EXISTS "org_rls_policy" ON "cnt_resources";
DROP POLICY IF EXISTS "org_rls_policy" ON "comm_mentors";
DROP POLICY IF EXISTS "org_rls_policy" ON "eco_business_directory";
DROP POLICY IF EXISTS "org_rls_policy" ON "eco_growth_areas";
DROP POLICY IF EXISTS "org_rls_policy" ON "eco_programs";
DROP POLICY IF EXISTS "org_rls_policy" ON "eco_zones";
DROP POLICY IF EXISTS "org_rls_policy" ON "mktplc_services";

-- Step 2: Drop policies that use org_write name (only for tables that exist)
DROP POLICY IF EXISTS "org_write" ON "cnt_contents";
DROP POLICY IF EXISTS "org_write" ON "cnt_experiences";
DROP POLICY IF EXISTS "org_write" ON "cnt_resources";

-- Step 3: Create new policies using get_app_organization_id()
-- Only create policies for tables that have the organization_id column

-- Activity Logs (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'activity_logs' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "activity_logs"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Auth User Profiles (already handled in update_auth_profiles.sql)
-- Keep existing policies from update_auth_profiles.sql

-- Content Resources (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'cnt_resources' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "cnt_resources"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Content Events (skip if table doesn't have organization_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'cnt_events' 
      AND column_name = 'organization_id'
  ) THEN
    EXECUTE 'CREATE POLICY "org_rls_policy" ON "cnt_events"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id())';
  END IF;
END $$;

-- Content Experiences (skip if table doesn't have organization_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'cnt_experiences' 
      AND column_name = 'organization_id'
  ) THEN
    EXECUTE 'CREATE POLICY "org_rls_policy" ON "cnt_experiences"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id())';
  END IF;
END $$;

-- Content Contents (skip if table doesn't have organization_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'cnt_contents' 
      AND column_name = 'organization_id'
  ) THEN
    EXECUTE 'CREATE POLICY "org_rls_policy" ON "cnt_contents"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id())';
  END IF;
END $$;

-- Community Mentors (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'comm_mentors' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "comm_mentors"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Business Directory (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'eco_business_directory' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "eco_business_directory"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Growth Areas (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'eco_growth_areas' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "eco_growth_areas"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Programs (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'eco_programs' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "eco_programs"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Zones (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'eco_zones' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "eco_zones"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Marketplace Services (create only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'mktplc_services' 
      AND column_name = 'organization_id'
  ) THEN
    CREATE POLICY "org_rls_policy" ON "mktplc_services"
      FOR ALL
      USING (organization_id = get_app_organization_id())
      WITH CHECK (organization_id = get_app_organization_id());
  END IF;
END $$;

-- Step 4: Add comments for documentation (only if policies exist)
-- Comments will be added automatically when policies are created in the DO blocks above
-- No separate COMMENT statements needed to avoid errors if policy doesn't exist

-- Note: This migration assumes get_app_organization_id() has been created
-- by running update_rls_policies.sql first (which creates the helper functions)
