# KnowledgeHub + cnt_contents Schema Integration

**Migration:** `20251105091500_kh_blend_into_cnt.sql`  
**Status:** ✅ Active - KnowledgeHub semantics layered on existing `cnt_contents` table  
**Date:** November 5, 2025

---

## Overview

This migration **does not create new tables**. Instead, it adds a **semantic compatibility layer** that allows KnowledgeHub API patterns to work seamlessly with the existing `cnt_contents` table structure. The migration provides:

1. **Helper functions** for slug normalization and data extraction
2. **RPC functions** (`create_media_item`, `update_media_item`) that map KnowledgeHub terminology to `cnt_contents` columns
3. **Views** (`v_media_all`, `v_media_public`, `v_media_public_grid`) that expose `cnt_contents` data in KnowledgeHub format
4. **Automatic slug normalization** via database triggers

---

## Architecture: Single Table, Dual Interface

### Base Table
- **Table:** `public.cnt_contents` (unchanged)
- **Purpose:** Single source of truth for all content/media items
- **Columns Used:** All existing columns + `metadata` jsonb for type-specific data

### Compatibility Layer
- **RPCs:** KnowledgeHub-style create/update functions
- **Views:** KnowledgeHub-style read interface
- **Triggers:** Automatic slug normalization

---

## Field Mapping: KnowledgeHub → cnt_contents

### Core Fields (Direct Mapping)

| KnowledgeHub Field | cnt_contents Column | Notes |
|-------------------|---------------------|-------|
| `id` | `id` | UUID, auto-generated |
| `slug` | `slug` | Auto-normalized via trigger |
| `title` | `title` | Required |
| `summary` | `summary` | |
| `status` | `status` | Draft, InReview, Scheduled, Published, Archived |
| `visibility` | *(not stored)* | Always "Public" in view |
| `language` | *(not stored)* | Always "en" in view |
| `published_at` | `published_at` | timestamptz |
| `created_at` | `created_at` | timestamptz |
| `updated_at` | `updated_at` | timestamptz |
| `thumbnail_url` | `thumbnail_url` | Also mapped to `featured_image_url` |
| `tags` | `tags` | text[] array |
| `domain` | `category` | KnowledgeHub uses "domain", cnt uses "category" |
| `type` | `content_type` | Article, Video, Podcast, Report, Tool, Event |

### Type-Specific Fields (Stored in `metadata` jsonb or mapped columns)

#### Article/News/Guide
- `body_html` → `cnt_contents.content` (text)
- `body_json` → `cnt_contents.metadata->'body_json'` (jsonb)
- `byline` → `cnt_contents.metadata->>'byline'` (text)
- `source` → `cnt_contents.metadata->>'source'` (text)

#### Video
- `video_url` → `cnt_contents.content_url` (text)
- `duration_sec` → `cnt_contents.duration` (text, stored as "mm:ss" or "hh:mm:ss")
- `platform` → `cnt_contents.metadata->>'platform'` (text)
- `transcript_url` → `cnt_contents.metadata->>'transcript_url'` (text)

#### Podcast
- `audio_url` → `cnt_contents.content_url` (text)
- `is_video_episode` → `cnt_contents.metadata->>'is_video_episode'` (boolean)
- `episode_no` → `cnt_contents.metadata->>'episode_no'` (integer)
- `transcript_url` → `cnt_contents.metadata->>'transcript_url'` (text)

#### Report
- `document_url` → `cnt_contents.content_url` (text)
- `pages` → `cnt_contents.metadata->>'pages'` (integer)
- `file_size_mb` → `cnt_contents.metadata->>'file_size_mb'` (numeric)
- `highlights` → `cnt_contents.metadata->'highlights'` (jsonb)
- `toc` → `cnt_contents.metadata->'toc'` (jsonb)

#### Tool/Toolkit
- `document_url` → `cnt_contents.content_url` (text)
- `requirements` → `cnt_contents.metadata->>'requirements'` (text)
- `file_size_mb` → `cnt_contents.metadata->>'file_size_mb'` (numeric)

#### Event
- All event fields → `cnt_contents.metadata` (jsonb)
  - `start_at`, `end_at` (timestamptz)
  - `venue`, `registration_url`, `timezone`, `mode` (text)
  - `agenda` (jsonb)

---

## Functions & RPCs

### Helper Functions

#### `normalize_slug(input text)`
- **Purpose:** Normalizes slugs to URL-safe format
- **Behavior:** Converts to lowercase, replaces non-alphanumeric with hyphens, trims hyphens
- **Example:** `"My Article Title!"` → `"my-article-title"`

