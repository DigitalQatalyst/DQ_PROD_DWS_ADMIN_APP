/**
 * Mock JWT Tokens for RBAC Testing
 * 
 * These simulate decoded JWT tokens from Azure External Identities
 * with the custom claims configured for testing.
 */

// import { testUsers } from './testUsers.json';
import testUsers from './testUsers.json' assert { type: 'json' };


export interface MockTokenPayload {
  sub: string;
  email: string;
  name: string;
  customerType: string;
  'User Role': string;
  'Company Name': string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface MockToken {
  payload: MockTokenPayload;
  expectedAccess: string;
  description: string;
}

/**
 * Generate mock tokens for all test users
 */
export function generateMockTokens(): MockToken[] {
  const now = Math.floor(Date.now() / 1000);
  
  return testUsers.map(user => ({
    payload: {
      sub: `mock-${user.email.replace('@', '-').replace('.', '-')}`,
      email: user.email,
      name: user.email.split('@')[0].replace('.', ' '),
      customerType: user.customerType,
      'User Role': user.userRole,
      'Company Name': user.organisationName,
      iat: now,
      exp: now + 3600, // 1 hour from now
      iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
      aud: 'f996140d-d79b-419d-a64c-f211d23a38ad'
    },
    expectedAccess: user.expectedAccess,
    description: user.description
  }));
}

/**
 * Get mock token for specific user type
 */
export function getMockToken(userType: string, role: string): MockToken | null {
  const tokens = generateMockTokens();
  return tokens.find(token => 
    token.payload.customerType.toLowerCase() === userType.toLowerCase() &&
    token.payload['User Role'].toLowerCase() === role.toLowerCase()
  ) || null;
}

/**
 * Get all staff tokens
 */
export function getStaffTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.payload.customerType === 'Staff'
  );
}

/**
 * Get all partner tokens
 */
export function getPartnerTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.payload.customerType === 'Partner'
  );
}

/**
 * Get all enterprise tokens
 */
export function getEnterpriseTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.payload.customerType === 'Enterprise'
  );
}

/**
 * Get tokens that should be blocked (403)
 */
export function getBlockedTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.expectedAccess === '403_forbidden'
  );
}

/**
 * Get tokens that should have full access
 */
export function getFullAccessTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.expectedAccess === 'full_access_per_role'
  );
}

/**
 * Get tokens that should have org-scoped access
 */
export function getOrgScopedTokens(): MockToken[] {
  return generateMockTokens().filter(token => 
    token.expectedAccess === 'org_scoped_access'
  );
}

/**
 * Generate a mock token with custom values
 */
export function createCustomMockToken(overrides: Partial<MockTokenPayload>): MockTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    sub: 'mock-custom-user',
    email: 'custom@dqproj.onmicrosoft.com',
    name: 'Custom User',
    customerType: 'Staff',
    'User Role': 'Admin',
    'Company Name': 'stafforg',
    iat: now,
    exp: now + 3600,
    iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
    aud: 'f996140d-d79b-419d-a64c-f211d23a38ad',
    ...overrides
  };
}

/**
 * Test data for cross-org access validation
 */
export const crossOrgTestData = {
  // Partner1 trying to access Partner2 data
  partner1AccessingPartner2: {
    requester: getMockToken('partner', 'admin')?.payload,
    targetOrg: 'partner2org',
    expectedResult: 'blocked'
  },
  
  // Staff accessing partner data (should work)
  staffAccessingPartner: {
    requester: getMockToken('staff', 'admin')?.payload,
    targetOrg: 'partner1org',
    expectedResult: 'allowed'
  },
  
  // Partner accessing staff data (should be blocked)
  partnerAccessingStaff: {
    requester: getMockToken('partner', 'admin')?.payload,
    targetOrg: 'stafforg',
    expectedResult: 'blocked'
  }
};

export default {
  generateMockTokens,
  getMockToken,
  getStaffTokens,
  getPartnerTokens,
  getEnterpriseTokens,
  getBlockedTokens,
  getFullAccessTokens,
  getOrgScopedTokens,
  createCustomMockToken,
  crossOrgTestData
};
