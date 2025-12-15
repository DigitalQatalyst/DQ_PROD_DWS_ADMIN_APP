/**
 * Services API Routes
 * 
 * Organization-scoped CRUD endpoints for service management.
 * Implements RBAC enforcement at the API level.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { azureAuthMiddleware } from '../mw/azureAuth';
import { rbacMiddleware } from '../mw/rbac';
import { verifyRequest, logAuthMode, addAuthModeHeaders } from '../mw/authModeToggle';

const router = Router();

// Apply authentication and RBAC middleware to all routes
// Use auth mode toggle middleware instead of direct Azure auth
router.use(logAuthMode);
router.use(verifyRequest);
router.use(addAuthModeHeaders);
router.use(rbacMiddleware);

/**
 * GET /api/services
 * List services with organization scoping
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, customerType } = req.rbacContext!;
    
    // Build query based on customer type
    let query = `
      SELECT s.*, u.name as creator_name, o.name as organisation_name
      FROM services s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN organisations o ON s.organisation_id = o.id
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (customerType === 'staff') {
      // Staff can see services from allowed organizations
      query += ` WHERE s.organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    } else if (customerType === 'partner') {
      // Partners can only see services from their organization
      query += ` WHERE s.organisation_id = $${paramIndex}`;
      params.push(orgId);
      paramIndex++;
    }
    
    // Add pagination and sorting
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await dbClient.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM services s';
    if (customerType === 'partner') {
      countQuery += ' WHERE s.organisation_id = $1';
    } else if (customerType === 'staff') {
      countQuery += ` WHERE s.organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }
    
    const countResult = await dbClient.query(countQuery, customerType === 'partner' ? [orgId] : []);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch services'
    });
  }
});

/**
 * GET /api/services/:id
 * Get single service by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, customerType } = req.rbacContext!;
    const { id } = req.params;
    
    let query = `
      SELECT s.*, u.name as creator_name, o.name as organisation_name
      FROM services s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN organisations o ON s.organisation_id = o.id
      WHERE s.id = $1
    `;
    
    const params: any[] = [id];
    
    if (customerType === 'partner') {
      query += ` AND s.organisation_id = $2`;
      params.push(orgId);
    } else if (customerType === 'staff') {
      query += ` AND s.organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }
    
    const result = await dbClient.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Service not found'
      });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch service'
    });
  }
});

/**
 * POST /api/services
 * Create new service
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, userId } = req.rbacContext!;
    
    const {
      title,
      type,
      partner_id,
      partner_name,
      category,
      processing_time,
      status,
      applicants,
      feedback,
      submitted_on,
      published_on,
      description,
      eligibility,
      application_requirements,
      fee,
      regulatory_category,
      documents_required,
      outcome,
      partner_info,
      comments,
      activity_log,
      service_category,
      service_subtype,
      price_range,
      features,
      rating,
      review_count,
      provider_id,
      tags
    } = req.body;
    
    const result = await dbClient.query(
      `INSERT INTO services (
        title, type, partner_id, partner_name, category, processing_time, status,
        applicants, feedback, submitted_on, published_on, description, eligibility,
        application_requirements, fee, regulatory_category, documents_required,
        outcome, partner_info, comments, activity_log, service_category,
        service_subtype, price_range, features, rating, review_count, provider_id,
        tags, organisation_id, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, now(), now()
      ) RETURNING *`,
      [
        title, type, partner_id, partner_name, category, processing_time, status,
        applicants, feedback, submitted_on, published_on, description, eligibility,
        application_requirements, fee, regulatory_category, documents_required,
        outcome, partner_info, comments, activity_log, service_category,
        service_subtype, price_range, features, rating, review_count, provider_id,
        tags, orgId, userId
      ]
    );
    
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to create service'
    });
  }
});

/**
 * PUT /api/services/:id
 * Update existing service
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, userId, customerType } = req.rbacContext!;
    const { id } = req.params;
    
    // First, verify the service exists and user has access
    let verifyQuery = 'SELECT id, organisation_id FROM services WHERE id = $1';
    const verifyParams: any[] = [id];
    
    if (customerType === 'partner') {
      verifyQuery += ' AND organisation_id = $2';
      verifyParams.push(orgId);
    } else if (customerType === 'staff') {
      verifyQuery += ` AND organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }
    
    const verifyResult = await dbClient.query(verifyQuery, verifyParams);
    
    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Service not found or access denied'
      });
    }
    
    // Build update query
    const updateFields = Object.keys(req.body).filter(key => key !== 'id');
    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    if (!setClause) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'No fields to update'
      });
    }
    
    const result = await dbClient.query(
      `UPDATE services SET ${setClause}, updated_at = now() 
       WHERE id = $1 RETURNING *`,
      [id, ...updateFields.map(field => req.body[field])]
    );
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to update service'
    });
  }
});

/**
 * DELETE /api/services/:id
 * Delete service
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, customerType } = req.rbacContext!;
    const { id } = req.params;
    
    // Verify service exists and user has access
    let verifyQuery = 'SELECT id, organisation_id FROM services WHERE id = $1';
    const verifyParams: any[] = [id];
    
    if (customerType === 'partner') {
      verifyQuery += ' AND organisation_id = $2';
      verifyParams.push(orgId);
    } else if (customerType === 'staff') {
      verifyQuery += ` AND organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }
    
    const verifyResult = await dbClient.query(verifyQuery, verifyParams);
    
    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Service not found or access denied'
      });
    }
    
    // Delete the service
    const result = await dbClient.query('DELETE FROM services WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Service not found'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to delete service'
    });
  }
});

/**
 * POST /api/services/:id/approve
 * Approve service (admin/approver only)
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool;
    const { orgId, userId, customerType } = req.rbacContext!;
    const { id } = req.params;
    const { approved_by, approved_at, notes } = req.body;
    
    // Verify service exists and user has access
    let verifyQuery = 'SELECT id, organisation_id, status FROM services WHERE id = $1';
    const verifyParams: any[] = [id];
    
    if (customerType === 'partner') {
      verifyQuery += ' AND organisation_id = $2';
      verifyParams.push(orgId);
    } else if (customerType === 'staff') {
      verifyQuery += ` AND organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }
    
    const verifyResult = await dbClient.query(verifyQuery, verifyParams);
    
    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Service not found or access denied'
      });
    }
    
    // Update service status to approved
    const result = await dbClient.query(
      `UPDATE services SET 
        status = 'Published',
        approved_by = $2,
        approved_at = COALESCE($3, now()),
        published_on = COALESCE($3, now()),
        updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, approved_by || userId, approved_at]
    );
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error approving service:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to approve service'
    });
  }
});

export default router;
