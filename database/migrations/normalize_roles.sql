/**
 * Role Normalization Migration
 * 
 * This migration normalizes legacy roles (creator, contributor) to the standard 'editor' role
 * and adds a CHECK constraint to enforce only the 4 canonical roles.
 * 
 * Canonical Roles:
 * - admin
 * - editor (replaces creator, contributor)
 * - approver
 * - viewer
 * 
 * Run this migration before deploying the CASL centralization updates.
 */

-- Step 1: Normalize legacy roles to editor
UPDATE auth_user_profiles 
SET role = 'editor' 
WHERE role IN ('creator', 'contributor');

-- Step 2: Update any other occurrences in auth_users table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auth_users') THEN
    UPDATE auth_users 
    SET role = 'editor' 
    WHERE role IN ('creator', 'contributor');
  END IF;
END $$;

-- Step 3: Add CHECK constraint to auth_user_profiles
-- Drop existing constraint if it exists
ALTER TABLE auth_user_profiles 
DROP CONSTRAINT IF EXISTS role_check;

-- Add the constraint with normalized roles only
ALTER TABLE auth_user_profiles 
ADD CONSTRAINT role_check CHECK (role IN ('admin', 'editor', 'approver', 'viewer'));

-- Step 4: Add constraint to auth_users if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auth_users') THEN
    ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS role_check;
    ALTER TABLE auth_users ADD CONSTRAINT role_check CHECK (role IN ('admin', 'editor', 'approver', 'viewer'));
  END IF;
END $$;

-- Verification: Count roles after normalization
SELECT 
  role,
  COUNT(*) as count
FROM auth_user_profiles
GROUP BY role
ORDER BY role;
