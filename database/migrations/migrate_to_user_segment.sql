-- Migration: Rename customer_type to user_segment and update role values
-- Date: 2025-01-28
-- Purpose: Refactor RBAC from legacy customer_type to standardized segment + role model
-- NOTE: Admin and Partner apps only (customer app refactor will come later)

-- Step 1: Add new column user_segment
ALTER TABLE "public"."auth_user_profiles" 
  ADD COLUMN IF NOT EXISTS "user_segment" TEXT;

-- Step 2: Migrate existing data to user_segment
UPDATE "public"."auth_user_profiles"
SET "user_segment" = CASE
  WHEN "customer_type" = 'staff' THEN 'internal'
  WHEN "customer_type" = 'partner' THEN 'partner'
  WHEN "customer_type" = 'enterprise' THEN 'customer'
  WHEN "customer_type" = 'advisor' THEN 'advisor'
  ELSE 'internal' -- default for any unexpected values
END
WHERE "customer_type" IS NOT NULL;

-- Step 3: Drop old constraints BEFORE adding new ones
ALTER TABLE "public"."auth_user_profiles"
  DROP CONSTRAINT IF EXISTS "customer_type_check";

ALTER TABLE "public"."auth_user_profiles"
  DROP CONSTRAINT IF EXISTS "role_check";

-- Step 4: Normalize role values (creator/contributor → editor)
-- Do this AFTER dropping old constraint, BEFORE adding new one
UPDATE "public"."auth_user_profiles"
SET "role" = CASE
  WHEN "role" = 'creator' THEN 'editor'
  WHEN "role" = 'contributor' THEN 'editor'
  ELSE "role" -- keep admin, approver, viewer unchanged
END;

-- Step 5: Add new CHECK constraint for user_segment
ALTER TABLE "public"."auth_user_profiles"
  ADD CONSTRAINT "user_segment_check" CHECK (
    "user_segment" IN ('internal','partner','customer','advisor')
  );

-- Step 6: Add new CHECK constraint for role
ALTER TABLE "public"."auth_user_profiles"
  ADD CONSTRAINT "role_check" CHECK (
    "role" IN ('admin','editor','approver','viewer')
  );

-- Step 7: Make user_segment NOT NULL after all updates
ALTER TABLE "public"."auth_user_profiles"
  ALTER COLUMN "user_segment" SET NOT NULL;

-- Step 8: Drop old customer_type column
ALTER TABLE "public"."auth_user_profiles"
  DROP COLUMN IF EXISTS "customer_type";

-- Step 8: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_user_profiles_user_segment 
  ON "public"."auth_user_profiles" ("user_segment");

CREATE INDEX IF NOT EXISTS idx_auth_user_profiles_role 
  ON "public"."auth_user_profiles" ("role");

CREATE INDEX IF NOT EXISTS idx_auth_user_profiles_segment_role 
  ON "public"."auth_user_profiles" ("user_segment", "role");

-- Step 9: Add comments
COMMENT ON COLUMN "public"."auth_user_profiles"."user_segment" IS 
'User segment: internal (platform staff), partner (service providers), customer (end users), advisor (consultants). Defines who the user is.';

COMMENT ON COLUMN "public"."auth_user_profiles"."role" IS 
'User role: admin (full management), editor (create/update), approver (review/approve), viewer (read-only). Defines what the user can do.';

-- Step 10: Verify migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count 
  FROM "public"."auth_user_profiles" 
  WHERE "user_segment" IS NOT NULL;
  
  RAISE NOTICE 'Migration complete. Updated % user profiles.', migrated_count;
END $$;

