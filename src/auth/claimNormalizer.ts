/**
 * Claim Normalizer
 * 
 * Normalizes Azure B2C JWT claims into a consistent format for RBAC enforcement.
 * Handles various claim key variations and ensures consistent data types.
 * 
 * @deprecated This module is deprecated in favor of federated identity with Supabase.
 * It is kept for backward compatibility during migration. Future implementations
 * should use the direct Supabase authorization flow instead.
 */

import { logger } from '../utils/logger';
import type { UserRole } from '../types';

export type NormalizedClaims = {
  azure_id: string;
  email: string | null;
  /** @deprecated Use user_segment instead. Will be removed in future version. */
  customerType: string | null;   // lowercased
  /** @deprecated Use role instead. Will be removed in future version. */
  userRole: string | null;       // lowercased (admin/approver/editor/viewer - normalized)
  organisationName: string | null; // normalized from several keys
};

/**
 * Normalizes database roles to canonical role set
 * 
 * Legacy roles (creator, contributor) are mapped to 'editor'.
 * This ensures consistent role vocabulary across the application.
 * 
 * @param databaseRole - Raw role from database or claims
 * @returns Normalized UserRole
 */
export function normalizeRole(databaseRole: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'admin': 'admin',
    'approver': 'approver',
    'creator': 'editor',      // Normalize to editor
    'contributor': 'editor',  // Normalize to editor
    'editor': 'editor',
    'viewer': 'viewer'
  };
  
  const normalized = roleMap[databaseRole.toLowerCase()] || 'viewer';
  
  if (normalized !== databaseRole.toLowerCase() && roleMap[databaseRole.toLowerCase()]) {
    logger.debug(`Role normalized: "${databaseRole}" → "${normalized}"`);
  }
  
  return normalized;
}

/**
 * Normalizes Azure B2C JWT claims into a consistent format
 * @param payload - Raw JWT payload from Azure B2C
 * @returns Normalized claims object
 */
export function normalizeClaims(payload: Record<string, any>): NormalizedClaims {
  // Debug: Log all available claims for troubleshooting
  logger.debug('Raw JWT Claims:', payload);
  logger.debug('Available claim keys:', Object.keys(payload));

  // Extract organization name from various possible claim keys
  const orgRaw =
    payload.organisationName ??
    payload.organizationName ??
    payload.OrganizationName ??
    payload.CompanyName ??              // Azure CIAM format (capital C)
    payload["Company Name"] ??
    payload.company ??
    payload.companyName ??
    payload.extension_OrganizationId ??
    payload.extension_OrganizationName ??
    payload.extension_organisationName ??
    payload.extension_organizationName ??
    payload.org ??
    payload.organization ??
    payload.organisation ??
    payload.tenant ??
    payload.tenantId ??
    payload.tenant_id ??
    null;

  // Extract user role from various possible claim keys
  const userRoleRaw = 
    payload["User Role"] ?? 
    payload.UserRole ??      // Common Azure CIAM format
    payload.userRole ?? 
    payload.extension_Role ??
    payload.extension_role ??
    payload.role ??
    payload.Role ??
    payload.user_role ??
    payload.user_role_claim ??
    null;

  // Extract customer type from various possible claim keys
  // DO NOT USE INFERENCE - only use explicit claims
  const customerTypeRaw = 
    payload.customerType ?? 
    payload.CustomerType ??      // Common Azure CIAM format
    payload.extension_CustomerType ??
    payload.extension_customerType ??
    payload.customer_type ??
    payload.user_type ??
    payload.userType ??
    payload.UserType ??
    null;

  const normalized = {
    azure_id: payload.sub || payload.oid || payload.azure_id || '',
    email: payload.email ?? payload.preferred_username ?? null,
    customerType: customerTypeRaw ? String(customerTypeRaw).toLowerCase().trim() : null,
    userRole: userRoleRaw ? normalizeRole(String(userRoleRaw).trim()) : null,
    organisationName: orgRaw ? String(orgRaw).trim() : null,
  };

  logger.debug('Normalized claims:', normalized);
  return normalized;
}

/**
 * Validates that normalized claims contain required fields
 * @param claims - Normalized claims object
 * @returns true if claims are valid, false otherwise
 */
export function validateClaims(claims: NormalizedClaims): boolean {
  return !!(claims.azure_id && claims.customerType && claims.userRole);
}

/**
 * Gets a human-readable description of the source claim key used for organization
 * @param payload - Raw JWT payload
 * @returns Description of which claim key was used
 */
export function getOrganizationSourceKey(payload: Record<string, any>): string {
  if (payload.organisationName) return 'organisationName';
  if (payload.organizationName) return 'organizationName';
  if (payload.OrganizationName) return 'OrganizationName';
  if (payload.CompanyName) return 'CompanyName';        // Azure CIAM format (capital C)
  if (payload["Company Name"]) return 'Company Name';
  if (payload.company) return 'company';
  if (payload.companyName) return 'companyName';
  if (payload.extension_OrganizationId) return 'extension_OrganizationId';
  if (payload.extension_OrganizationName) return 'extension_OrganizationName';
  if (payload.extension_organisationName) return 'extension_organisationName';
  if (payload.extension_organizationName) return 'extension_organizationName';
  if (payload.org) return 'org';
  if (payload.organization) return 'organization';
  if (payload.organisation) return 'organisation';
  if (payload.tenant) return 'tenant';
  if (payload.tenantId) return 'tenantId';
  if (payload.tenant_id) return 'tenant_id';
  return 'none';
}
