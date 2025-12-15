-- Migration: Migrate to azure_oid as PRIMARY federated identifier
-- Purpose: Make azure_oid the primary lookup field while keeping azure_sub for legacy
-- Date: 2025-01-27
--
-- IMPORTANT: This migration adds oid support to existing schema
-- - azure_oid (Object ID) = PRIMARY identifier (stable across app registrations)
-- - azure_sub (Subject) = App-specific, kept for legacy compatibility
-- - email = Human-readable reference

-- Step 1: Ensure azure_oid column exists and is populated
DO $$
BEGIN
  -- Add azure_oid column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'auth_users' 
      AND column_name = 'azure_oid'
  ) THEN
    ALTER TABLE auth_users ADD COLUMN azure_oid TEXT;
    RAISE NOTICE 'Added azure_oid column';
  ELSE
    RAISE NOTICE 'azure_oid column already exists';
  END IF;
END $$;

-- Step 2: Create unique index on azure_oid (PRIMARY identifier)
DROP INDEX IF EXISTS idx_auth_users_azure_oid;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_azure_oid 
  ON auth_users(azure_oid) 
  WHERE azure_oid IS NOT NULL;

-- Step 3: Keep azure_sub for legacy compatibility (already exists)
-- No changes needed to azure_sub

-- Step 4: Update comments to reflect oid as primary
COMMENT ON COLUMN auth_users.azure_oid IS 'Azure AD Object ID (oid claim) - PRIMARY federated identifier. Stable across all app registrations. Use for all user lookups.';
COMMENT ON COLUMN auth_users.azure_sub IS 'Azure AD Subject (sub claim) - app-specific, varies per registration. Kept for legacy compatibility only. Use azure_oid for lookups.';

-- Step 5: Provide migration guidance for existing data
-- Note: Existing users must have azure_oid populated manually from their Azure tokens
-- Run this AFTER populating azure_oid for all users:
-- ALTER TABLE auth_users ALTER COLUMN azure_oid SET NOT NULL;
