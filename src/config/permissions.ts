/**
 * UI Display Labels for Permissions and Modules
 * 
 * These labels are used for displaying permission and module names in the UI.
 * The actual authorization logic is handled by CASL in src/auth/ability.ts
 */

export const PermissionLabels = {
  create: 'Create',
  read: 'View',
  update: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
};

export const ModuleLabels = {
  services: 'Service Management',
  contents: 'Content Management',
  business_directory: 'Business Directory',
  zones: 'Zones & Clusters',
  growth_areas: 'Growth Areas',
};
