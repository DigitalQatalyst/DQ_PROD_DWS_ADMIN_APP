# Content Taxonomy Integration with txn_* Schema

**Migration:** `20251105110000_content_txn_integration.sql`  
**Status:** ✅ Integrates content management with new taxonomy manager (txn_* tables)  
**Date:** November 5, 2025

---

## Overview

This migration integrates content management (`cnt_contents` table) with the new taxonomy manager schema (`txn_*` tables). It replaces the old `taxonomies`-based approach with the new facet-based system.

**Key Features:**
- ✅ Uses new `txn_facets` and `txn_facet_values` for structured taxonomy
- ✅ Supports `txn_tags` for general-purpose tagging
- ✅ Supports `txn_collections` for hierarchical content organization
- ✅ Multi-language support via translation tables
- ✅ Backward compatible with `category` column

---

## Schema Mapping

### Old Schema (taxonomies) → New Schema (txn_*)

| Old Concept | New Schema | Purpose |
|------------|-----------|---------|
| `taxonomies` (kind, label) | `txn_facets` + `txn_facet_values` | Structured taxonomy categories |
| `taxonomies.kind = 'Domain'` | `txn_facets.code = 'Domain'` | Facet categorization |
| `taxonomies.label` | `txn_facet_value_translations.name` | Multi-language labels |
| N/A | `txn_tags` | General-purpose tags |
| N/A | `txn_collections` | Hierarchical collections |

---

## Junction Tables

### 1. `cnt_contents_facet_values`
Links content to specific facet values (the new taxonomy system).

**Structure:**
- `content_id` → `cnt_contents.id`
- `facet_value_id` → `txn_facet_values.id`
- `created_at`, `created_by` (audit fields)

**Usage:**
- Assign structured taxonomy values to content
- Supports multiple facets per content (Domain, Stage, Format, etc.)
- Multi-language support via `txn_facet_value_translations`

### 2. `cnt_contents_tags`
Links content to general-purpose tags.

**Structure:**
- `content_id` → `cnt_contents.id`
- `tag_id` → `txn_tags.id`
- `created_at`, `created_by` (audit fields)

**Usage:**
- Assign free-form tags to content
- Simpler than facets (no hierarchy/categories)

### 3. `cnt_contents_collections`
Links content to hierarchical collections.

**Structure:**
- `content_id` → `cnt_contents.id`
- `collection_id` → `txn_collections.id`
- `created_at`, `created_by` (audit fields)

**Usage:**
- Organize content into collections (folders/categories)
- Supports nested hierarchies
- Can have dynamic filtering rules

---

## Helper Functions

### Content Taxonomy Queries

#### `get_content_domain_facet(content_id, language_code)`
Get primary domain facet value for content (with category fallback).

```sql
SELECT get_content_domain_facet('content-uuid'::uuid, 'en');
-- Returns: Domain facet value name or category column value
```

#### `get_content_facet_values(content_id, language_code)`
Get all facet values assigned to content, grouped by facet.

```sql
SELECT * FROM get_content_facet_values('content-uuid'::uuid, 'en');
-- Returns: facet_code, facet_name, facet_value_id, facet_value_code, facet_value_name
```

#### `get_content_tags(content_id)`
Get all tags assigned to content.

```sql
SELECT * FROM get_content_tags('content-uuid'::uuid);
-- Returns: tag_id, tag_value
```

#### `get_content_collections(content_id, language_code)`
Get all collections containing the content (with full path).

```sql
SELECT * FROM get_content_collections('content-uuid'::uuid, 'en');
-- Returns: collection_id, collection_name, collection_slug, collection_path (array)
```

### Content Taxonomy Updates

#### `set_content_facet_values(content_id, facet_value_ids[], user_id)`
Assign/update facet values for content.

```sql
SELECT set_content_facet_values(
  'content-uuid'::uuid,
  ARRAY['facet-value-uuid1', 'facet-value-uuid2']::uuid[],
  'user-uuid'::uuid
);
```

#### `set_content_tags(content_id, tag_ids[], user_id)`
Assign/update tags for content.

