# Taxonomy Integration Guide - Content Management Only

**Migration:** `20251105100000_kh_taxonomy_integration.sql`  
**Status:** ✅ Adds full taxonomy support to cnt_contents (Content Management Only)  
**Date:** November 5, 2025

---

## Overview

This migration integrates the full KnowledgeHub taxonomy system into the **`cnt_contents` table only** (content management). Taxonomies are managed separately in the taxonomy manager page for all entities, and this integration adds the ability to assign taxonomies specifically to content items via a junction table.

**Scope:** This integration is **content-specific**. Other entities (services, businesses, etc.) are unaffected and may have their own taxonomy integration in the future.

---

## Key Features (Content Management Only)

### ✅ Full Taxonomy Support for Content
- **Junction Table:** `cnt_contents_taxonomies` links **content items** to taxonomies
- **Multiple Taxonomy Kinds:** Domain, Stage, Format, Tag, Popularity (shared across all entities)
- **Backward Compatible:** Still supports `category` column as fallback
- **Taxonomy Manager Integration:** Taxonomies are managed independently for all entities
- **Content-Specific:** This integration only affects `cnt_contents` table

### ✅ Helper Functions
- `get_content_domain()` - Get primary domain taxonomy (with fallback to category column)
- `get_content_taxonomies()` - Get all taxonomies for content (grouped by kind)
- `set_content_taxonomies()` - Assign/update taxonomies for content

### ✅ Updated RPCs
- `create_media_item()` - Now accepts optional `_taxonomy_ids` parameter
- `update_media_item()` - Now accepts optional `_taxonomy_ids` parameter
- Maintains backward compatibility (works without taxonomy_ids)

### ✅ Updated Views
- `v_media_all` - Now derives `domain` from taxonomies first, falls back to `category` column

---

## Schema Structure

### Junction Table
```sql
cnt_contents_taxonomies (
  content_id uuid → cnt_contents.id,
  taxonomy_id uuid → taxonomies.id,
  PRIMARY KEY (content_id, taxonomy_id)
)
```

### Taxonomy Table (Existing)
```sql
taxonomies (
  id uuid,
  kind text,           -- 'Domain', 'Stage', 'Format', 'Tag', 'Popularity'
  label text,
  key text,
  description text,
  archived boolean,
  position int,
  allowed_media_types jsonb
)
```

---

## Usage Patterns

### Creating Content with Taxonomies

```sql
-- Create content and assign taxonomies
SELECT create_media_item(
  '{"title": "My Article", "status": "Draft", ...}'::jsonb,
  'Article',
  '{"body_html": "<p>Content</p>", ...}'::jsonb,
  ARRAY['uuid-of-domain-taxonomy', 'uuid-of-stage-taxonomy']::uuid[]  -- taxonomy IDs
);
```

### Updating Content Taxonomies

```sql
-- Update content and change taxonomies
SELECT update_media_item(
  'content-uuid'::uuid,
  '{"title": "Updated Title", ...}'::jsonb,
  'Article',
  '{"body_html": "...", ...}'::jsonb,
  ARRAY['new-taxonomy-uuid']::uuid[]  -- Replace all taxonomies
);
```

### Querying Content by Taxonomy

```sql
-- Get content with specific domain taxonomy
SELECT c.* FROM cnt_contents c
JOIN cnt_contents_taxonomies ct ON ct.content_id = c.id
JOIN taxonomies t ON t.id = ct.taxonomy_id
WHERE t.kind = 'Domain' AND t.label = 'Business';

-- Get all taxonomies for a content item
SELECT * FROM get_content_taxonomies('content-uuid'::uuid);
```

### Getting Domain (with Fallback)

```sql
-- Get domain (from taxonomy or category column)
SELECT get_content_domain('content-uuid'::uuid);
```

---

## Frontend Integration

### Service Layer Updates

