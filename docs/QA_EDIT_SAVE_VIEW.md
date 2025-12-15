Manual QA Script: Edit → Save → View

Prereqs

- `.env` has valid Supabase URL/keys.
- Optional: set `VITE_ENABLE_CONTENT_LOGGING=true` to see structured logs.

Steps

1) Edit existing content
- Navigate to `/content-management` and open an item.
- Click Edit (or deep-link to `/content-form/:id`).
- Change title, author, summary; Save.

2) Verify list refresh and drawer data
- You are navigated back to `/content-management`.
- Open the same item.
- Expected: updated title/author/summary visible.
- Expected: author title/photo/bio reflect latest edits (from metadata).
- Expected: body content shows the saved HTML for Articles.
- Logs: `[CONTENT_VIEW_FLOW:DRAWER_REFRESH]`, followed by `FETCH_*` and (if needed) `FALLBACK_FETCH_*`.
 - Logs: `[CONTENT_VIEW_FLOW:ENRICH_SUCCESS]` with `hasAuthorInfo: true` and a change hash.

3) Hard refresh
- Press browser refresh (F5) on the list and re-open the item.
- Expected: fields remain updated.

4) Logout/Login and verify
- Logout, login again, re-open the item.
- Expected: fields remain updated.

5) Tenant/role check (if multi-tenant)
- Switch to another org/user; confirm item visibility matches RLS expectations (public vs draft/editor-only).

Edge Cases

- If the list shows the item but drawer seems outdated, check console logs for `FALLBACK_FETCH_*`. That indicates RLS or filter mismatch; the drawer now corrects by fetching the single row by `id`.

Troubleshooting

- If no items load, verify Supabase credentials and RLS. For development, ensure either a permissive read policy (e.g., `dev_read_all`) or an authenticated session.