```sql
SELECT set_content_tags(
  'content-uuid'::uuid,
  ARRAY['tag-uuid1', 'tag-uuid2']::uuid[],
  'user-uuid'::uuid
);
```

#### `set_content_collections(content_id, collection_ids[], user_id)`
Assign/update collections for content.

```sql
SELECT set_content_collections(
  'content-uuid'::uuid,
  ARRAY['collection-uuid1']::uuid[],
  'user-uuid'::uuid
);
```

---

## RPC Functions

### Updated `create_media_item()`

**New Signature:**
```sql
create_media_item(
  _base jsonb,
  _type text,
  _child jsonb,
  _facet_value_ids uuid[] DEFAULT NULL,  -- New: facet values
  _tag_ids uuid[] DEFAULT NULL,           -- New: tags
  _collection_ids uuid[] DEFAULT NULL,    -- New: collections
  _user_id uuid DEFAULT NULL              -- New: audit
)
```

**Example:**
```sql
SELECT create_media_item(
  '{"title": "My Article", "status": "Draft"}'::jsonb,
  'Article',
  '{"body_html": "<p>Content</p>"}'::jsonb,
  ARRAY['domain-uuid', 'stage-uuid']::uuid[],  -- Facet values
  ARRAY['tag-uuid1', 'tag-uuid2']::uuid[],     -- Tags
  ARRAY['collection-uuid']::uuid[],             -- Collections
  'user-uuid'::uuid
);
```

### Updated `update_media_item()`

**New Signature:**
```sql
update_media_item(
  _id uuid,
  _base jsonb,
  _type text,
  _child jsonb,
  _facet_value_ids uuid[] DEFAULT NULL,  -- New: facet values
  _tag_ids uuid[] DEFAULT NULL,           -- New: tags
  _collection_ids uuid[] DEFAULT NULL,    -- New: collections
  _user_id uuid DEFAULT NULL              -- New: audit
)
```

**Backward Compatibility:**
- All new parameters are optional (DEFAULT NULL)
- Works without facet values, tags, or collections
- Existing code continues to work

---

## View Updates

### `v_media_all` - Domain Field

The `domain` field now uses facet values first, then falls back to `category` column:

```sql
-- Domain resolution priority:
1. Facet value where facet.code = 'Domain' (with translation)
2. category column (backward compatibility)
3. NULL
```

---

## Frontend Integration

### Loading Facets for Content Form

```typescript
// Load facets and their values
const { data: facets } = await supabase
  .from('txn_facets')
  .select(`
    *,
    txn_facet_translations!inner(name, language_code),
    txn_facet_values(
      *,
      txn_facet_value_translations!inner(name, language_code)
    )
  `)
  .eq('is_private', false)
  .eq('txn_facet_translations.language_code', 'en')
  .order('code');

// Load tags
const { data: tags } = await supabase
  .from('txn_tags')
  .select('*')
  .order('value');

// Load collections
const { data: collections } = await supabase
  .from('txn_collections')
  .select(`
    *,
    txn_collection_translations!inner(name, slug, language_code)
  `)
  .eq('is_private', false)
  .eq('txn_collection_translations.language_code', 'en')
  .order('position');
```

### Creating Content with Facets

```typescript
import { createMedia } from '../services/knowledgehub';

const contentId = await createMedia(
  {
    title: 'My Article',
    status: 'Draft',
    // ... other fields
  },
  'Article',
  {
    body_html: '<p>Content</p>',
    // ... other fields
  },
  {
    facetValueIds: ['domain-uuid', 'stage-uuid'],
    tagIds: ['tag-uuid1', 'tag-uuid2'],
    collectionIds: ['collection-uuid'],
    userId: currentUser.id
  }
);
```

### Querying Content by Facet

```sql
-- Get content with specific domain facet value
SELECT c.* FROM cnt_contents c
JOIN cnt_contents_facet_values ccfv ON ccfv.content_id = c.id
JOIN txn_facet_values fv ON fv.id = ccfv.facet_value_id
JOIN txn_facets f ON f.id = fv.facet_id
JOIN txn_facet_value_translations fvt ON fvt.base_id = fv.id
WHERE f.code = 'Domain'
  AND fvt.name = 'Business'
  AND fvt.language_code = 'en';

-- Get content in a collection
SELECT c.* FROM cnt_contents c
JOIN cnt_contents_collections ccc ON ccc.content_id = c.id
WHERE ccc.collection_id = 'collection-uuid';
```

