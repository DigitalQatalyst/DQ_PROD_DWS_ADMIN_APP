/**
 * Policy Export Script
 * 
 * Generates a JSON export of the canonical CASL permissions for audit and documentation purposes.
 * This provides a complete Role → Action → Subject matrix showing all authorization policies.
 * 
 * Usage: npm run export-policies
 */

import { RolePermissions, ActionDescriptions, Actions, Subjects } from '../src/shared/permissions';

interface PermissionExport {
  actions: Array<{
    action: string;
    description: string;
  }>;
  subjects: string[];
  roles: Array<{
    role: string;
    permissions: any[];
    restrictions: any[];
    description: string;
  }>;
  metadata: {
    version: string;
    exportedAt: string;
    canonicalActionsCount: number;
    subjectsCount: number;
    rolesCount: number;
  };
}

function exportPolicies() {
  const matrix: PermissionExport = {
    actions: Actions.map(action => ({
      action,
      description: ActionDescriptions[action]
    })),
    subjects: Subjects as string[],
    roles: Object.entries(RolePermissions).map(([role, perms]) => ({
      role,
      permissions: perms.can,
      restrictions: perms.cannot,
      description: getRoleDescription(role)
    })),
    metadata: {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      canonicalActionsCount: Actions.length,
      subjectsCount: Subjects.length,
      rolesCount: Object.keys(RolePermissions).length
    }
  };

  console.log(JSON.stringify(matrix, null, 2));
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    admin: 'Full administrative control over all actions and entities',
    editor: 'Can create, update, and publish content. Cannot delete or approve.',
    approver: 'Can review, approve, and publish content. Read access to all entities.',
    viewer: 'Read-only access to all entities. Cannot modify or approve.'
  };
  return descriptions[role] || 'Unknown role';
}

// Run the export
exportPolicies();
