/**
 * Organizations Repository
 * 
 * Handles organization-related database operations for RBAC system.
 */

import { Pool } from 'pg';

export interface Organization {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  domain?: string;
  settings: Record<string, any>;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export class OrganisationsRepository {
  constructor(private db: Pool) {}

  /**
   * Get or create organization by name
   */
  async getOrCreateByName(name: string): Promise<string> {
    try {
      // Try to find existing organization
      const findResult = await this.db.query(
        'SELECT id FROM organisations WHERE name = $1',
        [name]
      );

      if (findResult.rows.length > 0) {
        return findResult.rows[0].id;
      }

      // Create new organization if not found
      const createResult = await this.db.query(
        `INSERT INTO organisations (name, display_name, status, created_at, updated_at) 
         VALUES ($1, $2, 'active', now(), now()) 
         RETURNING id`,
        [name, name]
      );

      console.log(`Created new organization: ${name}`);
      return createResult.rows[0].id;
    } catch (error) {
      console.error('Error getting/creating organization:', error);
      throw error;
    }
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM organisations WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting organization by ID:', error);
      throw error;
    }
  }

  /**
   * Get organization by name
   */
  async getByName(name: string): Promise<Organization | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM organisations WHERE name = $1',
        [name]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting organization by name:', error);
      throw error;
    }
  }

  /**
   * List all organizations with optional filtering
   */
  async list(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Organization[]> {
    try {
      let query = 'SELECT * FROM organisations';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.status) {
        query += ` WHERE status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      query += ' ORDER BY name';

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error listing organizations:', error);
      throw error;
    }
  }

  /**
   * Update organization
   */
  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      if (!setClause) {
        throw new Error('No fields to update');
      }

      const values = [id, ...fields.map(field => updates[field as keyof Organization])];
      
      const result = await this.db.query(
        `UPDATE organisations SET ${setClause}, updated_at = now() 
         WHERE id = $1 RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  /**
   * Delete organization (soft delete by setting status to inactive)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'UPDATE organisations SET status = $1, updated_at = now() WHERE id = $2',
        ['inactive', id]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }

  /**
   * Check if organization exists
   */
  async exists(name: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT 1 FROM organisations WHERE name = $1',
        [name]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking organization existence:', error);
      throw error;
    }
  }
}
