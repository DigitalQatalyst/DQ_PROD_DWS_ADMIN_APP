-- Migration: Update RLS policies for federated identity
-- Purpose: Update RLS policies to use internal JWT context instead of Azure claims
-- Date: 2025-01-27

-- Note: This migration updates RLS policies to expect internal JWT context
-- which will be set by the backend from internal JWT tokens issued by our API

-- 1. Update auth_users RLS to allow users to see only themselves
-- No changes needed - users typically don't query auth_users directly

-- 2. Update auth_user_profiles RLS to use organization context
DROP POLICY IF EXISTS "Users can view their own profile" ON auth_user_profiles;
DROP POLICY IF EXISTS "Users can view org member profiles" ON auth_user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON auth_user_profiles;

CREATE POLICY "Users can view their own profile" ON auth_user_profiles
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id 
      FROM auth_user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile metadata" ON auth_user_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Update content tables to use organization context
-- Example for cnt_contents
DROP POLICY IF EXISTS "content_org_isolation" ON cnt_contents;
DROP POLICY IF EXISTS "Users can view content in their org" ON cnt_contents;

-- Temporary policy for testing (using auth.uid() or app context)
CREATE POLICY "Users can view content in their org" ON cnt_contents
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM auth_user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Create helper function to get current organization from app context
CREATE OR REPLACE FUNCTION get_app_organization_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to get from app context variable (set by backend)
  IF current_setting('app.organization_id', true) IS NOT NULL THEN
    RETURN current_setting('app.organization_id', true)::uuid;
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT organization_id 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- 5. Create helper function to get current user role
CREATE OR REPLACE FUNCTION get_app_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to get from app context variable
  IF current_setting('app.user_role', true) IS NOT NULL THEN
    RETURN current_setting('app.user_role', true);
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT role 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- 6. Create helper function to get current customer type
CREATE OR REPLACE FUNCTION get_app_customer_type()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to get from app context variable
  IF current_setting('app.customer_type', true) IS NOT NULL THEN
    RETURN current_setting('app.customer_type', true);
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT customer_type 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- 7. Add comments for documentation
COMMENT ON FUNCTION get_app_organization_id() IS 'Returns the current user organization ID from app context or database lookup';
COMMENT ON FUNCTION get_app_user_role() IS 'Returns the current user role from app context or database lookup';
COMMENT ON FUNCTION get_app_customer_type() IS 'Returns the current user customer type from app context or database lookup';

-- 8. Update existing RLS policies to use helper functions
-- This is a template - copy for each table that needs organization isolation
/*
CREATE POLICY "org_isolation_policy" ON your_table
  FOR ALL
  USING (
    organization_id = get_app_organization_id()
  );
*/

-- Note: For production, you'll need to apply similar RLS policies to all tables
-- that have organization_id columns (cnt_contents, business_directory, zones, etc.)
