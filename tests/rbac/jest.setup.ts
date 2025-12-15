/**
 * Jest Setup Configuration
 * 
 * Global test setup for RBAC testing framework.
 */

import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Keep error and warn for debugging
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidRBACResponse(): R;
    }
  }
}

// Custom matcher for RBAC responses
expect.extend({
  toHaveValidRBACResponse(received: any) {
    const paid = received.status >= 200 && received.status < 300;
    const forbidden = received.status === 403;
    const unauthorized = received.status === 401;
    
    if (paid || forbidden || unauthorized) {
      return {
        message: () => `Expected response to have valid RBAC status (200-299, 401, 403), received ${received.status}`,
        pass: true,
      };
    }
    
    return {
      message: () => `Expected response to have valid RBAC status (200-299, 401, 403), received ${received.status}`,
      pass: false,
    };
  },
});

// Test data cleanup helper
export const cleanupTestData = async () => {
  // This would be implemented based on your database setup
  console.log('🧹 Cleaning up test data...');
};

// Mock token helper
export const createMockToken = (userType: string, role: string, org: string) => {
  return {
    sub: `mock-${userType}-${role}-${org}`,
    email: `${userType}.${role}@${org}.com`,
    name: `${userType} ${role}`,
    customerType: userType,
    'User Role': role,
    'Company Name': org,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
    aud: 'f996140d-d79b-419d-a64c-f211d23a38ad'
  };
};

// Expected access patterns for validation
export const expectedAccessPatterns = {
  staff: {
    allowedOrgs: ['stafforg', 'stafforg2'],
    disallowedOrgs: ['randomorg', 'partner1org', 'partner2org', 'enterpriseorg'],
    shouldSeeAllAllowedOrgData: true,
    shouldSeeDisallowedOrgData: false
  },
  partner: {
    allowedOrgs: ['partner1org', 'partner2org'],
    disallowedOrgs: ['stafforg', 'stafforg2', 'randomorg', 'enterpriseorg'],
    shouldSeeOwnOrgDataOnly: true,
    shouldSeeOtherOrgData: false
  },
  enterprise: {
    allowedOrgs: [],
    disallowedOrgs: ['stafforg', 'stafforg2', 'randomorg', 'partner1org', 'partner2org', 'enterpriseorg'],
    shouldSeeAnyData: false
  }
};

// Test organization mapping
export const testOrgs = {
  stafforg: { name: 'stafforg', display_name: 'Staff Organization' },
  stafforg2: { name: 'stafforg2', display_name: 'Staff Organization 2' },
  randomorg: { name: 'randomorg', display_name: 'Random Organization' },
  partner1org: { name: 'partner1org', display_name: 'Partner Organization 1' },
  partner2org: { name: 'partner2org', display_name: 'Partner Organization 2' },
  enterpriseorg: { name: 'enterpriseorg', display_name: 'Enterprise Organization' }
};

// Mock database client helper
export const createMockDbClient = () => {
  return {
    query: jest.fn(),
    end: jest.fn(),
    connect: jest.fn(),
    release: jest.fn()
  };
};

// Test environment setup
export const setupTestEnvironment = () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test_db';
  process.env.AZURE_B2C_ISSUER = 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/';
  process.env.AZURE_B2C_CLIENT_ID = 'f996140d-d79b-419d-a64c-f211d23a38ad';
};

// Run setup
setupTestEnvironment();