```typescript
// src/services/knowledgehub.ts

export interface CreateMediaOptions {
  base: Record<string, any>;
  type: KHMediaType;
  child: Record<string, any>;
  taxonomyIds?: string[];  // Optional taxonomy IDs
}

export async function createMedia(
  base: Record<string, any>,
  type: KHMediaType,
  child: Record<string, any>,
  taxonomyIds?: string[]
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');
  
  const { data, error } = await supabase.rpc('create_media_item', {
    _base: base,
    _type: type,
    _child: child,
    _taxonomy_ids: taxonomyIds || null
  });
  
  if (error) throw error;
  return data as string;
}
```

### Taxonomy Assignment in Forms

```typescript
// In MediaContentForm.tsx or similar

// Load available taxonomies
const { data: taxonomies } = await supabase
  .from('taxonomies')
  .select('*')
  .eq('archived', false)
  .order('kind', { ascending: true })
  .order('position', { ascending: true });

// Group by kind
const taxonomiesByKind = taxonomies.reduce((acc, t) => {
  if (!acc[t.kind]) acc[t.kind] = [];
  acc[t.kind].push(t);
  return acc;
}, {});

// On submit, collect selected taxonomy IDs
const selectedTaxonomyIds = [
  ...selectedDomainTaxonomies,
  ...selectedStageTaxonomies,
  ...selectedFormatTaxonomies
];

// Create content with taxonomies
const id = await createMedia(base, type, child, selectedTaxonomyIds);
```

### Querying Content with Taxonomies

```typescript
// Get taxonomies for a content item
const { data: taxonomies } = await supabase
  .rpc('get_content_taxonomies', { _content_id: contentId });

// Filter content by taxonomy
const { data: content } = await supabase
  .from('cnt_contents')
  .select(`
    *,
    cnt_contents_taxonomies!inner(
      taxonomy:taxonomies!inner(*)
    )
  `)
  .eq('cnt_contents_taxonomies.taxonomy.kind', 'Domain')
  .eq('cnt_contents_taxonomies.taxonomy.label', 'Business');
```

---

## Taxonomy Manager Integration

### Managing Taxonomies Separately (All Entities)

The taxonomy manager page continues to work independently for **all entities** (content, services, businesses, etc.):

```typescript
// CRUD operations on taxonomies (unchanged)
const { data: taxonomies } = await supabase
  .from('taxonomies')
  .select('*')
  .eq('kind', 'Domain');

// Create taxonomy
await supabase.from('taxonomies').insert({
  kind: 'Domain',
  label: 'New Domain',
  key: 'new-domain',
  position: 0
});

// Update taxonomy
await supabase.from('taxonomies')
  .update({ label: 'Updated Domain' })
  .eq('id', taxonomyId);

// Archive taxonomy (doesn't delete, just hides)
await supabase.from('taxonomies')
  .update({ archived: true })
  .eq('id', taxonomyId);
```

### Assigning Taxonomies to Content

```typescript
// Assign taxonomies to content (from taxonomy manager or content form)
await supabase.rpc('set_content_taxonomies', {
  _content_id: contentId,
  _taxonomy_ids: ['uuid1', 'uuid2', 'uuid3']
});

// Or use direct insert
await supabase.from('cnt_contents_taxonomies').insert([
  { content_id: contentId, taxonomy_id: taxonomyId1 },
  { content_id: contentId, taxonomy_id: taxonomyId2 }
]);
```

---

## Backward Compatibility

### Category Column Still Works

The `category` column is still supported as a fallback:

1. **View Behavior:** `v_media_all.domain` uses taxonomy first, then falls back to `category` column
2. **RPC Functions:** Still accept `domain` in `_base` jsonb, which sets the `category` column
3. **Migration Path:** Existing content with `category` values will continue to work

### Migration Strategy

