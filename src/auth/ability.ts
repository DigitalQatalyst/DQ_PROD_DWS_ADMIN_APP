/**
 * CASL Ability Definitions
 * 
 * This module defines the authorization abilities using CASL for the Platform Admin Dashboard.
 * It uses the canonical permission vocabulary from src/shared/permissions.ts as the single source of truth.
 * 
 * The ability system integrates with Azure External Identities (EEI) and Supabase JWT claims.
 * 
 * IMPORTANT: This module now references the shared permissions registry. All action and subject
 * types are re-exported from src/shared/permissions.ts to ensure consistency.
 */



import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { UserRole, UserSegment } from '../types';
import { 
  Actions as CanonicalActions, 
  Subjects as CanonicalSubjects,
  RolePermissions,
  type Action,
  type Subject,
  type AppAbility as SharedAppAbility
} from '../shared/permissions';

// Re-export shared types as local types for backward compatibility
export type Actions = Action;
export type Subjects = Subject;
export type AppAbility = SharedAppAbility;

/**
 * User context interface for ability building
 */
export interface UserContext {
  role: UserRole;
  user_segment: UserSegment;
  organizationId?: string;
  id?: string;
}

/**
 * Build CASL ability based on user context
 * 
 * @param user - User context containing role and organization information
 * @returns CASL ability instance
 */
export function buildAbility(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Extract user information
  const { role, user_segment, organizationId } = user;

  // Check if user has valid segment
  const validSegments = ['internal', 'partner', 'customer', 'advisor'];
  const isValidSegment = user_segment && validSegments.includes(user_segment);

  // If user doesn't have a valid segment, deny all access
  if (!user_segment || !isValidSegment) {
    const errorMessage = getAccessDeniedMessage(user);
    console.error(`❌ ${errorMessage}`);
    console.error(`❌ Context: user_segment="${user_segment}", role="${role}"`);
    cannot('manage', 'all');
    return build();
  }

  // Get role-specific permissions from shared registry
  const rolePerms = RolePermissions[role];
  if (!rolePerms) {
    console.error(`❌ Unknown role: "${role}". Denying all access.`);
    cannot('manage', 'all');
    return build();
  }

  // Apply permissions based on role from shared registry
  // Note: We apply roles directly here to match the canonical permissions
  
  const crudSubjects = ['Service', 'Content', 'Business', 'Zone', 'GrowthArea'] as Subject[];
  const conditions = user_segment === 'internal' ? undefined : { organization_id: organizationId };

  switch (role) {
    case 'admin':
      can('manage', 'all');
      if (user_segment === 'internal') {
        // Internal Admin: Full permissions including publish
        can('approve', 'Content');
        can('publish', 'Content');
        can('archive', 'Content');
        can('delete', 'Content');
      } else if (user_segment === 'partner') {
        // Partner Admin: Can manage org content but NOT publish
        can('create', crudSubjects, conditions);
        can('read', crudSubjects);
        can('update', crudSubjects, conditions);
        can('approve', ['Content', 'Service'] as Subject[], conditions); // Can approve but not publish
        can('unpublish', ['Content', 'Service'] as Subject[], conditions);
        can('archive', ['Content', 'Service'] as Subject[], conditions);
        // Explicitly deny publish for Partner Admin
        cannot('publish', ['Content', 'Service'] as Subject[]);
      }
      break;

    case 'editor':
      can('create', crudSubjects, conditions);
      can('read', crudSubjects);
      can('update', crudSubjects, conditions);
      can('publish', 'Content', conditions);
      can('flag', 'Content');
      break;

    case 'approver':
      can('read', 'all');
      can('approve', ['Content', 'Service'] as Subject[], conditions);
      if (user_segment === 'internal') {
        // Internal Approver: Can publish Content and Service
        can('publish', ['Content', 'Service'] as Subject[]);
      } else if (user_segment === 'partner') {
        // Partner Approver: Can approve but NOT publish
        cannot('publish', ['Content', 'Service'] as Subject[]);
      }
      break;

    case 'viewer':
      can('read', 'all');
      break;

    default:
      cannot('manage', 'all');
      break;
  }

  // Apply restrictions from shared RolePermissions
  if (role === 'editor') {
    cannot('delete', 'all');
    cannot('approve', 'all');
  }
  if (role === 'viewer') {
    cannot('create', 'all');
    cannot('update', 'all');
    cannot('approve', 'all');
    cannot('publish', 'all');
    cannot('archive', 'all');
    cannot('flag', 'all');
  }

  // Segment-specific overrides and special rules

  // Internal Admins: Full access with additional permissions
  if (role === 'admin' && user_segment === 'internal') {
    can('manage', 'all');
    can('approve', ['Content', 'Service'] as Subject[]);
    can('publish', ['Content', 'Service'] as Subject[]);
    can('archive', ['Content', 'Service'] as Subject[]);
    can('delete', ['Content', 'Service'] as Subject[]);
  }

  // Partner Admins: Can view all content for review
  if (role === 'admin' && user_segment === 'partner') {
    can('read', 'Content'); // Can view all content
  }

  // Approvers: Additional edit permissions for their org
  if (role === 'approver') {
    const crudSubjects: Subject[] = ['Service', 'Content', 'Business', 'Zone', 'GrowthArea'];
    if (user_segment === 'internal') {
      can('create', crudSubjects, { organization_id: organizationId });
      can('read', crudSubjects);
      can('update', crudSubjects);
    } else if (user_segment === 'partner') {
      can('create', crudSubjects, { organization_id: organizationId });
      can('read', crudSubjects);
      can('update', crudSubjects, { organization_id: organizationId });
    }
  }

  // Editors: CRUD for their org
  if (role === 'editor') {
    const crudSubjects: Subject[] = ['Service', 'Content', 'Business', 'Zone', 'GrowthArea'];
    if (user_segment === 'internal') {
      can('create', crudSubjects, { organization_id: organizationId });
      can('read', crudSubjects);
      can('update', crudSubjects, { organization_id: organizationId });
    } else if (user_segment === 'partner') {
      can('create', crudSubjects, { organization_id: organizationId });
      can('read', 'Content');
      can('update', 'Content', { organization_id: organizationId });
    }
  }

  // Flag for Review: Only internal users can flag content and services
  if (user_segment === 'internal') {
    can('flag', ['Content', 'Service'] as Subject[]);
  } else {
    cannot('flag', ['Content', 'Service'] as Subject[]);
  }

  return build();
}

