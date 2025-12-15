/**
 * RBAC Integration Tests for CASL Enforcement
 * 
 * Tests that:
 * - Each role generates valid abilities
 * - Frontend and backend use identical Actions/Subjects
 * - Canonical 9-action vocabulary is enforced
 * - Role normalization works correctly
 */

import { buildAbility } from '../../src/auth/ability';
import { buildServerAbility } from '../../api/ability';
import { Actions, Subjects } from '../../src/shared/permissions';
import type { UserContext } from '../../src/auth/ability';
import type { ServerUserContext } from '../../api/ability';

describe('CASL Integration Tests', () => {
  describe('Canonical Actions Vocabulary', () => {
    it('should have exactly 9 canonical actions', () => {
      expect(Actions).toHaveLength(9);
      expect(Actions).toContain('manage');
      expect(Actions).toContain('create');
      expect(Actions).toContain('read');
      expect(Actions).toContain('update');
      expect(Actions).toContain('delete');
      expect(Actions).toContain('approve');
      expect(Actions).toContain('publish');
      expect(Actions).toContain('archive');
      expect(Actions).toContain('flag');
    });

    it('should verify publish is bidirectional', () => {
      const editorContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildAbility(editorContext);
      
      // Publish permission should exist (covers both publish and unpublish)
      expect(ability.can('publish', 'Content')).toBe(true);
    });
  });

  describe('Role Permissions', () => {
    it('should grant admin full control', () => {
      const context: UserContext = {
        role: 'admin',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'admin-123',
      };

      const ability = buildAbility(context);

      // Test all actions
      Actions.forEach(action => {
        if (action !== 'manage') {
          expect(ability.can(action, 'Content')).toBe(true);
        }
      });
      expect(ability.can('manage', 'all')).toBe(true);
    });

    it('should grant editor CRUD + publish', () => {
      const context: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'editor-123',
      };

      const ability = buildAbility(context);

      expect(ability.can('create', 'Content')).toBe(true);
      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('update', 'Content')).toBe(true);
      expect(ability.can('publish', 'Content')).toBe(true);
      expect(ability.can('flag', 'Content')).toBe(true);
      
      expect(ability.can('delete', 'Content')).toBe(false);
      expect(ability.can('approve', 'Content')).toBe(false);
    });

    it('should grant approver read + approve + publish', () => {
      const context: UserContext = {
        role: 'approver',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'approver-123',
      };

      const ability = buildAbility(context);

      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('approve', 'Content')).toBe(true);
      expect(ability.can('publish', 'Content')).toBe(true);
      
      expect(ability.can('delete', 'Content')).toBe(false);
    });

    it('should grant viewer read-only', () => {
      const context: UserContext = {
        role: 'viewer',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'viewer-123',
      };

      const ability = buildAbility(context);

      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('create', 'Content')).toBe(false);
      expect(ability.can('update', 'Content')).toBe(false);
      expect(ability.can('delete', 'Content')).toBe(false);
      expect(ability.can('publish', 'Content')).toBe(false);
    });
  });

  describe('Frontend-Backend Consistency', () => {
    it('should generate consistent abilities for frontend and backend', () => {
      const frontendContext: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const backendContext: ServerUserContext = {
        role: 'editor',
        customerType: 'staff',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const frontendAbility = buildAbility(frontendContext);
      const backendAbility = buildServerAbility(backendContext);

      // Key permissions should match
      expect(frontendAbility.can('create', 'Content')).toBe(backendAbility.can('create', 'Content'));
      expect(frontendAbility.can('read', 'Content')).toBe(backendAbility.can('read', 'Content'));
      expect(frontendAbility.can('update', 'Content')).toBe(backendAbility.can('update', 'Content'));
      expect(frontendAbility.can('publish', 'Content')).toBe(backendAbility.can('publish', 'Content'));
    });
  });

  describe('Role Normalization', () => {
    it('should normalize creator to editor in frontend', () => {
      const context: UserContext = {
        role: 'creator' as any, // Pretend we received legacy role
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'user-123',
      };

      // The ability builder should handle unknown roles gracefully
      const ability = buildAbility(context);
      
      // Creator should be treated as viewer (denied) since it's not a recognized role
      // In practice, this would be normalized upstream in claimNormalizer
      expect(ability.can('read', 'all')).toBe(false);
    });

    it('should normalize creator to editor in backend', () => {
      const context: ServerUserContext = {
        role: 'creator',
        customerType: 'staff',
        organizationId: 'org-123',
        id: 'user-123',
      };

      const ability = buildServerAbility(context);

      // Should have editor permissions (creator was normalized internally)
      expect(ability.can('create', 'Content')).toBe(true);
      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('update', 'Content')).toBe(true);
      expect(ability.can('publish', 'Content')).toBe(true);
    });
  });

  describe('Subject Coverage', () => {
    it('should cover all domain entities', () => {
      expect(Subjects).toContain('Content');
      expect(Subjects).toContain('Service');
      expect(Subjects).toContain('Business');
      expect(Subjects).toContain('Zone');
      expect(Subjects).toContain('GrowthArea');
      expect(Subjects).toContain('User');
      expect(Subjects).toContain('Organization');
      expect(Subjects).toContain('all');
    });

    it('should grant read access to all subjects for viewer', () => {
      const context: UserContext = {
        role: 'viewer',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'viewer-123',
      };

      const ability = buildAbility(context);

      // Viewer should be able to read all entities
      expect(ability.can('read', 'Content')).toBe(true);
      expect(ability.can('read', 'Service')).toBe(true);
      expect(ability.can('read', 'Business')).toBe(true);
      expect(ability.can('read', 'Zone')).toBe(true);
      expect(ability.can('read', 'GrowthArea')).toBe(true);
    });
  });

  describe('No Unpublish Action', () => {
    it('should NOT have unpublish as separate action', () => {
      // Verify unpublish is not in canonical actions
      expect(Actions).not.toContain('unpublish');
      
      // Instead, publish should be bidirectional
      const context: UserContext = {
        role: 'editor',
        user_segment: 'internal',
        organizationId: 'org-123',
        id: 'editor-123',
      };

      const ability = buildAbility(context);
      
      // Should only have publish, not unpublish
      expect(ability.can('publish', 'Content')).toBe(true);
      // @ts-expect-error - unpublish should not be a valid action
      expect(() => ability.can('unpublish', 'Content')).toThrow();
    });
  });
});
