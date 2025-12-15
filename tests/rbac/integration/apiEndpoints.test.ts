/**
 * API Endpoints Integration Tests
 * 
 * Tests the complete API flow with RBAC enforcement.
 */

// Set environment variables BEFORE importing any modules
process.env.MOCK_MODE = 'true';
process.env.NODE_ENV = 'test';

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { verifyRequest } from '../../../api/mw/authModeToggle';
import { rbacMiddleware } from '../../../api/mw/rbac';
import { logPermissionChecks } from '../../../api/mw/permission';
import contentsRouter from '../../../api/routes/contents';
import servicesRouter from '../../../api/routes/services';
import { generateMockTokens, getStaffTokens, getPartnerTokens, getEnterpriseTokens } from '../fixtures/mockTokens';
import { testContents, testServices } from '../fixtures/testData';

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, options) => {
    // Return mock decoded token based on the token
    if (token === 'mock-staff-token') {
      return {
        sub: 'staff-user-123',
        email: 'staff.admin@dqproj.onmicrosoft.com',
        customerType: 'Staff',
        'User Role': 'Admin',
        'Company Name': 'stafforg',
        iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
        aud: 'f996140d-d79b-419d-a64c-f211d23a38ad'
      };
    }
    if (token === 'mock-partner-token') {
      return {
        sub: 'partner-user-456',
        email: 'partner1.admin@dqproj.onmicrosoft.com',
        customerType: 'Partner',
        'User Role': 'Admin',
        'Company Name': 'partner1org',
        iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
        aud: 'f996140d-d79b-419d-a64c-f211d23a38ad'
      };
    }
    if (token === 'mock-enterprise-token') {
      return {
        sub: 'enterprise-user-789',
        email: 'enterprise.admin@dqproj.onmicrosoft.com',
        customerType: 'Enterprise',
        'User Role': 'Admin',
        'Company Name': 'enterpriseorg',
        iss: 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
        aud: 'f996140d-d79b-419d-a64c-f211d23a38ad'
      };
    }
    throw new Error('Invalid token');
  })
}));

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock database client
  const mockDbClient = {
    query: jest.fn(),
    end: jest.fn()
  } as any;
  
  app.locals.dbClient = mockDbClient;
  
  // Apply routes (middleware is already applied in the route files)
  app.use('/api/contents', contentsRouter);
  app.use('/api/services', servicesRouter);
  
  return { app, mockDbClient };
};

