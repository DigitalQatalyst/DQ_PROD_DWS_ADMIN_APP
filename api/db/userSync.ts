/**
 * User Sync Service
 * 
 * Handles synchronization of users from Azure B2C to the local database.
 * This service is used by the RBAC middleware to ensure users are properly
 * synced and their profiles are up to date.
 */

import { Pool } from 'pg';
import { OrganisationsRepository } from './organisationsRepo';
import { UsersRepository } from './usersRepo';
import { ProfilesRepository } from './profilesRepo';

export interface UserSyncData {
  azure_id: string;
  email: string | null;
  customerType: string;
  userRole: string;
  organisationName: string;
}

export interface UserSyncResult {
  userId: string;
  orgId: string;
  isNewUser: boolean;
  isNewOrg: boolean;
}

export class UserSyncService {
  private orgRepo: OrganisationsRepository;
  private usersRepo: UsersRepository;
  private profilesRepo: ProfilesRepository;

  constructor(private db: Pool) {
    this.orgRepo = new OrganisationsRepository(db);
    this.usersRepo = new UsersRepository(db);
    this.profilesRepo = new ProfilesRepository(db);
  }

  /**
   * Upsert user and profile - main sync method
   */
  async upsertUserAndProfile(userData: UserSyncData): Promise<UserSyncResult> {
    try {
      // Start transaction
      await this.db.query('BEGIN');

      try {
        // Get or create organization
        const orgId = await this.orgRepo.getOrCreateByName(userData.organisationName);
        
        // Check if this is a new organization
        const existingOrg = await this.orgRepo.getById(orgId);
        const isNewOrg = !existingOrg || existingOrg.created_at > new Date(Date.now() - 60000); // Created within last minute

        // Upsert user
        const user = await this.usersRepo.upsert({
          email: userData.email,
          name: userData.email || userData.azure_id,
          role: userData.userRole,
          organisation_id: orgId,
          is_active: true,
          last_login_at: new Date(),
          metadata: {
            azure_id: userData.azure_id,
            customer_type: userData.customerType
          }
        });

        // Check if this is a new user (created within last minute)
        const isNewUser = user.created_at > new Date(Date.now() - 60000);

        // Upsert user profile
        await this.profilesRepo.upsert({
          user_id: user.id,
          organisation_id: orgId,
          organisation_name: userData.organisationName,
          customer_type: userData.customerType,
          user_role: userData.userRole,
          last_login_at: new Date(),
          profile_data: {
            azure_id: userData.azure_id,
            sync_timestamp: new Date().toISOString()
          },
          preferences: {}
        });

        // Commit transaction
        await this.db.query('COMMIT');

        return {
          userId: user.id,
          orgId,
          isNewUser,
          isNewOrg
        };

      } catch (error) {
        // Rollback transaction on error
        await this.db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Error in upsertUserAndProfile:', error);
      throw error;
    }
  }

  /**
   * Sync user from Azure claims
   */
  async syncFromClaims(claims: {
    azure_id: string;
    email: string | null;
    customerType: string;
    userRole: string;
    organisationName: string;
  }): Promise<UserSyncResult> {
    return this.upsertUserAndProfile(claims);
  }

  /**
   * Get user sync status
   */
  async getSyncStatus(azureId: string): Promise<{
    exists: boolean;
    userId?: string;
    orgId?: string;
    lastSync?: Date;
  }> {
    try {
      // Try to find user by azure_id in metadata
      const result = await this.db.query(
        `SELECT u.id as user_id, u.organisation_id as org_id, up.last_login_at as last_sync
         FROM users u
         JOIN user_profiles up ON u.id = up.user_id
         WHERE u.metadata->>'azure_id' = $1`,
        [azureId]
      );

      if (result.rows.length > 0) {
        return {
          exists: true,
          userId: result.rows[0].user_id,
          orgId: result.rows[0].org_id,
          lastSync: result.rows[0].last_sync
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive users (optional maintenance method)
   */
  async cleanupInactiveUsers(daysInactive: number = 90): Promise<number> {
    try {
      const result = await this.db.query(
        `UPDATE users 
         SET is_active = false, updated_at = now()
         WHERE last_login_at < now() - interval '${daysInactive} days'
         AND is_active = true
         RETURNING id`
      );

      console.log(`Deactivated ${result.rowCount} inactive users`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up inactive users:', error);
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(orgId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    lastActivity: Date | null;
  }> {
    try {
      const result = await this.db.query(
        `SELECT 
           COUNT(*) as total_users,
           COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_users,
           up.user_role,
           MAX(u.last_login_at) as last_activity
         FROM users u
         JOIN user_profiles up ON u.id = up.user_id
         WHERE u.organisation_id = $1
         GROUP BY up.user_role`,
        [orgId]
      );

      const usersByRole: Record<string, number> = {};
      let totalUsers = 0;
      let activeUsers = 0;
      let lastActivity: Date | null = null;

      result.rows.forEach(row => {
        usersByRole[row.user_role] = parseInt(row.total_users);
        totalUsers += parseInt(row.total_users);
        activeUsers += parseInt(row.active_users);
        
        if (row.last_activity && (!lastActivity || row.last_activity > lastActivity)) {
          lastActivity = row.last_activity;
        }
      });

      return {
        totalUsers,
        activeUsers,
        usersByRole,
        lastActivity
      };
    } catch (error) {
      console.error('Error getting organization stats:', error);
      throw error;
    }
  }
}
