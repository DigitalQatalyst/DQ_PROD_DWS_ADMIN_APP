/**
 * RBAC Context Middleware
 * 
 * Implements 3-claim RBAC enforcement based on customerType, userRole, and organisationName.
 * This middleware should be used after Azure auth middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

/**
 * Normalizes legacy roles to canonical set
 * Maps creator/contributor to editor
 */
function normalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'approver': 'approver',
    'creator': 'editor',      // Normalize to editor
    'contributor': 'editor',  // Normalize to editor
    'editor': 'editor',
    'viewer': 'viewer'
  };
  return roleMap[role.toLowerCase()] || 'viewer';
}

// Extend Express Request type to include RBAC context
declare global {
  namespace Express {
    interface Request {
      rbacContext?: {
        userId: string;
        orgId: string;
        customerType: string;
        userRole: string;
        organisationName: string;
      };
    }
  }
}

interface RBACConfig {
  staffAllowedOrgs: string[];
}

const config: RBACConfig = {
  staffAllowedOrgs: ['DigitalQatalyst', 'Front Operations', 'stafforg', 'stafforg2']
};

/**
 * Attach PostgreSQL context for RLS enforcement
 */
async function attachPgContext(client: Pool, ctx: {
  userId: string;
  customerType: string;
  userRole: string;
  organisationId: string;
}) {
  try {
    await client.query('SET LOCAL app.current_user_id = $1', [ctx.userId]);
    await client.query('SET LOCAL app.customer_type = $1', [ctx.customerType]);
    await client.query('SET LOCAL app.user_role = $1', [ctx.userRole]);
    await client.query('SET LOCAL app.organisation_id = $1', [ctx.organisationId]);
  } catch (error) {
    console.error('Error setting PostgreSQL context:', error);
    throw error;
  }
}

/**
 * Get or create organization by name
 */
async function getOrCreateOrgByName(client: Pool, orgName: string): Promise<string> {
  try {
    // Try to find existing organization
    const findResult = await client.query(
      'SELECT id FROM organisations WHERE name = $1',
      [orgName]
    );

    if (findResult.rows.length > 0) {
      return findResult.rows[0].id;
    }

    // Create new organization if not found
    const createResult = await client.query(
      `INSERT INTO organisations (name, display_name, status, created_at, updated_at) 
       VALUES ($1, $2, 'active', now(), now()) 
       RETURNING id`,
      [orgName, orgName]
    );

    console.log(`Created new organization: ${orgName}`);
    return createResult.rows[0].id;
  } catch (error) {
    console.error('Error getting/creating organization:', error);
    throw error;
  }
}

/**
 * Upsert user and profile in database
 */
async function upsertUserAndProfile(client: Pool, userData: {
  azure_id: string;
  email: string | null;
  customerType: string;
  userRole: string;
  orgId: string;
}): Promise<string> {
  try {
    // Upsert user
    const userResult = await client.query(
      `INSERT INTO users (email, name, role, organisation_id, is_active, last_login_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, now(), now(), now())
       ON CONFLICT (email) 
       DO UPDATE SET 
         role = EXCLUDED.role,
         organisation_id = EXCLUDED.organisation_id,
         last_login_at = EXCLUDED.last_login_at,
         updated_at = now()
       RETURNING id`,
      [userData.email, userData.email, normalizeRole(userData.userRole), userData.orgId]
    );

    const userId = userResult.rows[0].id;

    // Upsert user profile
    await client.query(
      `INSERT INTO user_profiles (user_id, organisation_id, organisation_name, customer_type, user_role, last_login_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, now(), now(), now())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         organisation_id = EXCLUDED.organisation_id,
         organisation_name = EXCLUDED.organisation_name,
         customer_type = EXCLUDED.customer_type,
         user_role = EXCLUDED.user_role,
         last_login_at = EXCLUDED.last_login_at,
         updated_at = now()`,
      [userId, userData.orgId, userData.email, userData.customerType, normalizeRole(userData.userRole)]
    );

    return userId;
  } catch (error) {
    console.error('Error upserting user and profile:', error);
    throw error;
  }
}