---

## Migration from Old Schema

If you have existing content using the old `taxonomies` table:

### Option 1: Migrate to Facets

```sql
-- 1. Create facets from old taxonomies
INSERT INTO txn_facets (code, is_private, created_by)
SELECT DISTINCT 
  lower(kind) AS code,
  false AS is_private,
  'system'::uuid AS created_by
FROM taxonomies
ON CONFLICT (code) DO NOTHING;

-- 2. Create facet values from old taxonomies
INSERT INTO txn_facet_values (code, facet_id, created_by)
SELECT 
  lower(key) AS code,
  f.id AS facet_id,
  'system'::uuid AS created_by
FROM taxonomies t
JOIN txn_facets f ON f.code = lower(t.kind)
ON CONFLICT (code) DO NOTHING;

-- 3. Create translations
INSERT INTO txn_facet_value_translations (language_code, name, base_id, created_by)
SELECT 
  'en' AS language_code,
  t.label AS name,
  fv.id AS base_id,
  'system'::uuid AS created_by
FROM taxonomies t
JOIN txn_facets f ON f.code = lower(t.kind)
JOIN txn_facet_values fv ON fv.facet_id = f.id AND fv.code = lower(t.key);

-- 4. Migrate content assignments
INSERT INTO cnt_contents_facet_values (content_id, facet_value_id, created_by)
SELECT DISTINCT
  ct.content_id,
  fv.id AS facet_value_id,
  'system'::uuid AS created_by
FROM cnt_contents_taxonomies ct
JOIN taxonomies t ON t.id = ct.taxonomy_id
JOIN txn_facets f ON f.code = lower(t.kind)
JOIN txn_facet_values fv ON fv.facet_id = f.id AND fv.code = lower(t.key)
ON CONFLICT DO NOTHING;
```

### Option 2: Keep Both (Dual Support)

Keep both systems running in parallel:
- Old content uses `category` column
- New content uses facet values
- View handles both automatically

---

## Key Differences from Old Schema

### Old Schema (`taxonomies`)
- Simple: `kind` + `label` structure
- Flat taxonomy (no hierarchy)
- Limited to 5 kinds: Domain, Stage, Format, Tag, Popularity

### New Schema (`txn_*`)
- **Facets:** Structured categories (e.g., "Domain", "Stage")
- **Facet Values:** Individual values within facets (e.g., "Business", "Technology" for Domain)
- **Tags:** General-purpose free-form tags
- **Collections:** Hierarchical organization (folders)
- **Multi-language:** Full i18n support via translation tables
- **Flexible:** Unlimited facets and values

---

## Best Practices

### 1. Facet Usage
- Use facets for structured taxonomy (Domain, Stage, Format, etc.)
- Facet codes should be machine-readable (e.g., "domain", "business-stage")
- Use translations for human-readable names

### 2. Tag Usage
- Use tags for free-form, non-structured categorization
- Tags are simpler - no hierarchy or categories
- Good for user-generated tags

### 3. Collection Usage
- Use collections for hierarchical organization
- Supports nested structures (folders)
- Can have dynamic filtering rules

### 4. Language Support
- Always specify `language_code` when querying
- Default to 'en' if not specified
- Translations cascade properly

---

## Scope Clarification

**This integration is content management only:**
- ✅ Junction tables: `cnt_contents_facet_values`, `cnt_contents_tags`, `cnt_contents_collections`
- ✅ Functions: All prefixed with `get_content_*` or `set_content_*`
- ✅ Affects: Only `cnt_contents` table
- ❌ Does NOT affect: Services, businesses, or other entities

**Taxonomy Manager:**
- Manages facets, tags, and collections for **all entities**
- This integration only adds content linking capability

---

**Last Updated:** November 5, 2025  
**Maintained By:** Development Team

