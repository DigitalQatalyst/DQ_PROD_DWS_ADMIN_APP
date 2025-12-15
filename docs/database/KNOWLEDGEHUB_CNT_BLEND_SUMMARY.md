# KnowledgeHub Schema Integration - Developer Quick Reference

**TL;DR:** KnowledgeHub semantics are now layered on top of the existing `cnt_contents` table. No new tables created. Use RPCs and views for KnowledgeHub API, or query `cnt_contents` directly for traditional access.

---

## What Changed

✅ **Added:** Helper functions, RPCs (`create_media_item`, `update_media_item`), and views (`v_media_all`, `v_media_public`)  
✅ **Added:** Automatic slug normalization trigger  
❌ **No new tables** - everything uses existing `cnt_contents` table

---

## Quick Reference

### Creating Content (KnowledgeHub API)
```typescript
// Frontend service
import { createMedia } from '../services/knowledgehub';

const id = await createMedia(
  { title: 'My Article', slug: 'my-article', status: 'Draft', ... },
  'Article',
  { body_html: '<p>Content</p>', byline: 'John Doe', ... }
);
```

### Reading Content (KnowledgeHub API)
```typescript
// Frontend service
import { listMedia } from '../services/knowledgehub';

const items = await listMedia({ type: 'Article', status: 'Published' });
// Queries v_media_all view automatically
```

### Direct cnt_contents Access
```sql
-- Still works - backward compatible
SELECT * FROM cnt_contents WHERE content_type = 'Article';
```

---

## Field Mapping

| KnowledgeHub | cnt_contents | Notes |
|--------------|--------------|-------|
| `domain` | `category` | Different names, same column |
| `type` | `content_type` | Article, Video, Podcast, etc. |
| `body_html` | `content` | For articles |
| `video_url` | `content_url` | For videos |
| `audio_url` | `content_url` | For podcasts |
| `byline`, `platform`, etc. | `metadata->>'field'` | Type-specific in jsonb |

---

## Taxonomies Status

⚠️ **Partial Integration:** Taxonomies are NOT fully integrated in this migration.

- ✅ Basic domain filtering works via `category` column (text string)
- ✅ Frontend queries `taxonomies` table directly for Domain options
- ❌ No taxonomy relationship table (content ↔ taxonomies)
- ❌ No taxonomy filtering in views
- ❌ Only Domain kind is used (Stage, Format, Tag, Popularity not integrated)

**Current Approach:** Content stores `category` as free-form text, not taxonomy IDs. Frontend queries `taxonomies` table separately for dropdown options.

---

## Important Notes

1. **Slug Auto-Normalization:** Slugs are automatically normalized on insert/update (trigger handles this)
2. **Type-Specific Data:** Stored in `metadata` jsonb column or mapped to existing columns
3. **Views are Read-Only:** Use RPC functions to modify data
4. **Backward Compatible:** Direct `cnt_contents` queries still work
5. **Taxonomies:** Not fully integrated - use direct `taxonomies` table queries for filtering options

---

## Files to Know

- **Migration:** `supabase/migrations/20251105091500_kh_blend_into_cnt.sql`
- **Service:** `src/services/knowledgehub.ts` (createMedia, updateMedia, listMedia)
- **Types:** `src/types/knowledgehub.ts` (VMediaAll interface)
- **Hook:** `src/hooks/useKHContent.ts` (useKHContent hook)

---

**Full Documentation:** See `docs/database/KNOWLEDGEHUB_CNT_BLEND.md` for complete details.

