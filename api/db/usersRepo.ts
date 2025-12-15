/**
 * Users Repository
 * 
 * Handles user-related database operations for RBAC system.
 */

import { Pool } from 'pg';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id?: string;
  organisation_id?: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: Date;
  metadata: Record<string, any>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class UsersRepository {
  constructor(private db: Pool) {}

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      const result = await this.db.query(
        `INSERT INTO users (email, name, role, organisation_id, avatar_url, phone, is_active, last_login_at, metadata, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
         RETURNING *`,
        [
          userData.email,
          userData.name,
          userData.role || 'viewer',
          userData.organisation_id || userData.organization_id,
          userData.avatar_url,
          userData.phone,
          userData.is_active ?? true,
          userData.last_login_at,
          userData.metadata || {},
          userData.created_by
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      if (!setClause) {
        throw new Error('No fields to update');
      }

      const values = [id, ...fields.map(field => updates[field as keyof User])];
      
      const result = await this.db.query(
        `UPDATE users SET ${setClause}, updated_at = now() 
         WHERE id = $1 RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Upsert user (insert or update)
   */
  async upsert(userData: Partial<User>): Promise<User> {
    try {
      const result = await this.db.query(
        `INSERT INTO users (email, name, role, organisation_id, avatar_url, phone, is_active, last_login_at, metadata, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
         ON CONFLICT (email) 
         DO UPDATE SET 
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           organisation_id = EXCLUDED.organisation_id,
           avatar_url = EXCLUDED.avatar_url,
           phone = EXCLUDED.phone,
           is_active = EXCLUDED.is_active,
           last_login_at = EXCLUDED.last_login_at,
           metadata = EXCLUDED.metadata,
           updated_at = now()
         RETURNING *`,
        [
          userData.email,
          userData.name,
          userData.role || 'viewer',
          userData.organisation_id || userData.organization_id,
          userData.avatar_url,
          userData.phone,
          userData.is_active ?? true,
          userData.last_login_at,
          userData.metadata || {},
          userData.created_by
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  /**
   * List users with optional filtering
   */
  async list(filters?: {
    organisation_id?: string;
    role?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    try {
      let query = 'SELECT * FROM users';
      const params: any[] = [];
      let paramIndex = 1;
      const conditions: string[] = [];

      if (filters?.organisation_id) {
        conditions.push(`organisation_id = $${paramIndex}`);
        params.push(filters.organisation_id);
        paramIndex++;
      }

      if (filters?.role) {
        conditions.push(`role = $${paramIndex}`);
        params.push(filters.role);
        paramIndex++;
      }

      if (filters?.is_active !== undefined) {
        conditions.push(`is_active = $${paramIndex}`);
        params.push(filters.is_active);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY email';

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
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete by setting is_active to false)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'UPDATE users SET is_active = false, updated_at = now() WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(email: string): Promise<void> {
    try {
      await this.db.query(
        'UPDATE users SET last_login_at = now(), updated_at = now() WHERE email = $1',
        [email]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}
