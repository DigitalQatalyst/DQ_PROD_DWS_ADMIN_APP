-- Migration: Update auth_user_profiles schema constraints
-- Purpose: Ensure customer_type and role use proper enum values
-- Date: 2025-01-27

-- Step 1: Find and fix invalid role values
-- Update any role values that don't match the allowed set
UPDATE auth_user_profiles
SET role = 'viewer'
WHERE role NOT IN ('admin', 'approver', 'creator', 'contributor', 'viewer')
  AND role IS NOT NULL;

-- Step 2: Find and fix invalid customer_type values
-- Update any customer_type values that don't match the allowed set
UPDATE auth_user_profiles
SET customer_type = 'staff'
WHERE customer_type NOT IN ('staff', 'partner', 'enterprise', 'advisor')
  AND customer_type IS NOT NULL;

-- Step 3: Drop existing constraints if they exist
ALTER TABLE auth_user_profiles DROP CONSTRAINT IF EXISTS customer_type_check;
ALTER TABLE auth_user_profiles DROP CONSTRAINT IF EXISTS role_check;

-- Step 4: Add customer_type constraint
ALTER TABLE auth_user_profiles 
  ADD CONSTRAINT customer_type_check 
  CHECK (customer_type IN ('staff', 'partner', 'enterprise', 'advisor'));

-- Step 5: Add role constraint
-- Note: Using TEXT instead of enum to allow flexibility
ALTER TABLE auth_user_profiles 
  ADD CONSTRAINT role_check 
  CHECK (role IN ('admin', 'approver', 'creator', 'contributor', 'viewer'));

-- Step 6: Add comments for documentation
COMMENT ON COLUMN auth_user_profiles.customer_type IS 'Customer type: staff, partner, enterprise, or advisor';
COMMENT ON COLUMN auth_user_profiles.role IS 'User role: admin, approver, creator, contributor, or viewer';
