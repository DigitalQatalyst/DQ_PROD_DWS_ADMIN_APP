# Taxonomy Integration Summary - For Taxonomy Manager Developer

**Content Management Taxonomy Integration Only**

---

## Overview

This integration is **specifically for content management** (`cnt_contents` table). Taxonomies can now be assigned to content items. The taxonomy manager page continues to work independently for all entities—this only adds content-specific linking capability.

---

## What Changed (Content Management Only)

### New Junction Table
- **Table:** `cnt_contents_taxonomies` (content_id, taxonomy_id)
- **Purpose:** Links **content items** (`cnt_contents`) to taxonomies
- **Scope:** This is **only for content management** - other entities (services, businesses, etc.) are not affected
- **Relationship:** Many-to-many (one content can have multiple taxonomies, one taxonomy can be on multiple content)

### Updated Functions
- `set_content_taxonomies(content_id, taxonomy_ids[])` - Assign/update taxonomies for content
- `get_content_taxonomies(content_id)` - Get all taxonomies for a content item
- `get_content_domain(content_id)` - Get primary domain taxonomy (with category fallback)

---

## Taxonomy Manager Integration

### ✅ What Stays the Same
- **Taxonomy CRUD:** Create, edit, archive taxonomies exactly as before (for ALL entities)
- **Taxonomy Table:** `taxonomies` table structure unchanged
- **No Breaking Changes:** All existing taxonomy manager code continues to work
- **Other Entities:** Services, businesses, and other entities are unaffected by this integration

### ✅ What's New (Content Management Only)
- **Content Assignment:** Taxonomies can now be assigned to **content items only** (`cnt_contents`)
- **Content Filtering:** **Content** can be filtered by taxonomy
- **View Integration:** `v_media_all` view (content view) automatically shows domain from taxonomies
- **Note:** Other entities may have their own taxonomy integration in the future

---

## How Content Forms Use Taxonomies

### Content Creation Flow (Content Management Only)
1. Taxonomy Manager creates/edits taxonomies (unchanged, works for all entities)
2. **Content Form** queries `taxonomies` table to show options
3. User selects taxonomies (Domain, Stage, Format, etc.) for **content item**
4. **Content Form** calls `create_media_item()` with `taxonomy_ids` parameter
5. System automatically creates junction table records in `cnt_contents_taxonomies`

### Example Code (Content Form Side)
```typescript
// Load taxonomies from your taxonomy manager
const { data: taxonomies } = await supabase
  .from('taxonomies')
  .select('*')
  .eq('archived', false);

// User selects taxonomies in form
const selectedTaxonomyIds = ['uuid1', 'uuid2', 'uuid3'];

// Create content with taxonomies
await supabase.rpc('create_media_item', {
  _base: {...},
  _type: 'Article',
  _child: {...},
  _taxonomy_ids: selectedTaxonomyIds  // Optional parameter
});
```

---

## Taxonomy Manager Considerations

### ✅ No Changes Required
- Taxonomy CRUD operations work exactly as before
- Taxonomy table structure unchanged
- All existing queries and forms continue to work

### 💡 Optional Enhancements
- **Show Usage Count:** Query `cnt_contents_taxonomies` to show how many content items use each taxonomy
- **Bulk Assignment:** Create UI to assign taxonomies to multiple content items at once
- **Taxonomy Validation:** Ensure taxonomies aren't deleted if they're assigned to content (use `archived` flag instead)

---

## Key Points

1. **Taxonomy Manager is Independent:** Manage taxonomies separately for all entities; this integration only affects content assignment
2. **Content Management Only:** This integration is **specifically for `cnt_contents` table** - other entities are unaffected
3. **Backward Compatible:** Existing taxonomy manager code requires no changes
4. **Optional Integration:** Content forms can use taxonomies if desired, but it's optional
5. **Junction Table:** The link between **content** and taxonomies is in `cnt_contents_taxonomies` (content-specific)
6. **Multi-Entity Support:** The same taxonomies can be used for content, services, businesses, etc. - this just adds content linking

---

## Quick Reference (Content Management Only)

**Query taxonomies assigned to a content item:**
```sql
SELECT t.* FROM taxonomies t
JOIN cnt_contents_taxonomies ct ON ct.taxonomy_id = t.id
WHERE ct.content_id = 'content-uuid';
```

**Count content items per taxonomy (content usage only):**
```sql
SELECT t.id, t.label, COUNT(ct.content_id) as content_usage_count
FROM taxonomies t
LEFT JOIN cnt_contents_taxonomies ct ON ct.taxonomy_id = t.id
WHERE t.archived = false
GROUP BY t.id, t.label;
-- Note: This only shows content usage, not usage by other entities
```

**Assign taxonomies to a content item:**
```sql
SELECT set_content_taxonomies('content-uuid', ARRAY['taxonomy-uuid1', 'taxonomy-uuid2']);
```

**Note:** These functions are **content-specific**. Other entities (services, businesses) may have their own taxonomy integration tables in the future.

---

---

## Scope Clarification

**This integration is ONLY for content management:**
- ✅ Affects: `cnt_contents` table
- ✅ Junction table: `cnt_contents_taxonomies` (content-specific)
- ✅ Functions: `get_content_taxonomies()`, `set_content_taxonomies()` (content-specific)
- ❌ Does NOT affect: Services, businesses, or other entities
- ❌ Does NOT create: Junction tables for other entities

**Taxonomy Manager:**
- Manages taxonomies for **all entities** (unchanged)
- This integration only adds the ability to link taxonomies to **content items**

---

**Migration:** `20251105100000_kh_taxonomy_integration.sql`  
**Full Docs:** `docs/database/TAXONOMY_INTEGRATION_GUIDE.md`

