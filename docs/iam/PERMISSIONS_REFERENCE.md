# Permissions Reference - RBAC System

## Overview

This document provides the **complete permissions reference** for the Platform Admin Dashboard's Role-Based Access Control (RBAC) system. It is based on the actual implementation in `src/auth/ability.ts`.

## Architecture

The RBAC system uses:
- **CASL** for ability-based authorization
- **User Segment** (`internal`, `partner`, `customer`, `advisor`) - defines who the user is
- **Role** (`admin`, `editor`, `approver`, `viewer`) - defines what the user can do
- **Organization Scoping** - filters data access for non-internal users

## Permission Matrix

### Internal Users (Staff/Admin)

| Role | Services | Content | Business | Zone | Growth Area | Actions |
|------|----------|---------|----------|------|-------------|---------|
| **Admin** | Full | Full | Full | Full | Full | create, read, update, delete, approve, publish, unpublish, archive |
| **Editor** | CRU | CRU | CRU | CRU | CRU | create, read, update, unpublish, archive |
| **Approver** | R+Approve | R+Approve | R | R | R | read, approve, publish |
| **Viewer** | R | R | R | R | R | read |

### Partner Users (Service Providers)

| Role | Services | Content | Business | Zone | Growth Area | Actions |
|------|----------|---------|----------|------|-------------|---------|
| **Admin** | Full (org) | Full (org) | Full (org) | Full (org) | Full (org) | create, read, update, delete, approve, publish, unpublish, archive (org-scoped) |
| **Editor** | CRU (org) | CRU (org) | CRU (org) | CRU (org) | CRU (org) | create, read, update, unpublish, archive (org-scoped) |
| **Approver** | R | R+Approve (org) | R | R | R | read, approve (org-scoped) |
| **Viewer** | R | R | R | R | R | read |

### Customer Users (End Users)

| Role | Services | Content | Business | Zone | Growth Area | Actions |
|------|----------|---------|----------|------|-------------|---------|
| **Any Role** | R | **Blocked** | R | R | R | read only (no content management) |

### Advisor Users

| Role | Services | Content | Business | Zone | Growth Area | Actions |
|------|----------|---------|----------|------|-------------|---------|
| **Any Role** | R | R | R | R | R | read-only for all resources |

## Permission Rules (CASL)

### Actions

| Action | Description | Examples |
|--------|-------------|----------|
| `create` | Create new resources | Create a new service |
| `read` | View resources | View service list |
| `update` | Modify existing resources | Edit service details |
| `delete` | Remove resources | Delete a service |
| `approve` | Review and approve content | Approve for publication |
| `publish` | Publish content | Make content live |
| `unpublish` | Unpublish content | Remove from public view |
| `archive` | Archive content | Move to archive |
| `manage` | Full access to resource | All actions on resource |

### Subjects (Resources)

| Subject | Description | Table |
|---------|-------------|-------|
| `Service` | Marketplace services | `mktplc_services` |
| `Content` | CMS content items | `cnt_contents` |
| `Business` | Business directory entries | `eco_business_directory` |
| `Zone` | Economic zones | `eco_zones` |
| `GrowthArea` | Growth areas | `eco_growth_areas` |
| `User` | User management | `auth_users` |
| `Organization` | Organization management | `organisations` |
| `all` | All resources | - |

## Detailed Permission Logic

### Internal Admin
```typescript
can('manage', 'all');  // Full platform access
can('approve', 'Content');
can('publish', 'Content');
can('unpublish', 'Content');
can('archive', 'Content');
can('delete', 'Content');
```
- Sees all content across all organizations
- Can perform any action on any resource
- No organization filtering applied

### Partner Admin
```typescript
can('manage', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('approve', 'Content', { organization_id: organizationId });
can('publish', 'Content', { organization_id: organizationId });
can('read', 'Content');  // Can view all for review
```
- Can manage organization-scoped content
- Can view all content (for review purposes)
- Can only approve/publish own organization's content
- Organization filter applied via RLS

### Internal Editor
```typescript
can('create', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('read', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('update', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('unpublish', 'Content');
can('archive', 'Content');
```
- Can create and edit all content
- Can unpublish and archive content
- No delete or publish permissions

### Partner Editor
```typescript
can('create', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('read', 'Content');
can('update', 'Content', { organization_id: organizationId });
can('unpublish', 'Content', { organization_id: organizationId });
can('archive', 'Content', { organization_id: organizationId });
```
- Can create content (automatically org-scoped)
- Can only update own organization's content
- Can view all content

### Internal Approver
```typescript
can('read', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('approve', ['Service', 'Content']);
can('publish', 'Content');
```
- Read-only access to all resources
- Can approve services and content
- Can publish content

### Partner Approver
```typescript
can('read', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
can('approve', 'Content', { organization_id: organizationId });
```
- Read-only access
- Can only approve own organization's content

### Viewer (All Segments)
```typescript
can('read', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
```
- Read-only access to all resources
- No create, update, delete permissions

### Customer Users
```typescript
cannot('read', 'Content');
cannot('create', 'Content');
cannot('update', 'Content');
```
- Specifically blocked from Content management
- Can read services, businesses, zones, growth areas
- Organization-filtered access

## Organization Scoping

Organization filtering is applied in two layers:

1. **Frontend (`useCRUD` hook)**: Filters by `organization_id` from localStorage
2. **Backend (RLS policies)**: Database-level filtering

### Internal Users
- No organization filter applied
- Can see and access all content

### Partner/Customer/Advisor Users
- Organization filter applied
- Only see content from their organization

## Usage in Code

### Checking Permissions
```typescript
import { useAbility } from '../hooks/useAbility';

function MyComponent() {
  const { can } = useAbility();
  
  // Check specific action
  if (can('create', 'Service')) {
    return <CreateButton />;
  }
  
  // Check multiple actions
  if (can('read', 'Content') && can('approve', 'Content')) {
    return <ReviewPanel />;
  }
}
```

### In CASL Ability Rules
```typescript
// From src/auth/ability.ts
case 'admin':
  if (user_segment === 'internal') {
    can('manage', 'all');  // Full access
  } else if (user_segment === 'partner') {
    can('manage', ['Service', 'Content', 'Business', 'Zone', 'GrowthArea']);
    can('approve', 'Content', { organization_id: organizationId });
  }
  break;
```

## Special Rules

1. **Customer Users**: Blocked from Content management regardless of role
2. **Cross-Segment Access**: Partner admins can view all content for review
3. **Organization Scoping**: Automatically applied to non-internal users
4. **CASL Constraints**: `{ organization_id: organizationId }` limits actions to org resources

## References

- CASL implementation: `src/auth/ability.ts`
- Ability builder: `buildAbility(userContext)`
- User types: `src/types/index.ts`
- CRUD hook: `src/hooks/useCRUD.ts`
- Auth context: `src/context/AuthContext.tsx`

