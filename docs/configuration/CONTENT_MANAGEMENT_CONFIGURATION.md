# Content Management Configuration

## Overview

Complete configuration guide for the Content Management feature, including database schema mapping, RBAC implementation, and UI integration.

## Database Schema

### Table: `cnt_contents`

**Key Columns:**
- `id` (uuid) - Primary key
- `title` (text) - Content title
- `content_type` (text) - Type of content (Article, Video, Event, etc.)
- `author_id` (uuid) - Foreign key to user
- `author_name` (text) - Display name of author
- `status` (text) - Current status (Draft, Published, Archived, Pending Review)
- `published_at` (timestamp) - Publication date
- `category` (text) - Content category
- `tags` (text[]) - Array of tags
- `engagement` (jsonb) - `{views, likes, comments}`
- `organization_id` (uuid) - Foreign key for organization scoping

## Frontend Data Mapping

### Database → TypeScript Interface

The `ContentManagementPage` component maps database columns to the TypeScript `Content` interface:

```typescript
mapContentFromDB(dbContent: any): Content {
  return {
    id: dbContent.id,
    title: dbContent.title || '',
    type: dbContent.content_type || 'Article',           // Maps content_type → type
    status: dbContent.status || 'Draft',                 // Direct mapping
    author: dbContent.author_name || 'Unknown',          // Maps author_name → author
    lastModified: dbContent.updated_at || dbContent.created_at || '',
    content: dbContent.content || '',
    category: dbContent.category || '',
    tags: dbContent.tags || [],
    featuredImage: dbContent.featured_image_url || dbContent.thumbnail_url || '',
    publishDate: dbContent.published_at || undefined,
    publishedOn: dbContent.published_at || dbContent.created_at || '',  // For backward compatibility
    engagement: dbContent.engagement || { 
      views: dbContent.view_count || 0, 
      likes: dbContent.like_count || 0, 
      comments: dbContent.comment_count || 0 
    }
  };
}
```

### Key Mappings

| Database Column | UI Field | Notes |
|----------------|----------|-------|
| `content_type` | `type` | Content type (Article, Video, Event, etc.) |
| `author_name` | `author` | Display name (fallback to 'Unknown') |
| `published_at` | `publishedOn` | Formatted date (fallback to `created_at`) |
| `published_at` | `publishDate` | Date object |
| `status` | `status` | Direct mapping |
| `engagement` | `engagement` | Merges with individual counts |

## RBAC Configuration

### Route Protection

```typescript
// AppRouter.tsx
<Route path="/content-management" element={
  <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
    <ContentSegmentGate>
      <ContentManagementRoute />
    </ContentSegmentGate>
  </ProtectedRoute>
} />
```

**Roles with Access:**
- ✅ Admin (full access)
- ✅ Approver (can create/edit/approve/publish)
- ✅ Editor (can create/edit)
- ✅ Viewer (read-only)
- ❌ Customer/Advisor segments blocked

### CASL Permissions

See `RBAC_PERMISSIONS_IMPLEMENTATION.md` for complete permission matrix.

Key permissions by role:
- **Admin (Internal)**: All actions on all content
- **Admin (Partner)**: All actions on org content only
- **Approver**: Create/edit/Approve/publish only
- **Editor**: Create/edit
- **Viewer**: Read-only

## Action Handlers

### Archive Handler

```typescript
const handleArchiveContent = async () => {
  // 1. Update status to 'Archived'
  await supabase.from('cnt_contents').update({ status: 'Archived' }).eq('id', contentId);
  
  // 2. Log activity
  await logContentActivity('archived', contentId, { previous_status });
  
  // 3. Show success message
  setToast({ type: 'success', message: 'Content archived successfully!' });
  
  // 4. Refresh list
  await list();
};
```

### Unpublish Handler

```typescript
const handleUnpublishContent = async () => {
  await supabase.from('cnt_contents').update({ status: 'Draft' }).eq('id', contentId);
  await logContentActivity('unpublished', contentId, { previous_status });
  setToast({ type: 'success', message: 'Content unpublished successfully!' });
  await list();
};
```

