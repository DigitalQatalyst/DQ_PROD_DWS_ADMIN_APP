/**
 * Server-side CASL Ability Definitions
 * 
 * This module provides server-side authorization using CASL for Express middleware.
 * It uses the canonical permission vocabulary from src/shared/permissions.ts as the single source of truth.
 * 
 * Used for protecting API routes when migrating backend logic from Supabase.
 * 
 * IMPORTANT: This module references the shared permissions registry. All action and subject
 * types are imported from src/shared/permissions.ts to ensure consistency with frontend.
 */

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
// Backend imports from frontend shared permissions
// In a monorepo, this could be in a shared package
// @ts-ignore - Importing from outside api/ directory
import { 
  RolePermissions,
  type Action,
  type Subject,
  type AppAbility as SharedAppAbility
} from '../src/shared/permissions';

// Re-export shared types as local types for backward compatibility
export type ServerActions = Action;
export type ServerSubjects = Subject;
export type ServerAbility = SharedAppAbility;

/**
 * User context interface for server-side ability building
 */
export interface ServerUserContext {
  role: string;  // Normalized role (admin, editor, approver, viewer)
  organizationId?: string;
  customerType?: string;
  userRole?: string;
  id?: string;
  email?: string;
}

/**
 * Normalizes legacy roles to canonical set
 * Maps creator/contributor to editor
 */
function normalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'admin',
    'approver': 'approver',
    'creator': 'editor',
    'contributor': 'editor',
    'editor': 'editor',
    'viewer': 'viewer'
  };
  return roleMap[role.toLowerCase()] || 'viewer';
}

/**
 * Build CASL ability for server-side authorization
 * 
 * @param user - User context containing role and organization information
 * @returns CASL ability instance for server use
 */
export function buildServerAbility(user: ServerUserContext): ServerAbility {
  const { can, cannot, build } = new AbilityBuilder<ServerAbility>(createMongoAbility);

  // Extract user information
  const { role, organizationId, customerType, userRole } = user;

  // Normalize role (maps creator/contributor to editor)
  const normalizedRole = normalizeRole(role || userRole || 'viewer');

  // Check if user has valid customer type (must be staff/admin/internal or partner)
  const isValidCustomerType = customerType && 
    ['staff', 'admin', 'internal', 'partner'].includes(customerType.toLowerCase());

  // If user doesn't have valid customer type, deny all access
  if (!isValidCustomerType) {
    cannot('manage', 'all');
    return build();
  }

  // Map customerType to user_segment for permission scoping
  const segment = ['staff', 'admin', 'internal'].includes(customerType.toLowerCase()) 
    ? 'internal' 
    : 'partner';

  // Get role-specific permissions from shared registry
  const rolePerms = RolePermissions[normalizedRole as keyof typeof RolePermissions];
  if (!rolePerms) {
    console.error(`❌ Unknown role: "${normalizedRole}". Denying all access.`);
    cannot('manage', 'all');
    return build();
  }

  // Apply permissions based on normalized role
  // Note: We apply roles directly here rather than parsing RolePermissions
  // to avoid TypeScript complexity with dynamic permission specs
  
  const crudSubjects = ['Service', 'Content', 'Business', 'Zone', 'GrowthArea'] as Subject[];
  const conditions = segment === 'internal' ? undefined : { organization_id: organizationId };

  switch (normalizedRole) {
    case 'admin':
      can('manage', 'all');
      if (segment === 'internal') {
        can('approve', 'Content');
        can('publish', 'Content');
        can('archive', 'Content');
        can('delete', 'Content');
      }
      break;

    case 'editor':
      // @ts-ignore - CASL type inference issue with array subjects
      can('create', crudSubjects, conditions);
      // @ts-ignore
      can('read', crudSubjects);
      // @ts-ignore
      can('update', crudSubjects, conditions);
      can('publish', 'Content', conditions);
      can('flag', 'Content');
      break;

    case 'approver':
      can('read', 'all');
      can('approve', ['Content', 'Service'], conditions);
      can('publish', 'Content', conditions);
      break;

    case 'viewer':
      can('read', 'all');
      break;

    default:
      cannot('manage', 'all');
      break;
  }

  return build();
}

/**
 * Express middleware for CASL authorization
 * 
 * @param action - Required action
 * @param subject - Required subject
 * @returns Express middleware function
 */
