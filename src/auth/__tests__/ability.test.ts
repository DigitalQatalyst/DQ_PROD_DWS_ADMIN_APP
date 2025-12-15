/**
 * Unit Tests for CASL Ability System
 * 
 * Tests the authorization logic for different user roles and permissions.
 * Uses normalized roles: admin, editor, approver, viewer
 * Legacy roles (creator, contributor) are normalized to 'editor'
 */

import { buildAbility, canPerformAction, getUserAbilities, canAccessModule } from '../ability';
import { UserContext } from '../ability';
import { Actions } from '../../shared/permissions';

describe('CASL Ability System', () => {
  describe('buildAbility', () => {
    it('should grant full access to admin users', () => {
      const userContext: UserContext = {
        role: 'admin',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('manage', 'all')).toBe(true);
      expect(ability.can('create', 'Service')).toBe(true);
      expect(ability.can('read', 'Service')).toBe(true);
      expect(ability.can('update', 'Service')).toBe(true);
      expect(ability.can('delete', 'Service')).toBe(true);
      expect(ability.can('approve', 'Service')).toBe(true);
    });

    it('should grant read and approve access to approver users', () => {
      const userContext: UserContext = {
        role: 'approver',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('read', 'Service')).toBe(true);
      expect(ability.can('approve', 'Service')).toBe(true);
      expect(ability.can('create', 'Service')).toBe(false);
      expect(ability.can('update', 'Service')).toBe(false);
      expect(ability.can('delete', 'Service')).toBe(false);
    });

    it('should grant create, read, update, and publish access to editor users', () => {
      // Editor role replaces legacy creator/contributor roles
      const userContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('create', 'Service')).toBe(true);
      expect(ability.can('read', 'Service')).toBe(true);
      expect(ability.can('update', 'Service')).toBe(true);
      expect(ability.can('publish', 'Content')).toBe(true);  // Can publish/unpublish
      expect(ability.can('flag', 'Content')).toBe(true);     // Can flag
      expect(ability.can('delete', 'Service')).toBe(false);  // Cannot delete
      expect(ability.can('approve', 'Service')).toBe(false); // Cannot approve
    });

    it('should verify publish action works bidirectionally', () => {
      const editorContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(editorContext);

      // Publish permission covers both publish and unpublish
      expect(ability.can('publish', 'Content')).toBe(true);
      // The UI should determine current state and show appropriate button
    });

    it('should grant read-only access to viewer users', () => {
      const userContext: UserContext = {
        role: 'viewer',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('read', 'Service')).toBe(true);
      expect(ability.can('create', 'Service')).toBe(false);
      expect(ability.can('update', 'Service')).toBe(false);
      expect(ability.can('delete', 'Service')).toBe(false);
      expect(ability.can('approve', 'Service')).toBe(false);
    });

    it('should deny all access to unauthorized users', () => {
      const userContext: UserContext = {
        role: 'unauthorized' as any,
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('read', 'Service')).toBe(false);
      expect(ability.can('create', 'Service')).toBe(false);
      expect(ability.can('update', 'Service')).toBe(false);
      expect(ability.can('delete', 'Service')).toBe(false);
      expect(ability.can('approve', 'Service')).toBe(false);
    });

    it('should deny all access to users with invalid segment', () => {
      const userContext: UserContext = {
        role: 'admin',
        user_segment: 'invalid' as any, // Invalid segment
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('manage', 'all')).toBe(false);
      expect(ability.can('read', 'Service')).toBe(false);
      expect(ability.can('create', 'Service')).toBe(false);
    });

    it('should deny all access to users without segment', () => {
      const userContext: UserContext = {
        role: 'admin',
        organizationId: 'org-123',
        id: 'user-123',
      } as any; // Missing user_segment

      const ability = buildAbility(userContext);

      expect(ability.can('manage', 'all')).toBe(false);
      expect(ability.can('read', 'Service')).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should correctly check if user can perform specific actions', () => {
      const userContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(canPerformAction(ability, 'create', 'Service')).toBe(true);
      expect(canPerformAction(ability, 'read', 'Service')).toBe(true);
      expect(canPerformAction(ability, 'update', 'Service')).toBe(true);
      expect(canPerformAction(ability, 'delete', 'Service')).toBe(false);
      expect(canPerformAction(ability, 'approve', 'Service')).toBe(false);
    });
  });

  describe('getUserAbilities', () => {
    it('should return correct abilities for a user', () => {
      const userContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);
      const abilities = getUserAbilities(ability);

      expect(abilities.canCreate('Service')).toBe(true);
      expect(abilities.canRead('Service')).toBe(true);
      expect(abilities.canUpdate('Service')).toBe(true);
      expect(abilities.canDelete('Service')).toBe(false);
      expect(abilities.canApprove('Service')).toBe(false);
      expect(abilities.canManage('Service')).toBe(false);
    });
  });

  describe('canAccessModule', () => {
    it('should correctly check module access', () => {
      const userContext: UserContext = {
        role: 'viewer',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(canAccessModule(ability, 'services')).toBe(true);
      expect(canAccessModule(ability, 'contents')).toBe(true);
      expect(canAccessModule(ability, 'business_directory')).toBe(true);
      expect(canAccessModule(ability, 'zones')).toBe(true);
      expect(canAccessModule(ability, 'growth_areas')).toBe(true);
      expect(canAccessModule(ability, 'unknown_module')).toBe(false);
    });
  });

  describe('Content permissions', () => {
    it('should grant appropriate permissions for content management', () => {
      const userContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('create', 'Content')).toBe(true);
      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('update', 'Content')).toBe(true);
      expect(ability.can('publish', 'Content')).toBe(true);  // Can publish/unpublish
      expect(ability.can('flag', 'Content')).toBe(true);     // Can flag
      expect(ability.can('delete', 'Content')).toBe(false);  // Cannot delete
      expect(ability.can('approve', 'Content')).toBe(false); // Cannot approve
    });
  });

  describe('Business permissions', () => {
    it('should grant appropriate permissions for business management', () => {
      const userContext: UserContext = {
        role: 'admin',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(userContext);

      expect(ability.can('create', 'Business')).toBe(true);
      expect(ability.can('read', 'Business')).toBe(true);
      expect(ability.can('update', 'Business')).toBe(true);
      expect(ability.can('delete', 'Business')).toBe(true);
      expect(ability.can('approve', 'Business')).toBe(true);
    });
  });
});
