/**
 * Contents API Routes
 * 
 * Organization-scoped CRUD endpoints for content management.
 * Implements RBAC enforcement at the API level.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import * as devStore from '../lib/devStore';
// CASL enforcement middleware - replaces legacy checkPermission
import { requireAbility } from '../mw/caslEnforcement';
import { azureAuthMiddleware } from '../mw/azureAuth';
import { rbacMiddleware } from '../mw/rbac';
import { verifyRequest, logAuthMode, addAuthModeHeaders } from '../mw/authModeToggle';

const router = Router();

// Apply authentication and RBAC middleware to all routes
// Use auth mode toggle middleware instead of direct Azure auth
router.use(logAuthMode);
router.use(verifyRequest);
router.use(addAuthModeHeaders);
// RBAC: use strict RBAC when DB is available; otherwise attach a dev context
router.use((req, res, next) => {
  const db = (req.app?.locals?.dbClient as Pool | undefined) || undefined;
  const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';
  if (!db || USE_MOCK_AUTH) {
    // Dev fallback context so CASL checks pass
    req.rbacContext = {
      userId: 'dev-user',
      orgId: 'dev-org',
      customerType: 'partner',
      userRole: 'editor',
      organisationName: 'Dev Org'
    };
    return next();
  }
  return rbacMiddleware(req, res, next);
});

/**
 * GET /api/contents
 * List contents with organization scoping
 */
router.get('/', requireAbility('read', 'Content'), async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool | undefined;
    const { orgId, customerType } = req.rbacContext!;

    // Pagination
    const page = parseInt((req.query.page as string) || '1', 10) || 1;
    const limit = parseInt((req.query.limit as string) || '10', 10) || 10;

    if (!dbClient) {
      // Dev fallback store
      const out = devStore.list(page, limit);
      return res.json(out);
    }

    // Build query based on customer type
    let query = `
      SELECT c.*, u.name as author_name, o.name as organisation_name
      FROM contents c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN organisations o ON c.organisation_id = o.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (customerType === 'staff') {
      query += ` WHERE c.organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    } else if (customerType === 'partner') {
      query += ` WHERE c.organisation_id = $${paramIndex}`;
      params.push(orgId);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await dbClient.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM contents c';
    if (customerType === 'partner') {
      countQuery += ' WHERE c.organisation_id = $1';
    } else if (customerType === 'staff') {
      countQuery += ` WHERE c.organisation_id IN (
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
    console.error('Error fetching contents:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch contents'
    });
  }
});

/**
 * GET /api/contents/:id
 * Get single content by ID
 */
router.get('/:id', requireAbility('read', 'Content'), async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool | undefined;
    const { orgId, customerType } = req.rbacContext!;
    const { id } = req.params;
    if (!dbClient) {
      const rec = devStore.getById(id);
      if (!rec) return res.status(404).json({ error: 'not_found', message: 'Content not found' });
      return res.json({ data: rec });
    }

    let query = `
      SELECT c.*, u.name as author_name, o.name as organisation_name
      FROM contents c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN organisations o ON c.organisation_id = o.id
      WHERE c.id = $1
    `;

    const params: any[] = [id];

    if (customerType === 'partner') {
      query += ` AND c.organisation_id = $2`;
      params.push(orgId);
    } else if (customerType === 'staff') {
      query += ` AND c.organisation_id IN (
        SELECT id FROM organisations WHERE name IN ('DigitalQatalyst', 'Front Operations')
      )`;
    }

    const result = await dbClient.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Content not found'
      });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to fetch content'
    });
  }
});

/**
 * POST /api/contents
 * Create new content
 */
router.post('/', requireAbility('create', 'Content'), async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool | undefined;
    const { orgId, userId } = req.rbacContext!;
    
    const {
      title,
      content_type,
      content,
      summary,
      tags,
      featured_image_url,
      description,
      category,
      thumbnail_url,
      read_time,
      duration,
      content_subtype,
      slug,
      sector,
      key_points,
      is_featured,
      content_url,
      source,
      story_data,
      entrepreneur_name,
      entrepreneur_company,
      entrepreneur_location,
      impact_metrics,
      primary_sector_id,
      primary_support_category_id,
      target_stage_id
    } = req.body;
    
    if (!dbClient) {
      const rec = devStore.create({
        title, content_type, content, summary, tags, featured_image_url, description,
        category, thumbnail_url, read_time, duration, content_subtype, slug, sector,
        key_points, is_featured, content_url, source, story_data, entrepreneur_name,
        entrepreneur_company, entrepreneur_location, impact_metrics, primary_sector_id,
        primary_support_category_id, target_stage_id, organisation_id: orgId, created_by: userId,
      });
      return res.status(201).json({ data: rec });
    }

    const result = await dbClient.query(
      `INSERT INTO contents (
        title, content_type, content, summary, tags, featured_image_url, description,
        category, thumbnail_url, read_time, duration, content_subtype, slug, sector,
        key_points, is_featured, content_url, source, story_data, entrepreneur_name,
        entrepreneur_company, entrepreneur_location, impact_metrics, primary_sector_id,
        primary_support_category_id, target_stage_id, organisation_id, created_by,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, now(), now()
      ) RETURNING *`,
      [
        title, content_type, content, summary, tags, featured_image_url, description,
        category, thumbnail_url, read_time, duration, content_subtype, slug, sector,
        key_points, is_featured, content_url, source, story_data, entrepreneur_name,
        entrepreneur_company, entrepreneur_location, impact_metrics, primary_sector_id,
        primary_support_category_id, target_stage_id, orgId, userId
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to create content'
    });
  }
});

/**
 * PUT /api/contents/:id
 * Update existing content
 */
router.put('/:id', requireAbility('update', 'Content'), async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool | undefined;
    const { orgId, userId, customerType } = req.rbacContext!;
    const { id } = req.params;
    if (!dbClient) {
      const updated = devStore.update(id, req.body || {});
      if (!updated) return res.status(404).json({ error: 'not_found', message: 'Content not found' });
      return res.json({ data: updated });
    }

    // First, verify the content exists and user has access
    let verifyQuery = 'SELECT id, organisation_id FROM contents WHERE id = $1';
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
        message: 'Content not found or access denied'
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
      `UPDATE contents SET ${setClause}, updated_at = now() 
       WHERE id = $1 RETURNING *`,
      [id, ...updateFields.map(field => req.body[field])]
    );
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to update content'
    });
  }
});

/**
 * DELETE /api/contents/:id
 * Delete content
 */
router.delete('/:id', requireAbility('delete', 'Content'), async (req: Request, res: Response) => {
  try {
    const dbClient = req.app.locals.dbClient as Pool | undefined;
    const { orgId, customerType } = req.rbacContext!;
    const { id } = req.params;
    if (!dbClient) {
      const ok = devStore.remove(id);
      return ok ? res.status(204).send() : res.status(404).json({ error: 'not_found', message: 'Content not found' });
    }

    // Verify content exists and user has access
    let verifyQuery = 'SELECT id, organisation_id FROM contents WHERE id = $1';
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
        message: 'Content not found or access denied'
      });
    }
    
    // Delete the content
    const result = await dbClient.query('DELETE FROM contents WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Content not found'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      error: 'internal_server_error',
      message: 'Failed to delete content'
    });
  }
});

export default router;