/**
 * Check if user can perform a specific action on a subject
 * 
 * @param ability - CASL ability instance
 * @param action - Action to check
 * @param subject - Subject to check
 * @returns true if user can perform the action, false otherwise
 */
export function canPerformAction(
  ability: AppAbility,
  action: Actions,
  subject: Subjects
): boolean {
  return ability.can(action, subject);
}

/**
 * Get all abilities for a user
 * 
 * @param ability - CASL ability instance
 * @returns Object containing all abilities
 */
export function getUserAbilities(ability: AppAbility) {
  return {
    canCreate: (subject: Subjects) => ability.can('create', subject),
    canRead: (subject: Subjects) => ability.can('read', subject),
    canUpdate: (subject: Subjects) => ability.can('update', subject),
    canDelete: (subject: Subjects) => ability.can('delete', subject),
    canApprove: (subject: Subjects) => ability.can('approve', subject),
    canManage: (subject: Subjects) => ability.can('manage', subject),
  };
}

/**
 * Check if user can access a specific module
 * 
 * @param ability - CASL ability instance
 * @param module - Module name
 * @returns true if user can access the module, false otherwise
 */
export function canAccessModule(ability: AppAbility, module: string): boolean {
  const moduleMap: Record<string, Subjects> = {
    'services': 'Service',
    'contents': 'Content',
    'business_directory': 'Business',
    'zones': 'Zone',
    'growth_areas': 'GrowthArea',
  };

  const subject = moduleMap[module];
  if (!subject) return false;

  return ability.can('read', subject);
}

/**
 * Get permissions for a specific subject
 * 
 * @param ability - CASL ability instance
 * @param subject - Subject to check
 * @returns Array of actions the user can perform on the subject
 */
export function getSubjectPermissions(ability: AppAbility, subject: Subjects): Actions[] {
  const actions: Actions[] = ['create', 'read', 'update', 'delete', 'approve', 'manage'];
  
  return actions.filter(action => ability.can(action, subject));
}

/**
 * Get a user-friendly message explaining why access is denied
 * 
 * @param user - User context
 * @returns Human-readable error message
 */
export function getAccessDeniedMessage(user: UserContext): string {
  if (!user.user_segment) {
    return `Access denied: Missing user segment claim. Please contact support to configure proper Azure claims for your account.`;
  }
  
  const validTypes = ['internal', 'partner', 'customer', 'advisor'];
  if (!validTypes.includes(user.user_segment)) {
    return `Access denied: Invalid user segment "${user.user_segment}". Valid segments: ${validTypes.join(', ')}. Please contact support.`;
  }
  
  return `Access denied: Insufficient permissions. Please contact support if you believe this is an error.`;
}

/**
 * Debug helper to log user abilities
 * 
 * @param ability - CASL ability instance
 * @param user - User context
 */
export function debugUserAbilities(ability: AppAbility, user: UserContext) {
  console.log('🔐 User Abilities Debug:', {
    user: {
      role: user.role,
      organizationId: user.organizationId,
      user_segment: user.user_segment,
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
