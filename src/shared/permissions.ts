/**
 * Shared CASL Permission Registry
 * 
 * This module defines the canonical permission vocabulary used across the entire application.
 * It serves as the single source of truth for all CASL abilities, actions, and subjects.
 * 
 * Design Philosophy:
 * - Standardized action vocabulary (9 canonical verbs)
 * - All domain operations map to these canonical verbs
 * - Consistent enforcement across frontend and backend
 * - Easy audit mapping and role management
 */

// ============================================================================
// CANONICAL ACTIONS - Standardized Vocabulary
// ============================================================================

/**
 * Canonical CASL Actions
 * 
 * These 9 verbs cover all domain operations:
 * - manage: Full administrative control
 * - create, read, update, delete: CRUD operations
 * - approve: Workflow validation
 * - publish: Lifecycle transitions (publish/unpublish bidirectional)
 * - archive: Archive/restore bidirectional
 * - flag: Mark for review
 */
export const Actions = [
  'manage',
  'create',
  'read',
  'update',
  'delete',
  'approve',
  'publish',
  'archive',
  'flag'
] as const;

export type Action = typeof Actions[number];

// ============================================================================
// SUBJECTS - Domain Entities
// ============================================================================

/**
 * CASL Subjects (Resources)
 * 
 * Represents all domain entities that can be acted upon.
 */
export const Subjects = [
  'User',
  'Organization',
  'Content',
  'Service',
  'Business',
  'Zone',
  'GrowthArea',
  'Application',
  'Dashboard',
  'all'
] as const;

export type Subject = typeof Subjects[number];

// ============================================================================
// ROLE PERMISSIONS - Authority Matrix
// ============================================================================

/**
 * Role Permissions Configuration
 * 
 * Maps each normalized role to specific action-subject permissions.
 * This is the canonical authority matrix enforced by CASL.
 * 
 * Roles:
 * - admin: Full control (manage all)
 * - editor: Content creation and lifecycle management (create, update, publish, flag)
 * - approver: Workflow validation and publishing (read, approve, publish)
 * - viewer: Read-only access
 */
export const RolePermissions = {
  admin: {
    can: [['manage', 'all']],
    cannot: []
  },
  editor: {
    can: [
      [['create', 'read', 'update'], ['Content', 'Service', 'Business', 'Zone', 'GrowthArea']],
      ['publish', 'Content'],  // Can publish/unpublish (bidirectional)
      ['flag', 'Content']
    ],
    cannot: [
      ['delete', 'all'],
      ['approve', 'all']
    ]
  },
  approver: {
    can: [
      ['read', 'all'],
      [['approve', 'publish'], 'Content'],
      ['approve', 'Service']
    ],
    cannot: [
      ['delete', 'all'],
      ['create', 'all']
    ]
  },
  viewer: {
    can: [['read', 'all']],
    cannot: [
      ['create', 'update', 'delete', 'approve', 'publish', 'archive', 'flag'], 
      'all'
    ]
  }
} as const;

// ============================================================================
// ACTION DESCRIPTIONS - Audit Metadata
// ============================================================================

/**
 * Human-readable descriptions for each action
 * Used for audit logs, documentation, and policy exports
 */
export const ActionDescriptions: Record<Action, string> = {
  manage: 'Full administrative control over all actions and entities',
  create: 'Create new entities',
  read: 'View and read entities',
  update: 'Modify existing entities',
  delete: 'Permanently remove entities',
  approve: 'Validate and approve workflow transitions',
  publish: 'Publish or unpublish content (bidirectional lifecycle transition)',
  archive: 'Archive or restore entities (bidirectional)',
  flag: 'Mark entities for review or follow-up'
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AppAbility = import('@casl/ability').MongoAbility<[Action, Subject]>;