#### `enforce_slug_normalization()`
- **Purpose:** Trigger function that auto-normalizes slugs on insert/update
- **Trigger:** `trg_cnt_contents_slug_normalize` on `cnt_contents`
- **When:** Before INSERT or UPDATE of `slug` or `title`
- **Behavior:** If slug is NULL/empty, generates from title; otherwise normalizes existing slug

#### `_jtxt(jsonb, text)`
- **Purpose:** Extract text value from jsonb, returning empty string for NULL
- **Usage:** Helper for RPC functions

#### `_is_authenticated()` / `_is_public_published(uuid)`
- **Purpose:** Auth and visibility helpers (for future use)

### RPC Functions

#### `create_media_item(_base jsonb, _type text, _child jsonb) → uuid`
- **Purpose:** Create new media item using KnowledgeHub API pattern
- **Parameters:**
  - `_base`: Core fields (title, slug, summary, status, thumbnail_url, domain, tags, published_at)
  - `_type`: Content type (Article, Video, Podcast, Report, Tool, Event)
  - `_child`: Type-specific fields (body_html, video_url, audio_url, etc.)
- **Returns:** UUID of created record
- **Behavior:** 
  - Maps KnowledgeHub fields to `cnt_contents` columns
  - Stores type-specific data in appropriate columns or `metadata` jsonb
  - Auto-normalizes slug via trigger

#### `update_media_item(_id uuid, _base jsonb, _type text, _child jsonb) → uuid`
- **Purpose:** Update existing media item using KnowledgeHub API pattern
- **Parameters:** Same as `create_media_item`
- **Returns:** UUID of updated record
- **Behavior:** Uses `COALESCE` to preserve existing values when new values are NULL

---

## Views

### `v_media_all`
- **Purpose:** Complete KnowledgeHub-compatible view of all content
- **Source:** `cnt_contents` table
- **Fields:** All KnowledgeHub fields, including type-specific columns
- **Type Mapping:** 
  - Article → `article_body_html`, `article_body_json`, `article_byline`, `article_source`
  - Video → `video_url`, `platform`, `video_duration_sec`, `video_transcript_url`
  - Podcast → `audio_url`, `is_video_episode`, `episode_no`, `audio_transcript_url`
  - Report → `report_document_url`, `report_pages`, `report_file_size_mb`, `report_highlights`, `report_toc`
  - Tool → `tool_document_url`, `tool_requirements`, `tool_file_size_mb`
  - Event → `start_at`, `end_at`, `venue`, `registration_url`, `timezone`, `event_mode`, `event_agenda`
- **Derived Fields:**
  - `visibility`: Always "Public"
  - `language`: Always "en"
  - `domain`: Mapped from `category`
  - `type`: Mapped from `content_type`

### `v_media_public`
- **Purpose:** Filtered view of published content
- **Source:** `v_media_all`
- **Filter:** `status = 'Published' AND (published_at IS NULL OR published_at <= now())`

### `v_media_public_grid`
- **Purpose:** Simplified grid view for public-facing displays
- **Source:** `v_media_public`
- **Fields:** `id`, `title`, `summary`, `thumbnail`, `type`, `tags`, `published_at`, `start_at`, `registration_url`, `document_url`
- **Summary:** Auto-generated from `body_html` if `summary` is empty (first 240 chars, HTML stripped)

---

## Usage Patterns

### Creating Content (KnowledgeHub API)

```sql
-- Create an Article
SELECT create_media_item(
  '{"title": "My Article", "slug": "my-article", "summary": "Summary", "status": "Draft", "thumbnail_url": "https://...", "domain": "Business", "tags": ["Launch"]}'::jsonb,
  'Article',
  '{"body_html": "<p>Content</p>", "body_json": {...}, "byline": "John Doe", "source": "Company"}'::jsonb
);

-- Create a Video
SELECT create_media_item(
  '{"title": "My Video", "status": "Draft", "thumbnail_url": "https://..."}'::jsonb,
  'Video',
  '{"video_url": "https://youtube.com/...", "duration_sec": 300, "platform": "youtube"}'::jsonb
);
```

### Reading Content (KnowledgeHub API)

```sql
-- Get all media (KnowledgeHub format)
SELECT * FROM v_media_all ORDER BY created_at DESC;

-- Get published media only
SELECT * FROM v_media_public ORDER BY published_at DESC;

-- Get grid view for public display
SELECT * FROM v_media_public_grid WHERE type = 'Article';
```

### Reading Content (Direct cnt_contents)

```sql
-- Direct access to base table (still works)
SELECT * FROM cnt_contents WHERE content_type = 'Article' AND status = 'Published';
```

