/**
 * CASL Ability Definitions
 * 
 * This module defines the authorization abilities using CASL for the Platform Admin Dashboard.
 * It uses the canonical permission vocabulary from src/shared/permissions.ts as the single source of truth.
 * 
 * The ability system integrates with Supabase Auth metadata.
 */

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { UserRole, UserSegment } from '../types';
import { Action, Subject, RolePermissions, AppAbility as SharedAppAbility } from '../shared/permissions';

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

  const { role, user_segment, organizationId } = user;

  // 1. Basic Validation
  if (!user_segment || !role) {
    cannot('manage', 'all');
    return build();
  }

  // 2. Load Permissions from Shared Registry
  const roleRules = RolePermissions[role];
  if (!roleRules) {
    console.error(`❌ Unknown role: "${role}". Denying all access.`);
    cannot('manage', 'all');
    return build();
  }

  // 3. Apply Registry Rules
  // Registry format: { can: [[Action|Action[], Subject|Subject[]], ...], cannot: [...] }

  // Apply "CAN" rules
  roleRules.can.forEach(([actions, subjects]) => {
    // If user is not internal, we automatically apply organization scoping
    if (user_segment !== 'internal' && organizationId && subjects !== 'all' && (subjects === 'Service' || subjects === 'Content')) {
      can(actions as any, subjects as any, { organization_id: organizationId });
    } else {
      can(actions as any, subjects as any);
    }
  });

  // Apply "CANNOT" rules
  roleRules.cannot.forEach((rule) => {
    if (Array.isArray(rule)) {
      const [actions, subjects] = rule;
      cannot(actions as any, subjects as any);
    } else {
      cannot('manage', rule as any);
    }
  });

  // 4. Special Overrides
  if (role === 'admin' && user_segment === 'internal') {
    can('manage', 'all');
  }

  return build();
}

/**
 * Check if user can perform a specific action on a subject
 */
export function canPerformAction(
  ability: AppAbility,
  action: Actions,
  subject: Subjects
): boolean {
  return ability.can(action, subject);
}

/**
 * Get all primary abilities for a user
 */
export function getUserAbilities(ability: AppAbility) {
  return {
    canCreate: (subject: Subjects) => ability.can('create', subject),
    canRead: (subject: Subjects) => ability.can('read', subject),
    canUpdate: (subject: Subjects) => ability.can('update', subject),
    canDelete: (subject: Subjects) => ability.can('delete', subject),
    canApprove: (subject: Subjects) => ability.can('approve', subject),
    canPublish: (subject: Subjects) => ability.can('publish', subject),
    canManage: (subject: Subjects) => ability.can('manage', subject),
    canInvite: (subject: Subjects) => ability.can('invite', subject),
  };
}

/**
 * Debug helper to log user abilities
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
      canApproveService: ability.can('approve', 'Service'),
      canCreateContent: ability.can('create', 'Content'),
      canApproveContent: ability.can('approve', 'Content'),
      canInviteUsers: ability.can('invite', 'User'),
      canManageAll: ability.can('manage', 'all'),
    }
  });
}
