-- Diagnostic Query: Check for invalid role and customer_type values
-- Purpose: See what values exist before running the migration
-- Run this BEFORE running update_auth_profiles.sql

-- Check for invalid role values
SELECT 
  'Invalid role values' as issue,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT role) as invalid_values
FROM auth_user_profiles
WHERE role NOT IN ('admin', 'approver', 'creator', 'contributor', 'viewer')
  AND role IS NOT NULL
UNION ALL
-- Check for invalid customer_type values
SELECT 
  'Invalid customer_type values' as issue,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT customer_type) as invalid_values
FROM auth_user_profiles
WHERE customer_type NOT IN ('staff', 'partner', 'enterprise', 'advisor')
  AND customer_type IS NOT NULL
UNION ALL
-- Check for NULL role values
SELECT 
  'NULL role values' as issue,
  COUNT(*) as count,
  ARRAY['NULL'] as invalid_values
FROM auth_user_profiles
WHERE role IS NULL
UNION ALL
-- Check for NULL customer_type values
SELECT 
  'NULL customer_type values' as issue,
  COUNT(*) as count,
  ARRAY['NULL'] as invalid_values
FROM auth_user_profiles
WHERE customer_type IS NULL;

-- Also show all unique values currently in the database
SELECT 'Current role values:', ARRAY_AGG(DISTINCT role) FROM auth_user_profiles WHERE role IS NOT NULL;
SELECT 'Current customer_type values:', ARRAY_AGG(DISTINCT customer_type) FROM auth_user_profiles WHERE customer_type IS NOT NULL;