---

## Key Design Decisions

### ✅ Advantages
1. **No Schema Changes:** Existing `cnt_contents` table remains unchanged
2. **Backward Compatible:** Direct `cnt_contents` queries still work
3. **Single Source of Truth:** One table for all content types
4. **Flexible Metadata:** Type-specific fields stored in `metadata` jsonb
5. **Automatic Slug Normalization:** Ensures URL-safe slugs without manual intervention

### ⚠️ Considerations
1. **Type Mapping:** KnowledgeHub types map to `content_type` column
   - `Article`, `News`, `Guide` → `content_type = 'Article'`
   - `Toolkit` → `content_type = 'Tool'`
2. **Domain vs Category:** KnowledgeHub uses "domain", but `cnt_contents` uses "category" column
3. **Metadata Storage:** Type-specific fields stored in `metadata` jsonb require JSON path queries
4. **View Performance:** Views are computed on-the-fly; consider indexing frequently queried fields

---

## Frontend Integration

### Service Layer (`src/services/knowledgehub.ts`)
- `createMedia()` → calls `create_media_item()` RPC
- `updateMedia()` → calls `update_media_item()` RPC
- `listMedia()` → queries `v_media_all` view

### Type Definitions (`src/types/knowledgehub.ts`)
- `VMediaAll` interface matches `v_media_all` view structure
- Type-specific fields are optional (e.g., `video_url?`, `article_body_html?`)

### Hooks (`src/hooks/useKHContent.ts`)
- `useKHContent()` → uses `listMedia()` service
- Maps `VMediaAll` to UI `Content` type

---

## Migration Status

✅ **Completed:**
- Helper functions created
- Slug normalization trigger active
- RPC functions (`create_media_item`, `update_media_item`) operational
- Views (`v_media_all`, `v_media_public`, `v_media_public_grid`) created
- Permissions granted to `anon`, `authenticated`, `service_role`

---

## For Developers

### When to Use KnowledgeHub Interface
- ✅ Creating/updating media items via frontend forms
- ✅ Reading content in KnowledgeHub format
- ✅ When you need type-specific fields (video_url, article_body_html, etc.)

### When to Use Direct cnt_contents
- ✅ Direct database queries for reporting
- ✅ When you need all `cnt_contents` columns (organization_id, created_by, etc.)
- ✅ When working with legacy code that uses `cnt_contents` directly

### Important Notes
1. **Slug Uniqueness:** The migration does NOT enforce slug uniqueness. Consider adding a unique constraint if needed.
2. **Content Type Values:** Use `initcap(lower(type))` format: "Article", "Video", "Podcast", "Report", "Tool", "Event"
3. **Metadata Queries:** When querying type-specific fields, use JSON path syntax: `metadata->>'byline'` or `metadata->'body_json'`
4. **View Updates:** Views are read-only. Use RPC functions to modify data.

---

## Taxonomies Integration Status

### ✅ Full Integration Available

**Migration:** `20251105100000_kh_taxonomy_integration.sql` provides full taxonomy support.

**What's Included (After Taxonomy Migration):**
- ✅ Junction table: `cnt_contents_taxonomies` for content ↔ taxonomy relationships
- ✅ Multiple taxonomy kinds: Domain, Stage, Format, Tag, Popularity
- ✅ Helper functions: `get_content_domain()`, `get_content_taxonomies()`, `set_content_taxonomies()`
- ✅ Updated RPCs: `create_media_item()` and `update_media_item()` accept optional `_taxonomy_ids`
- ✅ Updated views: `v_media_all` derives domain from taxonomies (with category fallback)
- ✅ Taxonomy Manager Integration: Taxonomies managed separately, assigned to content

**Backward Compatibility:**
- ✅ `category` column still supported as fallback
- ✅ RPC functions work with or without taxonomy_ids
- ✅ Existing content with category values continues to work

**See:** `docs/database/TAXONOMY_INTEGRATION_GUIDE.md` for complete implementation details.

---

## Future Enhancements

Potential improvements:
- [x] **Taxonomy Integration:** ✅ Complete - See `20251105100000_kh_taxonomy_integration.sql`
- [ ] Add unique constraint on `slug` column
- [ ] Add indexes on frequently queried `metadata` paths
- [ ] Consider materialized views for `v_media_public` if performance becomes an issue
- [ ] Add validation for required fields per content type
- [ ] Support multiple taxonomy kinds (Stage, Format, Tag, Popularity) in content filtering

---

**Last Updated:** November 5, 2025  
**Maintained By:** Development Team

