/**
 * Claims Normalization Utility
 * 
 * Standardizes Azure EEI token claims across different naming conventions.
 * Handles various formats like extension_*, camelCase, PascalCase, etc.
 */

export interface NormalizedClaims {
  azureUserId: string;
  email: string;
  customerType: string;
  userRole: string;
  companyName: string;
}

/**
 * Normalizes Azure EEI token claims to a standard format
 * @param raw Raw claims object from Azure token
 * @returns Normalized claims with consistent field names
 */
export function normalizeClaims(raw: any): NormalizedClaims {
  // Helper function to try multiple naming conventions
  const map = (key: string): string => {
    return raw[key] ||
           raw[`extension_${key}`] ||
           raw[key.replace(/\s+/g, '')] ||
           raw[key.charAt(0).toLowerCase() + key.slice(1)] ||
           raw[key.charAt(0).toUpperCase() + key.slice(1)] ||
           raw[key.toLowerCase()] ||
           raw[key.toUpperCase()] ||
           raw[`User ${key}`] ||
           raw[`Company ${key}`] ||
           '';
  };

  // Special handling for Azure user ID
  const azureUserId = raw.sub || 
                     raw.oid || 
                     raw.objectId || 
                     raw.azureUserId ||
                     map('azureUserId') ||
                     '';

  // Special handling for email
  const email = raw.email || 
               raw.preferred_username || 
               raw.upn ||
               map('email') ||
               '';

  // Special handling for customer type
  const customerType = raw.customerType ||
                      raw['Customer Type'] ||
                      raw['User Type'] ||
                      map('customerType') ||
                      '';

  // Special handling for user role
  const userRole = raw.userRole ||
                  raw['User Role'] ||
                  raw.role ||
                  map('userRole') ||
                  '';

  // Special handling for company name
  const companyName = raw.companyName ||
                     raw['Company Name'] ||
                     raw.organization ||
                     raw.organisation ||
                     map('companyName') ||
                     '';

  if (!azureUserId) {
    throw new Error('Missing required claim: azureUserId (sub)');
  }

  if (!email) {
    throw new Error('Missing required claim: email');
  }

  if (!customerType) {
    throw new Error('Missing required claim: customerType');
  }

  if (!userRole) {
    throw new Error('Missing required claim: userRole');
  }

  if (!companyName) {
    throw new Error('Missing required claim: companyName');
  }

  return {
    azureUserId,
    email,
    customerType: customerType.toLowerCase(),
    userRole,
    companyName
  };
}