### Approve Handler

```typescript
const handleApproveContent = async () => {
  await supabase.from('cnt_contents').update({ 
    status: 'Published',
    published_at: new Date().toISOString()
  }).eq('id', contentId);
  
  await logContentActivity('approved', contentId, { previous_status, new_status: 'Published' });
  await logContentActivity('published', contentId, { published_at });
  
  setToast({ type: 'success', message: 'Content approved and published!' });
  await list();
};
```

## UI Components

### ContentDetailsDrawer Props

```typescript
interface ContentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
  onArchive?: () => void;        // NEW: Archive handler
  onUnpublish?: () => void;      // NEW: Unpublish handler
}
```

### Action Buttons (Conditional Rendering)

Buttons are only shown if handlers are provided:

```typescript
{isPublished && onUnpublish && (
  <button onClick={onUnpublish}>Unpublish</button>
)}

{isPublished && onArchive && (
  <button onClick={onArchive}>Archive</button>
)}
```

## Audit Logging

### Activity Log Structure

All actions are logged to `activity_logs` table:

```typescript
{
  entity_type: 'content',
  entity_id: contentId,
  action: 'archived',  // or 'approved', 'published', 'unpublish', etc.
  performed_by: userId,
  performed_by_name: userName,
  performed_by_role: userRole,
  organization_id: userOrgId,
  details: {
    previous_status: 'Published',
    // ... action-specific details
  }
}
```

### Logged Actions

- `created` - Content creation
- `updated` - Content modification
- `approved` - Approval action
- `published` - Publication
- `unpublished` - Unpublication
- `archived` - Archiving
- `rejected` - Rejection
- `sent_back` - Sent back for revisions

## Data Refresh Strategy

After any mutation operation (archive, unpublish, approve, reject, send back):

1. Update database record
2. Log activity to audit trail
3. Show success toast
4. Call `list()` to refresh data from database
5. Close drawer (for archive/unpublish)

## Common Issues and Solutions

### Issue 1: Status not updating after archive

**Problem:** Button works, success message shows, but table still shows old status  
**Solution:** Data mapping now properly maps `status` from database + refresh after action

### Issue 2: "Invalid Date" showing in Published On

**Problem:** Date parsing fails  
**Solution:** Added error handling in `formatDate()` to return 'N/A' for invalid dates

### Issue 3: Author field empty

**Problem:** Database has `author_name` but UI expects `author`  
**Solution:** Added mapping: `author: dbContent.author_name || 'Unknown'`

### Issue 4: Engagement data not showing

**Problem:** Database has separate columns vs JSON field  
**Solution:** Merges both: uses `engagement` JSON if present, otherwise constructs from `view_count`, `like_count`, `comment_count`

## Testing

### Test Scenarios

1. **Archive as Internal Admin:** Should archive any content
2. **Archive as Partner Editor:** Should only archive org content
3. **View as Partner Viewer:** Should see content but no action buttons
4. **Date Formatting:** Should handle null/invalid dates gracefully
5. **Author Display:** Should show author name or 'Unknown'
6. **Status Update:** Should refresh after any status change

## Files Modified

1. `src/components/ContentManagementPage.tsx`
   - Added `mapContentFromDB()` function
   - Enhanced `formatDate()` error handling
   - Added `handleArchiveContent()` and `handleUnpublishContent()`
   - Passed handlers to `ContentDetailsDrawer`

2. `src/components/ContentDetailsDrawer.tsx`
   - Added `onArchive` and `onUnpublish` props
   - Connected buttons to handlers

3. `src/AppRouter.tsx`
   - Added 'viewer' role to content-management route

4. `src/auth/ability.ts`
   - Implemented segment-aware permissions

5. `docs/RBAC_PERMISSIONS_IMPLEMENTATION.md`
   - Documented complete permission matrix

---

**Last Updated:** January 28, 2025  
**Status:** ✅ Fully configured and tested