export function requireAbility(action: ServerActions, subject: ServerSubjects) {
  return (req: any, res: any, next: any) => {
    try {
      // Extract user information from request (assuming it's attached by auth middleware)
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User not authenticated' 
        });
      }

      // Build ability for the user
      const ability = buildServerAbility(user);

      // Check if user can perform the action
      if (!ability.can(action, subject)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `You don't have permission to ${action} ${subject.toLowerCase()}s` 
        });
      }

      // Attach ability to request for use in route handlers
      req.ability = ability;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Authorization check failed' 
      });
    }
  };
}

/**
 * Express middleware for checking multiple abilities
 * 
 * @param abilities - Array of ability checks
 * @returns Express middleware function
 */
export function requireAnyAbility(abilities: Array<{ action: ServerActions; subject: ServerSubjects }>) {
  return (req: any, res: any, next: any) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User not authenticated' 
        });
      }

      const ability = buildServerAbility(user);

      // Check if user has any of the required abilities
      const hasAnyAbility = abilities.some(({ action, subject }) => 
        ability.can(action, subject)
      );

      if (!hasAnyAbility) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      req.ability = ability;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Authorization check failed' 
      });
    }
  };
}

/**
 * Express middleware for checking all abilities
 * 
 * @param abilities - Array of ability checks
 * @returns Express middleware function
 */
export function requireAllAbilities(abilities: Array<{ action: ServerActions; subject: ServerSubjects }>) {
  return (req: any, res: any, next: any) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User not authenticated' 
        });
      }

      const ability = buildServerAbility(user);

      // Check if user has all of the required abilities
      const hasAllAbilities = abilities.every(({ action, subject }) => 
        ability.can(action, subject)
      );

      if (!hasAllAbilities) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      req.ability = ability;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Authorization check failed' 
      });
    }
  };
}

/**
 * Helper function to extract user context from JWT token
 * 
 * @param token - JWT token
 * @returns User context object
 */
export function extractUserContextFromToken(token: any): ServerUserContext {
  // This would typically decode the JWT token and extract claims
  // For now, returning a mock structure
  return {
    role: token?.role || 'viewer',
    organizationId: token?.organizationId,
    customerType: token?.customerType,
    userRole: token?.userRole,
    id: token?.sub || token?.id,
    email: token?.email,
  };
}

/**
 * Express middleware for JWT-based authorization
 * 
 * @param action - Required action
 * @param subject - Required subject
 * @returns Express middleware function
 */
export function requireJWTAbility(action: ServerActions, subject: ServerSubjects) {
  return (req: any, res: any, next: any) => {
    try {
      // Extract JWT token from request
      const token = req.token || req.user; // Assuming token is attached by JWT middleware
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'No authentication token provided' 
        });
      }

      // Extract user context from token
      const userContext = extractUserContextFromToken(token);
      
      // Build ability for the user
      const ability = buildServerAbility(userContext);

      // Check if user can perform the action
      if (!ability.can(action, subject)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `You don't have permission to ${action} ${subject.toLowerCase()}s` 
        });
      }

      // Attach ability and user context to request
      req.ability = ability;
      req.userContext = userContext;
      next();
    } catch (error) {
      console.error('JWT Authorization error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Authorization check failed' 
      });
    }
  };
}

/**
 * Debug helper to log server abilities
 * 
 * @param ability - CASL ability instance
 * @param user - User context
 */
export function debugServerAbilities(ability: ServerAbility, user: ServerUserContext) {
  console.log('🔐 Server Abilities Debug:', {
    user: {
      role: user.role,
      organizationId: user.organizationId,
      customerType: user.customerType,
    },
    abilities: {
      canCreateService: ability.can('create', 'Service'),
      canReadService: ability.can('read', 'Service'),
      canUpdateService: ability.can('update', 'Service'),
      canDeleteService: ability.can('delete', 'Service'),
      canApproveService: ability.can('approve', 'Service'),
      canCreateContent: ability.can('create', 'Content'),
      canReadContent: ability.can('read', 'Content'),
      canUpdateContent: ability.can('update', 'Content'),
      canDeleteContent: ability.can('delete', 'Content'),
      canApproveContent: ability.can('approve', 'Content'),
      canManageAll: ability.can('manage', 'all'),
    }
  });
}
