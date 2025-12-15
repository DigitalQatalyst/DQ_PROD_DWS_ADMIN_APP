-- Migration: Add azure_sub column to auth_users
-- Purpose: Store immutable Azure user ID for federated identity lookup
-- Date: 2025-01-27

-- Add azure_sub column (immutable Azure user ID)
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS azure_sub TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS azure_oid TEXT;

-- Create unique constraint on azure_sub for fast lookups
-- Note: Initially nullable to allow existing users, will be made NOT NULL after backfill
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_azure_sub ON auth_users(azure_sub) WHERE azure_sub IS NOT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

-- Add comment for documentation
COMMENT ON COLUMN auth_users.azure_sub IS 'Azure AD immutable user ID (sub claim from JWT) used for federated identity lookup';
COMMENT ON COLUMN auth_users.azure_oid IS 'Azure AD object ID (oid claim from JWT) used as backup identifier';