/**
 * RBAC Context Middleware
 * Enforces 3-claim RBAC rules and sets up database context
 */
export async function rbacMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Ensure Azure user is authenticated
    if (!req.azureUser) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'missing_azure_user',
        message: 'Azure authentication required'
      });
    }

    const { azure_id, email, customerType, userRole, organisationName } = req.azureUser;

    // Rule 1: Enterprise users are denied access
    if (customerType === 'enterprise') {
      console.log('Enterprise user blocked:', { azure_id, customerType });
      return res.status(403).json({
        error: 'forbidden',
        reason: 'enterprise_blocked',
        message: 'Enterprise users are not allowed to access this platform'
      });
    }

    // Rule 2: Staff users must be in allowed organizations
    if (customerType === 'staff') {
      if (!organisationName || !config.staffAllowedOrgs.includes(organisationName)) {
        console.log('Staff user blocked - org not allowed:', { 
          azure_id, 
          customerType, 
          organisationName,
          allowedOrgs: config.staffAllowedOrgs 
        });
        return res.status(403).json({
          error: 'forbidden',
          reason: 'staff_org_not_allowed',
          message: `Staff users must be from one of: ${config.staffAllowedOrgs.join(', ')}`
        });
      }
    }

    // Rule 3: Partner users must have an organization
    if (customerType === 'partner') {
      if (!organisationName) {
        console.log('Partner user blocked - missing org:', { azure_id, customerType });
        return res.status(403).json({
          error: 'forbidden',
          reason: 'partner_missing_org',
          message: 'Partner users must have an organization specified'
        });
      }
    }

    // Get database connection (assuming it's available in req.app.locals or similar)
    const dbClient = req.app.locals.dbClient as Pool;
    if (!dbClient) {
      console.error('Database client not available in request');
      return res.status(500).json({
        error: 'internal_server_error',
        reason: 'database_unavailable',
        message: 'Database connection not available'
      });
    }

    // Get or create organization
    const orgId = await getOrCreateOrgByName(dbClient, organisationName!);

    // Normalize role before upserting
    const normalizedRole = normalizeRole(userRole!);
    
    // Upsert user and profile
    const userId = await upsertUserAndProfile(dbClient, {
      azure_id,
      email,
      customerType: customerType!,
      userRole: normalizedRole,
      orgId
    });

    // Attach RBAC context to request
    req.rbacContext = {
      userId,
      orgId,
      customerType: customerType!,
      userRole: userRole!,
      organisationName: organisationName!
    };

    // Set PostgreSQL context for RLS
    await attachPgContext(dbClient, {
      userId,
      customerType: customerType!,
      userRole: userRole!,
      organisationId: orgId
    });

    // Log successful RBAC setup (minimal PII)
    console.log('RBAC context established:', {
      customerType,
      userRole,
      organisationName,
      hasOrgId: !!orgId,
      hasUserId: !!userId
    });

    next();
  } catch (error) {
    console.error('RBAC middleware error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      reason: 'rbac_processing_error',
      message: 'Error processing RBAC context'
    });
  }
}

/**
 * Helper function to check if user has specific customer type
 */
export function requireCustomerType(customerType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.rbacContext || req.rbacContext.customerType !== customerType) {
      return res.status(403).json({
        error: 'forbidden',
        reason: 'customer_type_mismatch',
        message: `This endpoint requires customer type: ${customerType}`
      });
    }
    next();
  };
}

/**
 * Helper function to check if user has specific role
 */
export function requireRole(userRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.rbacContext || req.rbacContext.userRole !== userRole) {
      return res.status(403).json({
        error: 'forbidden',
        reason: 'role_mismatch',
        message: `This endpoint requires role: ${userRole}`
      });
    }
    next();
  };
}
