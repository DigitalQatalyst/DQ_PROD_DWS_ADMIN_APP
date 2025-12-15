-- Migration: Fix RLS Infinite Recursion on auth_user_profiles
-- Date: 2025-01-28
-- Purpose: Fix the circular dependency in RLS policy that causes infinite recursion
-- Issue: The policy queries auth_user_profiles to check access to auth_user_profiles

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."auth_user_profiles";

-- Step 2: Create a simpler policy without recursion
CREATE POLICY "Users can view their own profile" ON "public"."auth_user_profiles"
FOR SELECT USING (
  -- Allow if user_id matches current user
  "user_id" = "auth"."uid"()
  -- OR allow service role (bypasses RLS for backend operations)
  OR "auth"."role"() = 'service_role'
);

-- Step 3: Add permissive policy for unauthenticated lookups during login
-- This allows the frontend to query profiles before the user is authenticated
-- WARNING: This is permissive and should be restricted in production
CREATE POLICY "Allow profile lookup during login" ON "public"."auth_user_profiles"
FOR SELECT USING (true);

-- Add helpful comments
COMMENT ON POLICY "Users can view their own profile" ON "public"."auth_user_profiles" IS 
'Allows users to view their own profile or service role to view any profile';

COMMENT ON POLICY "Allow profile lookup during login" ON "public"."auth_user_profiles" IS 
'Permissive policy for login flow - allows unauthenticated profile lookups. Should be restricted in production.';

