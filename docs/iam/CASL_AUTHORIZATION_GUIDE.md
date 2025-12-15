# CASL Authorization Implementation Guide

This document provides a comprehensive guide to the CASL-based authorization system implemented in the Platform Admin Dashboard.

## Overview

The authorization system uses [CASL](https://casl.js.org/) to provide type-safe, role-based access control (RBAC) throughout the application. It integrates with Azure External Identities (EEI) and Supabase JWT tokens to enforce permissions at both the client and server levels.

## Architecture

### Core Components

1. **`src/auth/ability.ts`** - Client-side ability definitions
2. **`src/components/auth/Can.tsx`** - React component wrapper for conditional rendering
3. **`src/hooks/useAbility.ts`** - Hook for accessing abilities in components
4. **`src/context/AuthContext.tsx`** - Extended to include CASL abilities
5. **`api/ability.ts`** - Server-side ability definitions for Express middleware

### Permission Matrix

**Important**: The CASL system uses `user_segment` (internal, partner, customer, advisor) + `role` to determine permissions. The database stores `customer_type` which is mapped to `user_segment` in the frontend.

| Role | Create | Read | Update | Delete | Approve | Manage |
|------|--------|------|--------|--------|---------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approver | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Unauthorized | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Note**: The database allows roles `creator` and `contributor`, but the frontend normalizes both to `editor` in the CASL ability system.

## Usage Examples

### 1. Client-Side Component Protection

```tsx
import { Can } from '../components/auth/Can';

// Conditional rendering based on permissions
<Can I="create" a="Service">
  <button onClick={handleCreateService}>
    Create Service
  </button>
</Can>

<Can I="update" a="Service">
  <button onClick={handleEditService}>
    Edit Service
  </button>
</Can>

// With fallback content
<Can I="delete" a="Service" fallback={<div>No permission to delete</div>}>
  <button onClick={handleDeleteService}>
    Delete Service
  </button>
</Can>
```

### 2. Using the useAbilities Hook

```tsx
import { useAbilities } from '../components/auth/Can';

function MyComponent() {
  const { canCreate, canUpdate, canDelete } = useAbilities();

  return (
    <div>
      {canCreate('Service') && (
        <button>Create Service</button>
      )}
      {canUpdate('Service') && (
        <button>Update Service</button>
      )}
      {canDelete('Service') && (
        <button>Delete Service</button>
      )}
    </div>
  );
}
```

### 3. CRUD Operations with Permission Checks

The `useCRUD` hook automatically checks permissions before performing operations:

```tsx
import { useCRUD } from '../hooks/useCRUD';

function ServiceManagement() {
  const { data, create, update, remove, error } = useCRUD<Service>('mktplc_services');

  // These operations will automatically check permissions
  const handleCreate = async (serviceData) => {
    const result = await create(serviceData);
    // Will fail with permission error if user can't create
  };

  const handleUpdate = async (id, updates) => {
    const result = await update(id, updates);
    // Will fail with permission error if user can't update
  };
}
```

### 4. Server-Side Express Middleware

```typescript
import { requireAbility, requireJWTAbility } from '../api/ability';

// Protect routes with specific abilities
app.get('/api/services', requireAbility('read', 'Service'), (req, res) => {
  // Only users who can read services can access this endpoint
});

app.post('/api/services', requireAbility('create', 'Service'), (req, res) => {
  // Only users who can create services can access this endpoint
});

app.put('/api/services/:id', requireAbility('update', 'Service'), (req, res) => {
  // Only users who can update services can access this endpoint
});

app.delete('/api/services/:id', requireAbility('delete', 'Service'), (req, res) => {
  // Only users who can delete services can access this endpoint
});

// JWT-based protection
app.get('/api/services', requireJWTAbility('read', 'Service'), (req, res) => {
  // Uses JWT token to determine abilities
});
```

### 5. Multiple Ability Checks

```typescript
import { requireAnyAbility, requireAllAbilities } from '../api/ability';

// User needs ANY of these abilities
app.get('/api/dashboard', requireAnyAbility([
  { action: 'read', subject: 'Service' },
  { action: 'read', subject: 'Content' }
]), (req, res) => {
  // User can access if they can read either services or content
});

// User needs ALL of these abilities
app.get('/api/admin', requireAllAbilities([
  { action: 'manage', subject: 'Service' },
  { action: 'manage', subject: 'Content' }
]), (req, res) => {
  // User can access only if they can manage both services and content
});
```

## Subject Types

The system defines the following subjects (resources):

- `Service` - Service management
- `Content` - Content management  
- `Business` - Business directory
- `Zone` - Zones and clusters
- `GrowthArea` - Growth areas
- `User` - User management
- `Organization` - Organization management
- `all` - All subjects (for admin access)

## Action Types

The system defines the following actions:

- `create` - Create new resources
- `read` - View/read resources
- `update` - Modify existing resources
- `delete` - Remove resources
- `approve` - Approve resources (for workflow)
- `manage` - Full management access

## Role Definitions

### Admin
- **Access**: Full access to all modules and actions
- **Use Case**: System administrators, platform managers
- **Permissions**: Can create, read, update, delete, and approve all resources

### Approver
- **Access**: Read and approve access only
- **Use Case**: Content reviewers, service approvers
- **Permissions**: Can view and approve services and content

### Editor
- **Access**: Create, read, and update content
- **Use Case**: Content creators, service providers
- **Permissions**: Can create and manage services and content
- **Note**: This represents both `creator` and `contributor` database roles, normalized in frontend

### Contributor (Deprecated)
- **Access**: Read and update existing content (deprecated, now part of Editor)
- **Use Case**: Content editors, service maintainers
- **Permissions**: Can view and modify existing services and content

### Viewer
- **Access**: Read-only access
- **Use Case**: Stakeholders, observers
- **Permissions**: Can only view services and content

### Unauthorized
- **Access**: No access
- **Use Case**: Unauthenticated users, invalid credentials
- **Permissions**: Cannot access any resources

## Customer Type Validation

The system enforces that only users with valid customer types can access the platform:

- `staff` - Internal staff members
- `admin` - Administrative users
- `internal` - Internal organization members

Users with other customer types (e.g., `external`, `customer`) are denied access regardless of their role.

## Integration with Azure EEI

The system integrates with Azure External Identities by:

1. **JWT Token Claims**: Extracting role and organization information from JWT tokens
2. **User Segment Validation**: Checking the `user_segment` claim for access eligibility
   - Database field: `customer_type` (staff, partner, enterprise, advisor)
   - Frontend maps to: `user_segment` (internal, partner, customer, advisor)
   - See [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md) for mapping details
3. **Dynamic Ability Building**: Building abilities based on current user context
4. **Session Management**: Updating abilities when user context changes

## Testing

### Unit Tests

Run the ability system tests:

```bash
npm test src/auth/__tests__/ability.test.ts
```

### Manual Testing

1. **Login as different roles** and verify UI elements are shown/hidden correctly
2. **Test CRUD operations** to ensure permission checks work
3. **Check API endpoints** with different user contexts
4. **Verify error messages** when permissions are denied

### Debug Mode

Enable debug logging to see ability decisions:

```typescript
import { debugUserAbilities } from '../auth/ability';

// This will log detailed ability information to console
debugUserAbilities(ability, userContext);
```

## Best Practices

### 1. Always Use Type-Safe Abilities

```tsx
// ✅ Good - Type-safe
<Can I="create" a="Service">
  <button>Create</button>
</Can>

// ❌ Bad - Not type-safe
<Can I="create" a="service">
  <button>Create</button>
</Can>
```

### 2. Provide Fallback Content

```tsx
// ✅ Good - Provides user feedback
<Can I="delete" a="Service" fallback={<div>No permission to delete</div>}>
  <button>Delete</button>
</Can>

// ❌ Bad - No user feedback
<Can I="delete" a="Service">
  <button>Delete</button>
</Can>
```

### 3. Use Appropriate Granularity

```tsx
// ✅ Good - Specific permissions
<Can I="update" a="Service">
  <button>Edit</button>
</Can>

// ❌ Bad - Too broad
<Can I="manage" a="all">
  <button>Edit</button>
</Can>
```

### 4. Handle Permission Errors Gracefully

```tsx
const { create, error } = useCRUD<Service>('mktplc_services');

const handleCreate = async (data) => {
  try {
    await create(data);
  } catch (err) {
    if (err.message.includes('permission')) {
      showToast('error', 'You do not have permission to create services');
    }
  }
};
```

## Migration from Legacy System

The CASL system is designed to work alongside the existing permission system:

1. **Gradual Migration**: Components can be updated one at a time
2. **Backward Compatibility**: Legacy permission checks continue to work
3. **Enhanced Features**: New CASL features provide additional capabilities
4. **Type Safety**: Better TypeScript support and compile-time checks

## Troubleshooting

### Common Issues

1. **"useAbility must be used within an AuthProvider"**
   - Ensure the component is wrapped in `AuthProvider`
   - Check that the ability is properly initialized

2. **Permissions not updating after role change**
   - Verify that the ability is rebuilt when user context changes
   - Check that the AuthContext is properly updating

3. **Server-side authorization failing**
   - Verify JWT token is properly decoded
   - Check that user context is correctly extracted
   - Ensure middleware is applied in the correct order

### Debug Steps

1. **Check user context** in browser dev tools
2. **Verify ability object** contains expected permissions
3. **Test with different roles** to isolate issues
4. **Check server logs** for authorization errors
5. **Validate JWT token** claims and structure

## Future Enhancements

1. **Resource-Level Permissions**: Fine-grained permissions on individual resources
2. **Time-Based Permissions**: Temporary access grants
3. **Conditional Permissions**: Context-dependent access rules
4. **Audit Logging**: Track permission usage and changes
5. **Permission Inheritance**: Hierarchical permission structures
