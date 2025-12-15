-- Migration: Add Azure federated identity columns to auth_users
-- Purpose: Store immutable Azure identifiers for federated identity lookup
-- Date: 2025-01-27
-- 
-- IMPORTANT: oid (Object ID) is the PRIMARY federated identifier
-- - oid: Stable across all app registrations in the same tenant
-- - sub: App-specific (varies per app registration) - kept for legacy compatibility only
-- - email: Human-readable reference for UX

-- Add azure_oid column (PRIMARY federated identifier - stable Azure Object ID)
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS azure_oid TEXT;

-- Add azure_sub column (legacy, app-specific identifier - kept for compatibility)
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS azure_sub TEXT;

-- Create unique constraint on azure_oid for fast lookups (PRIMARY KEY for federated identity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_azure_oid ON auth_users(azure_oid) WHERE azure_oid IS NOT NULL;

-- Create index on sub for legacy compatibility (not used for lookups)
CREATE INDEX IF NOT EXISTS idx_auth_users_azure_sub ON auth_users(azure_sub) WHERE azure_sub IS NOT NULL;

-- Create index for fast lookups by email (secondary identifier)
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

-- Add comments for documentation
COMMENT ON COLUMN auth_users.azure_oid IS 'Azure AD Object ID (oid claim) - PRIMARY federated identifier. Stable across all app registrations.';
COMMENT ON COLUMN auth_users.azure_sub IS 'Azure AD Subject (sub claim) - app-specific, varies per registration. Kept for legacy compatibility only (read-only).';
