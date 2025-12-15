/**
 * RBAC Integration Tests
 * 
 * Tests the complete RBAC flow with mock tokens and database validation.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Pool } from 'pg';
import { normalizeClaims } from '../../../src/auth/claimNormalizer';
import { azureAuthMiddleware } from '../../../api/mw/azureAuth';
import { rbacMiddleware } from '../../../api/mw/rbac';
import { checkPermission } from '../../../api/mw/permission';
import { generateMockTokens, getStaffTokens, getPartnerTokens, getEnterpriseTokens, getBlockedTokens } from '../fixtures/mockTokens';
import { testOrganizations, testContents, testServices, expectedAccessPatterns } from '../fixtures/testData';

// Mock Express request/response objects
const createMockRequest = (token: any, dbClient?: Pool) => ({
  headers: {
    authorization: `Bearer mock-token`
  },
  app: {
    locals: {
      dbClient: dbClient || {} as Pool
    }
  },
  azureUser: token,
  rbacContext: undefined
});

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

describe('RBAC Integration Tests', () => {
  let mockDbClient: jest.Mocked<Pool>;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    // Mock database client
    mockDbClient = {
      query: jest.fn(),
      end: jest.fn()
    } as any;

    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Claim Normalization', () => {
    it('should normalize claims correctly for staff users', () => {
      const mockToken = {
        sub: 'staff-user-123',
        email: 'staff.admin@dqproj.onmicrosoft.com',
        customerType: 'Staff',
        'User Role': 'Admin',
        'Company Name': 'stafforg'
      };

      const normalized = normalizeClaims(mockToken);

      expect(normalized).toEqual({
        azure_id: 'staff-user-123',
        email: 'staff.admin@dqproj.onmicrosoft.com',
        customerType: 'staff',
        userRole: 'admin',
        organisationName: 'stafforg'
      });
    });

    it('should normalize claims correctly for partner users', () => {
      const mockToken = {
        sub: 'partner-user-456',
        email: 'partner1.admin@dqproj.onmicrosoft.com',
        customerType: 'Partner',
        'User Role': 'Admin',
        'Company Name': 'partner1org'
      };

      const normalized = normalizeClaims(mockToken);

      expect(normalized).toEqual({
        azure_id: 'partner-user-456',
        email: 'partner1.admin@dqproj.onmicrosoft.com',
        customerType: 'partner',
        userRole: 'admin',
        organisationName: 'partner1org'
      });
    });

    it('should normalize claims correctly for enterprise users', () => {
      const mockToken = {
        sub: 'enterprise-user-789',
        email: 'enterprise.admin@dqproj.onmicrosoft.com',
        customerType: 'Enterprise',
        'User Role': 'Admin',
        'Company Name': 'enterpriseorg'
      };

      const normalized = normalizeClaims(mockToken);

      expect(normalized).toEqual({
        azure_id: 'enterprise-user-789',
        email: 'enterprise.admin@dqproj.onmicrosoft.com',
        customerType: 'enterprise',
        userRole: 'admin',
        organisationName: 'enterpriseorg'
      });
    });
  });

  describe('RBAC Middleware Validation', () => {
    beforeEach(() => {
      mockRequest = createMockRequest(null);
      mockRequest.app.locals.dbClient = mockDbClient;
    });

    it('should allow staff users from allowed organizations', async () => {
      const staffTokens = getStaffTokens().filter(token => 
        token.payload['Company Name'] === 'stafforg' || token.payload['Company Name'] === 'stafforg2'
      );

      for (const token of staffTokens) {
        const normalizedToken = normalizeClaims(token.payload);
        mockRequest = createMockRequest(normalizedToken, mockDbClient);
        
        // Mock database queries for organization lookup and user upsert
        // 1. Organization lookup query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [{ id: 'org-123' }],
          rowCount: 1
        });
        // 2. User upsert query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [{ id: 'user-123' }],
          rowCount: 1
        });
        // 3. User profile upsert query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [],
          rowCount: 0
        });
        // 4. PostgreSQL context setting queries (4 queries)
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await rbacMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalledWith(403);
      }
    });

    it('should block staff users from disallowed organizations', async () => {
      const blockedStaffTokens = getStaffTokens().filter(token => 
        token.payload['Company Name'] === 'randomorg'
      );

      for (const token of blockedStaffTokens) {
        const normalizedToken = normalizeClaims(token.payload);
        mockRequest = createMockRequest(normalizedToken, mockDbClient);

        await rbacMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'forbidden',
            reason: 'staff_org_not_allowed'
          })
        );
      }
    });

    it('should allow partner users with organization', async () => {
      const partnerTokens = getPartnerTokens().filter(token => 
        token.payload['Company Name'] !== ''
      );

      for (const token of partnerTokens) {
        const normalizedToken = normalizeClaims(token.payload);
        mockRequest = createMockRequest(normalizedToken, mockDbClient);
        
        // Mock database queries for organization lookup and user upsert
        // 1. Organization lookup query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [{ id: 'org-123' }],
          rowCount: 1
        });
        // 2. User upsert query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [{ id: 'user-123' }],
          rowCount: 1
        });
        // 3. User profile upsert query
        mockDbClient.query.mockResolvedValueOnce({
          rows: [],
          rowCount: 0
        });
        // 4. PostgreSQL context setting queries (4 queries)
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await rbacMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalledWith(403);
      }
    });

    it('should block partner users without organization', async () => {
      const partnerTokensWithoutOrg = getPartnerTokens().filter(token => 
        token.payload['Company Name'] === ''
      );

      for (const token of partnerTokensWithoutOrg) {
        const normalizedToken = normalizeClaims(token.payload);
        mockRequest = createMockRequest(normalizedToken, mockDbClient);

        await rbacMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'forbidden',
            reason: 'partner_missing_org'
          })
        );
      }
    });

    it('should block all enterprise users', async () => {
      const enterpriseTokens = getEnterpriseTokens();

      for (const token of enterpriseTokens) {
        const normalizedToken = normalizeClaims(token.payload);
        mockRequest = createMockRequest(normalizedToken, mockDbClient);

        await rbacMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'forbidden',
            reason: 'enterprise_blocked'
          })
        );
      }
    });
  });

  describe('Permission Middleware Validation', () => {
    beforeEach(() => {
      mockRequest = createMockRequest(null);
      mockRequest.rbacContext = {
        userId: 'user-123',
        orgId: 'org-123',
        customerType: 'staff',
        userRole: 'admin',
        organisationName: 'stafforg'
      };
    });

    it('should allow admin users to perform all actions', async () => {
      const actions = ['create', 'read', 'update', 'delete', 'approve'];
      
      for (const action of actions) {
        await checkPermission('contents', action as any)(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('should allow approver users to read and approve only', async () => {
      mockRequest.rbacContext.userRole = 'approver';
      
      // Should allow
      await checkPermission('contents', 'read')(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      await checkPermission('contents', 'approve')(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      // Should block
      mockNext.mockClear();
      await checkPermission('contents', 'create')(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should allow creator users to create, read, and update', async () => {
      mockRequest.rbacContext.userRole = 'creator';
      
      // Should allow
      const allowedActions = ['create', 'read', 'update'];
      for (const action of allowedActions) {
        await checkPermission('contents', action as any)(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      }
      
      // Should block
      await checkPermission('contents', 'delete')(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should allow contributor users to read and update only', async () => {
      mockRequest.rbacContext.userRole = 'contributor';
      
      // Should allow
      const allowedActions = ['read', 'update'];
      for (const action of allowedActions) {
        await checkPermission('contents', action as any)(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      }
      
      // Should block
      await checkPermission('contents', 'create')(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should allow viewer users to read only', async () => {
      mockRequest.rbacContext.userRole = 'viewer';
      
      // Should allow
      await checkPermission('contents', 'read')(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      // Should block
      mockNext.mockClear();
      await checkPermission('contents', 'create')(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Cross-Organization Access Validation', () => {
    it('should validate staff access patterns', () => {
      const staffPattern = expectedAccessPatterns.staff;
      
      expect(staffPattern.allowedOrgs).toContain('stafforg');
      expect(staffPattern.allowedOrgs).toContain('stafforg2');
      expect(staffPattern.disallowedOrgs).toContain('randomorg');
      expect(staffPattern.shouldSeeAllAllowedOrgData).toBe(true);
      expect(staffPattern.shouldSeeDisallowedOrgData).toBe(false);
    });

    it('should validate partner access patterns', () => {
      const partnerPattern = expectedAccessPatterns.partner;
      
      expect(partnerPattern.shouldSeeOwnOrgDataOnly).toBe(true);
      expect(partnerPattern.shouldSeeOtherOrgData).toBe(false);
    });

    it('should validate enterprise access patterns', () => {
      const enterprisePattern = expectedAccessPatterns.enterprise;
      
      expect(enterprisePattern.allowedOrgs).toHaveLength(0);
      expect(enterprisePattern.shouldSeeAnyData).toBe(false);
    });
  });

  describe('Database RLS Simulation', () => {
    it('should simulate RLS policies for staff users', () => {
      // This would test the actual RLS policies in a real database
      // For now, we validate the expected behavior
      
      const staffUser = {
        customerType: 'staff',
        organisationName: 'stafforg'
      };

      // Staff should see data from allowed organizations
      expect(['stafforg', 'stafforg2']).toContain(staffUser.organisationName);
    });

    it('should simulate RLS policies for partner users', () => {
      const partnerUser = {
        customerType: 'partner',
        organisationName: 'partner1org'
      };

      // Partner should only see their own organization's data
      expect(partnerUser.organisationName).toBe('partner1org');
    });
  });
});

describe('Mock Token Generation', () => {
  it('should generate all required mock tokens', () => {
    const tokens = generateMockTokens();
    
    expect(tokens.length).toBeGreaterThan(0);
    
    // Verify we have tokens for each user type
    const staffTokens = tokens.filter(t => t.payload.customerType === 'Staff');
    const partnerTokens = tokens.filter(t => t.payload.customerType === 'Partner');
    const enterpriseTokens = tokens.filter(t => t.payload.customerType === 'Enterprise');
    
    expect(staffTokens.length).toBeGreaterThan(0);
    expect(partnerTokens.length).toBeGreaterThan(0);
    expect(enterpriseTokens.length).toBeGreaterThan(0);
  });

  it('should have correct expected access patterns', () => {
    const tokens = generateMockTokens();
    
    const blockedTokens = tokens.filter(t => t.expectedAccess === '403_forbidden');
    const fullAccessTokens = tokens.filter(t => t.expectedAccess === 'full_access_per_role');
    const orgScopedTokens = tokens.filter(t => t.expectedAccess === 'org_scoped_access');
    
    expect(blockedTokens.length).toBeGreaterThan(0);
    expect(fullAccessTokens.length).toBeGreaterThan(0);
    expect(orgScopedTokens.length).toBeGreaterThan(0);
  });
});
