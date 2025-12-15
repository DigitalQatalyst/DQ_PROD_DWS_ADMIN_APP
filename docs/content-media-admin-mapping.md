Title: Media Admin UI Mapping to /content-management

Overview
- Goal: Map the parent workspace media admin UI features to the standalone partner app route `/content-management` without copying code verbatim.
- Approach: Reuse the partner app’s layout, auth, and CRUD patterns; implement thin adapters where needed to align data shapes and operations.

Inventory (Parent Admin-UI)
- Pages
  - src/admin-ui/pages/MediaList.tsx – list, filters, bulk actions (uses `mediaService`)
  - src/admin-ui/pages/MediaCreate.tsx – create flows, taxonomy/category selection, Azure uploads
  - src/admin-ui/pages/MediaDetail.tsx – edit existing media, taxonomy, uploads, structured event/report fields
  - src/admin-ui/pages/Dashboard.tsx – status counts and recent items
- Components (selection)
  - src/admin-ui/components/AppLayout.tsx – admin layout (Header/Footer from main app)
  - src/admin-ui/components/RichTextEditor.tsx – WYSIWYG editor
  - src/admin-ui/components/media/* – AuthorDetails, CategorySelector, ThumbnailPicker, TabsBar, type-specific sections
- Utils/Services
  - src/admin-ui/utils/supabase.ts – mediaService, taxonomyService, assetService (reads v_media_all; writes via `/api/admin/media` or RPC)
  - src/admin-ui/utils/supabaseClient.ts – requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - src/admin-ui/utils/mediaForm.ts – slug/url/duration helpers
  - src/lib/storageProvider.ts – Azure Blob signed upload via `/api/uploads/*`
- API Routes (server)
  - api/admin/media/index.js – create/update/delete on media tables (needs SUPABASE_SERVICE_ROLE_KEY)
  - api/admin/taxonomy/index.js – CRUD on `taxonomies`

Inventory (Standalone Partner App)
- Entry and wrappers
  - MZN-EJP-Admin-Partner-App/src/pages/content-management.tsx – route wrapper
  - MZN-EJP-Admin-Partner-App/src/components/AppLayout.tsx – app layout and sidebar
- Content management UI
  - MZN-EJP-Admin-Partner-App/src/components/ContentManagementPage.tsx – list, filters, drawer
  - MZN-EJP-Admin-Partner-App/src/components/ContentForm.tsx – create/edit simplified content
  - MZN-EJP-Admin-Partner-App/src/components/ContentDetailsDrawer.tsx – details panel
- Data and auth
  - MZN-EJP-Admin-Partner-App/src/hooks/useCRUD.ts – generic table CRUD (RBAC-aware)
  - MZN-EJP-Admin-Partner-App/src/lib/dbClient.ts – Supabase/Azure adapter (RLS claims via localStorage)
  - MZN-EJP-Admin-Partner-App/src/context/AuthContext.tsx – CASL permissions + role/segment

External Contracts (Parent Admin-UI)
- Supabase
  - Required env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Optional switches: `VITE_SUPABASE_WRITE_VIA_API` (default true), `VITE_SUPABASE_USE_RPC`, `VITE_ALLOW_ANON_DIRECT_WRITES`
  - Server env for API routes: `SUPABASE_SERVICE_ROLE_KEY`
- Admin API endpoints
  - `/api/admin/media` (actions: create/update/delete)
  - `/api/admin/taxonomy` (actions: create/update/archive/reorder)
- Azure uploads
  - `/api/uploads/sign`, `/api/uploads/delete` consumed by `src/lib/storageProvider.ts`
- Auth (MSAL)
  - Client env: `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_REDIRECT_URI`, `VITE_AZURE_POST_LOGOUT_REDIRECT_URI`, `VITE_AZURE_SCOPES`, `VITE_B2C_TENANT_NAME`, `VITE_B2C_POLICY_SIGNUP_SIGNIN`

Data Model Differences
- Parent: `media_items` (+ child tables articles/videos/podcasts/reports/tools/events), view `v_media_all`, `taxonomies`, `media_assets`.
- Partner: `cnt_contents` (content_type, status, author_name, featured_image_url/thumbnail_url, tags, published_at, etc.).

Feature Mapping Matrix (Parent → Partner)
- Media list (filters, search, sort, bulk) → ContentManagementPage list powered by `useCRUD('cnt_contents')`.
  - Map fields: type → content_type; status → status; thumbnailUrl → featured_image_url/thumbnail_url; author → author_name; tags → tags.
  - Sorting: publishedAt/updatedAt → created_at/updated_at.
- Create/edit (MediaCreate/MediaDetail) → ContentForm with extended fields.
  - Map Articles/News/Guide → ContentForm.types (article/guide/announcement/policy). Add ‘Video/Podcast’ only if needed.
  - Authors array → single `author_name` (first author); skip `authorSlugs` or derive slug implicitly.
  - Thumbnail/document uploads → reuse `src/lib/storageProvider.ts` behind simple URL fields, or add file inputs wired to signer.
- Dashboard status counts → Summary tiles in ContentManagementPage (Draft, Pending Review, Published, Archived).
  - Map InReview → Pending Review; Scheduled maps as-is if used by partner data.
- Taxonomy (Domain/Format/Popularity) → Category string and optional partner taxonomy model (future).
  - If needed, back a `categories` source with a simple lookup table and align `CategorySelector` to it later.
- Assets (media_assets) → Not modeled in partner app; optional enhancement via `storageProvider` and a small `cnt_content_assets` table later.

Gaps and Adapters
- Taxonomy: Parent’s taxonomyService expects `taxonomies` and domain mapping. Partner app currently uses a free-form `category` string. Decision: keep category string now; add taxonomy later if needed.
- Rich text: Parent uses RichTextEditor; partner’s ContentForm uses `<textarea>`. Decision: keep simple editor now; optionally embed `src/admin-ui/components/RichTextEditor.tsx` later.
- Authors: Parent supports array of author objects; partner supports one `author_name`. Decision: map first author only; skip author metadata (bio/photo) unless a dedicated author model is added.
- Events/Reports/Toolkits: Parent models additional structured fields. Partner does not yet have equivalents. Decision: defer; represent via generic content for now.
- API writes: Parent prefers server API with service role key. Partner CRUD writes directly via Supabase with RLS claims. Decision: continue using `useCRUD` and `dbClient` patterns; no changes to `/api/admin/*` needed for partner flow.

Routing and Navigation
- Route `/content-management` remains the entry point: MZN-EJP-Admin-Partner-App/src/pages/content-management.tsx renders partner `AppLayout` and `ContentManagementPage`.
- Creation/editing already supported via `/content-form` and `/content-form/:contentId` (see MZN-EJP-Admin-Partner-App/src/AppRouter.tsx).
- Deep link to details drawer supported via `?contentId=...` query param (handled by ContentManagementPage).

Implementation Steps
1) Field mapping and list view
   - Ensure ContentManagementPage maps DB fields consistently (id, title, content_type, status, author_name, tags, published_at, thumbnail_url).
   - Confirm filters (status/type/category/date) align with columns in `cnt_contents`.
2) Create/edit flow
   - Extend ContentForm with any missing fields used by the list (e.g., visibility if needed) and map to `cnt_contents`.
   - Optional: integrate `storageProvider` for image/doc uploads, persist URLs to `featured_image_url/thumbnail_url`.
3) Status transitions
   - Align partner statuses to parent semantics: Draft, Pending Review (maps from InReview), Scheduled, Published, Archived.
   - Add quick actions in ContentDetailsDrawer where appropriate.
4) Auth and RBAC
   - Keep partner CASL-based permissions enforced by `useCRUD` (create/read/update/delete).
   - No changes to MSAL are required for this mapping.
5) Optional enhancements (later)
   - Add taxonomy table and a simple selector to replace the free-form category string.
   - Add an assets table and UI components for managing attached files.
   - Replace textarea with a rich text editor.

Environment Checklist
- Partner app
  - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  - (If using uploads) working `/api/uploads/sign` and `/api/uploads/delete`
- Server API (if needed for parent flows)
  - SUPABASE_SERVICE_ROLE_KEY available to `api/admin/*` endpoints

Success Criteria
- `/content-management` lists and filters content from `cnt_contents` respecting RBAC.
- “Create New” opens `/content-form`, saves into `cnt_contents`, and returns to list.
- “Edit” opens `/content-form/:contentId` with prefilled values.
- Optional uploads store URLs and render in the list/drawer.

