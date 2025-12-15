/**
 * Sync User Endpoint Tests
 * 
 * Tests for the /api/auth/sync-user endpoint
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRouter from '../../api/routes/auth';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116', message: 'No rows returned' }
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'org-123' },
            error: null
          }))
        }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'user-123' },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('Auth Sync User Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    
    // Set mock mode
    process.env.MOCK_MODE = 'true';
    process.env.AUTH_MODE = 'mock';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sync user with mock token in request body', async () => {
    const mockClaims = {
      sub: '316260dc-6edd-403d-aed3-c577bd49b5a4',
      email: 'partner.admin@betaindustries.com',
      customerType: 'partner',
      userRole: 'admin',
      companyName: 'Beta Industries'
    };

    const response = await request(app)
      .post('/api/auth/sync-user')
      .send(mockClaims)
      .expect(200);

    expect(response.body.status).toBe('synced');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('partner.admin@betaindustries.com');
    expect(response.body.user.customer_type).toBe('partner');
    expect(response.body.user.user_role).toBe('admin');
    expect(response.body.user.organisation_id).toBe('org-123');
  });

  it('should sync user with mock token in authorization header', async () => {
    const mockClaims = {
      sub: '316260dc-6edd-403d-aed3-c577bd49b5a4',
      email: 'staff.admin@digitalqatalyst.com',
      customerType: 'staff',
      userRole: 'admin',
      companyName: 'DigitalQatalyst'
    };

    const token = Buffer.from(JSON.stringify(mockClaims)).toString('base64');

    const response = await request(app)
      .post('/api/auth/sync-user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('synced');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('staff.admin@digitalqatalyst.com');
    expect(response.body.user.customer_type).toBe('staff');
    expect(response.body.user.user_role).toBe('admin');
  });

  it('should handle enterprise users', async () => {
    const mockClaims = {
      sub: 'enterprise-user-123',
      email: 'enterprise.admin@enterpriseorg.com',
      customerType: 'enterprise',
      userRole: 'admin',
      companyName: 'Enterprise Org'
    };

    const response = await request(app)
      .post('/api/auth/sync-user')
      .send(mockClaims)
      .expect(200);

    expect(response.body.status).toBe('synced');
    expect(response.body.user.customer_type).toBe('enterprise');
  });

  it('should handle missing required claims', async () => {
    const incompleteClaims = {
      sub: '316260dc-6edd-403d-aed3-c577bd49b5a4',
      email: 'partner.admin@betaindustries.com'
      // Missing customerType, userRole, companyName
    };

    const response = await request(app)
      .post('/api/auth/sync-user')
      .send(incompleteClaims)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.error).toBe('invalid_claims');
  });

  it('should handle different claim naming conventions', async () => {
    const claimsWithDifferentNames = {
      sub: '316260dc-6edd-403d-aed3-c577bd49b5a4',
      email: 'partner.admin@betaindustries.com',
      'Customer Type': 'partner',
      'User Role': 'admin',
      'Company Name': 'Beta Industries'
    };

    const response = await request(app)
      .post('/api/auth/sync-user')
      .send(claimsWithDifferentNames)
      .expect(200);

    expect(response.body.status).toBe('synced');
    expect(response.body.user.customer_type).toBe('partner');
    expect(response.body.user.user_role).toBe('admin');
  });
});
