/**
 * User Profiles Repository
 * 
 * Handles user profile-related database operations for RBAC system.
 */

import { Pool } from 'pg';

export interface UserProfile {
  id: string;
  user_id: string;
  organisation_id?: string;
  organisation_name?: string;
  customer_type: string;
  user_role: string;
  profile_data: Record<string, any>;
  preferences: Record<string, any>;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class ProfilesRepository {
  constructor(private db: Pool) {}

  /**
   * Get user profile by user ID
   */
  async getByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user profile by user ID:', error);
      throw error;
    }
  }

  /**
   * Create new user profile
   */
  async create(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const result = await this.db.query(
        `INSERT INTO user_profiles (user_id, organisation_id, organisation_name, customer_type, user_role, profile_data, preferences, last_login_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
         RETURNING *`,
        [
          profileData.user_id,
          profileData.organisation_id,
          profileData.organisation_name,
          profileData.customer_type,
          profileData.user_role,
          profileData.profile_data || {},
          profileData.preferences || {},
          profileData.last_login_at
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'user_id');
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      if (!setClause) {
        throw new Error('No fields to update');
      }

      const values = [userId, ...fields.map(field => updates[field as keyof UserProfile])];
      
      const result = await this.db.query(
        `UPDATE user_profiles SET ${setClause}, updated_at = now() 
         WHERE user_id = $1 RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upsert user profile (insert or update)
   */
  async upsert(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const result = await this.db.query(
        `INSERT INTO user_profiles (user_id, organisation_id, organisation_name, customer_type, user_role, profile_data, preferences, last_login_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           organisation_id = EXCLUDED.organisation_id,
           organisation_name = EXCLUDED.organisation_name,
           customer_type = EXCLUDED.customer_type,
           user_role = EXCLUDED.user_role,
           profile_data = EXCLUDED.profile_data,
           preferences = EXCLUDED.preferences,
           last_login_at = EXCLUDED.last_login_at,
           updated_at = now()
         RETURNING *`,
        [
          profileData.user_id,
          profileData.organisation_id,
          profileData.organisation_name,
          profileData.customer_type,
          profileData.user_role,
          profileData.profile_data || {},
          profileData.preferences || {},
          profileData.last_login_at
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  /**
   * List user profiles with optional filtering
   */
  async list(filters?: {
    organisation_id?: string;
    customer_type?: string;
    user_role?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserProfile[]> {
    try {
      let query = 'SELECT * FROM user_profiles';
      const params: any[] = [];
      let paramIndex = 1;
      const conditions: string[] = [];

      if (filters?.organisation_id) {
        conditions.push(`organisation_id = $${paramIndex}`);
        params.push(filters.organisation_id);
        paramIndex++;
      }

      if (filters?.customer_type) {
        conditions.push(`customer_type = $${paramIndex}`);
        params.push(filters.customer_type);
        paramIndex++;
      }

      if (filters?.user_role) {
        conditions.push(`user_role = $${paramIndex}`);
        params.push(filters.user_role);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY created_at DESC';

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
      console.error('Error listing user profiles:', error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'DELETE FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.db.query(
        'UPDATE user_profiles SET last_login_at = now(), updated_at = now() WHERE user_id = $1',
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Get profiles by organization
   */
  async getByOrganization(organisationId: string): Promise<UserProfile[]> {
    try {
      const result = await this.db.query(
        'SELECT * FROM user_profiles WHERE organisation_id = $1 ORDER BY created_at DESC',
        [organisationId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting profiles by organization:', error);
      throw error;
    }
  }
}