For existing content:
```sql
-- Option 1: Migrate category values to taxonomies
-- Find or create taxonomy for each unique category value
INSERT INTO taxonomies (kind, label, key, position)
SELECT DISTINCT 'Domain', category, lower(replace(category, ' ', '-')), 0
FROM cnt_contents
WHERE category IS NOT NULL
ON CONFLICT (kind, key) DO NOTHING;

-- Link content to taxonomies
INSERT INTO cnt_contents_taxonomies (content_id, taxonomy_id)
SELECT c.id, t.id
FROM cnt_contents c
JOIN taxonomies t ON t.kind = 'Domain' AND t.label = c.category
WHERE c.category IS NOT NULL
ON CONFLICT DO NOTHING;

-- Option 2: Keep both (category as fallback, taxonomies as primary)
-- No migration needed - system handles both automatically
```

---

## Filtering by Taxonomy

### Using Views

```sql
-- Filter by domain taxonomy (via view)
SELECT * FROM v_media_all
WHERE domain = 'Business';  -- Uses taxonomy or category fallback
```

### Using Junction Table

```sql
-- Filter by specific taxonomy
SELECT c.* FROM cnt_contents c
JOIN cnt_contents_taxonomies ct ON ct.content_id = c.id
WHERE ct.taxonomy_id = 'taxonomy-uuid';

-- Filter by taxonomy kind
SELECT c.* FROM cnt_contents c
JOIN cnt_contents_taxonomies ct ON ct.content_id = c.id
JOIN taxonomies t ON t.id = ct.taxonomy_id
WHERE t.kind = 'Stage' AND t.label = 'Growth';

-- Filter by multiple taxonomy kinds
SELECT DISTINCT c.* FROM cnt_contents c
JOIN cnt_contents_taxonomies ct ON ct.content_id = c.id
JOIN taxonomies t ON t.id = ct.taxonomy_id
WHERE t.kind IN ('Domain', 'Stage')
  AND t.label IN ('Business', 'Growth');
```

### Using Helper Functions

```sql
-- Get all content with a specific domain
SELECT c.* FROM cnt_contents c
WHERE get_content_domain(c.id) = 'Business';
```

---

## Best Practices

### 1. Taxonomy Management
- ✅ Manage taxonomies in dedicated taxonomy manager page
- ✅ Use `archived` flag instead of deleting taxonomies
- ✅ Use `position` to control display order
- ✅ Use `allowed_media_types` to restrict taxonomy assignment

### 2. Content Creation
- ✅ Prefer taxonomy IDs over category strings
- ✅ Use `set_content_taxonomies()` for bulk updates
- ✅ Keep `category` column as fallback for legacy data

### 3. Filtering
- ✅ Use junction table for precise taxonomy filtering
- ✅ Use `v_media_all.domain` for simple domain filtering
- ✅ Index frequently queried taxonomy combinations

### 4. Performance
- ✅ Indexes are created on junction table
- ✅ Use `get_content_taxonomies()` for efficient taxonomy retrieval
- ✅ Consider materialized views for complex taxonomy queries

---

## Migration Checklist

- [x] Junction table created
- [x] Helper functions created
- [x] RPC functions updated (backward compatible)
- [x] Views updated
- [x] RLS policies added
- [x] Grants configured
- [ ] Frontend service layer updated
- [ ] Content forms updated to use taxonomy selection
- [ ] Taxonomy manager integration tested
- [ ] Existing content migrated (optional)

---

---

## Scope Reminder

**This integration is content management only:**
- ✅ Junction table: `cnt_contents_taxonomies` (content-specific)
- ✅ Functions: `get_content_taxonomies()`, `set_content_taxonomies()` (content-specific)
- ✅ Affects: Only `cnt_contents` table
- ❌ Does NOT affect: Services, businesses, or other entities
- ❌ Does NOT create: Junction tables for other entities

**Taxonomy Manager:** Manages taxonomies for all entities. This integration only adds content linking capability.

---

**Last Updated:** November 5, 2025  
**Maintained By:** Development Team

