# RBAC Progressive Permissions Design

**Date:** October 28, 2025  
**Status:** ✅ IMPLEMENTED  
**Location:** /docs (final documentation)

## Design Philosophy - UPDATED

Roles should be **progressive** where each role includes all permissions from the previous role:
- **Viewer** (base)
- **Editor** = Viewer + Create + Edit
- **Approver** = Editor + Approve + Publish + Unplublish
- **Admin** = Approver + Archive + Delete

## Internal Segment Permissions - UPDATED

| Role     | View       | Create     | Edit       | Unpublish  | Approve    | Publish    | Archive    | Delete     | Notes                           |
|----------|------------|------------|------------|------------|------------|------------|------------|------------|---------------------------------|
| Admin    | ✅ All     | ✅ All     | ✅ All     | ✅ All     | ✅ All     | ✅ All     | ✅ All     | ✅ All     | Full platform access            |
| Approver | ✅ All     | ✅ Org     | ✅ All     | ✅ All     | ✅ All     | ✅ All     | ❌         | ❌         | Create only for their org      |
| Editor   | ✅ All     | ✅ Org     | ✅ Org     | ❌         | ❌         | ❌         | ❌         | ❌         | Cannot approve/publish          |
| Viewer   | ✅ All     | ❌         | ❌         | ❌         | ❌         | ❌         | ❌         | ❌         | Read-only                       |

### Internal Segment Key Points - NEEDS UPDATE
- **Internal Admin**: Full access across all content (no org filter)
- **Internal Approver**: Can create content ONLY for their organization (preserves data sanity), but can edit/approve/publish all content
- **Internal Editor**: Can create content ONLY for their organization (preserves data sanity)
- **Internal Viewer**: Read-only access to all content

## Partner Segment Permissions - UPDATE

| Role     | View      | Create   | Edit     | Unpublish | Approve   | Publish   | Archive   | Delete    | Notes                              |
|----------|-----------|----------|----------|-----------|-----------|-----------|-----------|-----------|------------------------------------|
| Admin    | ✅ Org    | ✅ Org   | ✅ Org   | ✅ Org    | ✅ Org    | ✅ Org    | ❌        | ❌        | Org-scoped operations  |
| Approver | ✅ Org    | ✅ Org   | ✅ Org   | ❌        | ✅ Org    | ✅ Org    | ❌        | ❌        | Org-scoped operations             |
| Editor   | ✅ Org    | ✅ Org   | ✅ Org   | ❌        | ❌        | ❌        | ❌        | ❌        | Org-scoped create/edit           |
| Viewer   | ✅ Org    | ❌       | ❌       | ❌        | ❌        | ❌        | ❌        | ❌        | Org-scoped operations            |

### Partner Segment Key Points - NEEDS UPDATE
- **Partner Admin**: Can view all content (for reference), but can only modify (create/edit/approve/publish) their own org's content
- **Partner Approver**: Can create, edit, unpublish, approve, and publish their org's content
- **Partner Editor**: Can create, edit, and unpublish their org's content
- **Partner Viewer**: Read-only access (can view all content for reference)
- **None can archive or delete** (only internal admins can)


## Customer Segment Permissions - UPDATE

| Role     | View      | Create   | Edit     | Unpublish | Approve   | Publish   | Archive   | Delete    | Notes                              |
|----------|-----------|----------|----------|-----------|-----------|-----------|-----------|-----------|------------------------------------|
| Admin    | ✅ Org    | ✅ Org   | ✅ Org   | ✅ Org    | ✅ Org    | ✅ Org    | ❌        | ❌        | Org-scoped operations  |
| Approver | ✅ Org    | ✅ Org   | ✅ Org   | ❌        | ✅ Org    | ✅ Org    | ❌        | ❌        | Org-scoped operations             |
| Editor   | ✅ Org    | ✅ Org   | ✅ Org   | ❌        | ❌        | ❌        | ❌        | ❌        | Org-scoped create/edit           |
| Viewer   | ✅ Org    | ❌       | ❌       | ❌        | ❌        | ❌        | ❌        | ❌        | Org-scoped operations            |


## Progressive Hierarchy Summary - FINAL

```
Viewer:   [Read]
        ↓
Editor:   [Read, Create, Edit] for their org
        ↓
Approver: [Read, Create, Edit] + [Approve, Publish, Unpublish]
        ↓  
Admin:    [Read, Create, Edit, Approve, Publish, Unpublish] + [Archive, Delete]
```

## Implementation Status

✅ **Completed (Oct 28, 2025)**
- Updated `src/auth/ability.ts` with progressive role permissions
- Internal Editors: Org-scoped create/edit (data sanity)
- Internal Approvers: Can create for org only, but edit all content
- All editors cannot unpublish (only approvers can)
- All create operations org-scoped (except Internal Admin)
- Tests updated: 38/38 passing

## Code Changes

### src/auth/ability.ts

**Internal Editor:**
```typescript
can('create', [...], { organization_id: organizationId }); // Org-scoped
can('read', [...]);
can('update', [...], { organization_id: organizationId }); // Org-scoped
// No unpublish
```

**Internal Approver:**
```typescript
can('create', [...], { organization_id: organizationId }); // Org-scoped
can('read', [...]);
can('update', [...]); // ALL content
can('unpublish', 'Content');
can('approve', [...]);
can('publish', 'Content');
```

## Test Results

✅ 38/38 tests passing

---

## Progressive Hierarchy Summary (Previous Version)