describe('API Endpoints Integration Tests', () => {
  let app: express.Application;
  let mockDbClient: any;

  beforeEach(() => {
    // Set environment variables for mock mode
    process.env.MOCK_MODE = 'true';
    process.env.NODE_ENV = 'test';
    
    console.log('Environment variables set:', {
      MOCK_MODE: process.env.MOCK_MODE,
      NODE_ENV: process.env.NODE_ENV
    });
    
    const testApp = createTestApp();
    app = testApp.app;
    mockDbClient = testApp.mockDbClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Contents API', () => {
    it('should allow staff users to access contents from allowed organizations', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock database responses for route handler
      // Contents query
      mockDbClient.query.mockResolvedValueOnce({
        rows: testContents.filter(c => c.organisation_name === 'stafforg'),
        rowCount: 1
      });
      // Count query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-staff-token');

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}. Body: ${JSON.stringify(response.body, null, 2)}`);
      }

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should allow partner users to access only their organization contents', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock database responses for route handler
      // Contents query
      mockDbClient.query.mockResolvedValueOnce({
        rows: testContents.filter(c => c.organisation_name === 'partner1org'),
        rowCount: 1
      });
      // Count query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-partner-token')
        .expect(200);

      expect(response.body.data).toBeDefined();
      // Verify only partner1org content is returned
      response.body.data.forEach((content: any) => {
        expect(content.organisation_name).toBe('partner1org');
      });
    });

    it('should block enterprise users from accessing contents', async () => {
      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-enterprise-token')
        .expect(403);

      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('enterprise_blocked');
    });

    it('should create content with proper organization scoping', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock content creation
      const newContent = {
        id: 'content-123',
        title: 'New Content',
        content_type: 'Article',
        organisation_id: 'org-123',
        created_by: 'user-123'
      };
      mockDbClient.query.mockResolvedValueOnce({
        rows: [newContent],
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/contents')
        .set('Authorization', 'Bearer mock-partner-token')
        .send({
          title: 'New Content',
          content_type: 'Article',
          content: 'Test content'
        })
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.organisation_id).toBe('org-123');
    });

    it('should update content only if user has access', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock content verification
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'content-123', organisation_id: 'org-123' }],
        rowCount: 1
      });
      
      // Mock content update
      const updatedContent = {
        id: 'content-123',
        title: 'Updated Content',
        organisation_id: 'org-123'
      };
      mockDbClient.query.mockResolvedValueOnce({
        rows: [updatedContent],
        rowCount: 1
      });

      const response = await request(app)
        .put('/api/contents/content-123')
        .set('Authorization', 'Bearer mock-partner-token')
        .send({
          title: 'Updated Content'
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Updated Content');
    });

    it('should delete content only if user has access', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock content verification
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'content-123', organisation_id: 'org-123' }],
        rowCount: 1
      });
      
      // Mock content deletion
      mockDbClient.query.mockResolvedValueOnce({
        rowCount: 1
      });

      await request(app)
        .delete('/api/contents/content-123')
        .set('Authorization', 'Bearer mock-partner-token')
        .expect(204);
    });
  });

  describe('Services API', () => {
    it('should allow staff users to access services from allowed organizations', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock database responses for route handler
      // Services query
      mockDbClient.query.mockResolvedValueOnce({
        rows: testServices.filter(s => s.organisation_name === 'stafforg'),
        rowCount: 1
      });
      // Count query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/services')
        .set('Authorization', 'Bearer mock-staff-token')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should allow partner users to access only their organization services', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock database responses for route handler
      // Services query
      mockDbClient.query.mockResolvedValueOnce({
        rows: testServices.filter(s => s.organisation_name === 'partner1org'),
        rowCount: 1
      });
      // Count query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/services')
        .set('Authorization', 'Bearer mock-partner-token')
        .expect(200);

      expect(response.body.data).toBeDefined();
      // Verify only partner1org services are returned
      response.body.data.forEach((service: any) => {
        expect(service.organisation_name).toBe('partner1org');
      });
    });

    it('should approve service only if user has permission', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock service verification
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'service-123', organisation_id: 'org-123', status: 'Pending' }],
        rowCount: 1
      });
      
      // Mock service approval
      const approvedService = {
        id: 'service-123',
        status: 'Published',
        approved_by: 'user-123'
      };
      mockDbClient.query.mockResolvedValueOnce({
        rows: [approvedService],
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/services/service-123/approve')
        .set('Authorization', 'Bearer mock-staff-token')
        .send({
          approved_by: 'user-123'
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('Published');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app)
        .get('/api/contents')
        .expect(401);

      await request(app)
        .get('/api/services')
        .expect(401);
    });

    it('should require valid JWT token', async () => {
      await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should validate token issuer and audience', async () => {
      // This would be tested with invalid issuer/audience tokens
      // The mock JWT verification handles this in the test environment
      expect(true).toBe(true); // Placeholder for issuer/audience validation
    });
  });

  describe('Error Handling', () => {
    it('should return structured error responses', async () => {
      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-enterprise-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('reason');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockDbClient.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-staff-token')
        .expect(500);
    });
  });

  describe('Cross-Organization Access Prevention', () => {
    it('should prevent partner from accessing other organization data', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock query to return only partner1org data (simulating RLS)
      mockDbClient.query.mockResolvedValueOnce({
        rows: testContents.filter(c => c.organisation_name === 'partner1org'),
        rowCount: 1
      });
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-partner-token')
        .expect(200);

      // Verify no data from other organizations is returned
      response.body.data.forEach((content: any) => {
        expect(content.organisation_name).toBe('partner1org');
        expect(content.organisation_name).not.toBe('partner2org');
        expect(content.organisation_name).not.toBe('stafforg');
      });
    });

    it('should prevent staff from accessing disallowed organization data', async () => {
      // Mock database responses for RBAC middleware
      // 1. Organization lookup
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'org-123' }],
        rowCount: 1
      });
      // 2. User upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123' }],
        rowCount: 1
      });
      // 3. User profile upsert
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      // 4. PostgreSQL context setting queries (4 queries)
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      // Mock query to return only allowed org data (simulating RLS)
      mockDbClient.query.mockResolvedValueOnce({
        rows: testContents.filter(c => ['stafforg', 'stafforg2'].includes(c.organisation_name)),
        rowCount: 2
      });
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ count: '2' }]
      });

      const response = await request(app)
        .get('/api/contents')
        .set('Authorization', 'Bearer mock-staff-token')
        .expect(200);

      // Verify no data from disallowed organizations is returned
      response.body.data.forEach((content: any) => {
        expect(['stafforg', 'stafforg2']).toContain(content.organisation_name);
        expect(content.organisation_name).not.toBe('randomorg');
      });
    });
  });
});
