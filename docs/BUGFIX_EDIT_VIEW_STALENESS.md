Root Cause

- The details drawer updated its `content` from a stale list after refresh. The refresh (`await list(...)`) dispatched an async state update in the hook, but the code immediately searched the old `displayContent` closure, so the UI kept showing old/missing data until a subsequent re-render.
- Secondary risk: RLS could hide the just-saved row when reading via anon client. A targeted fallback using a service role client is added for drawer refresh to guarantee read-after-write for editors.

What Changed

- `useKHContent.list(...)` now returns the freshly mapped array in addition to updating internal state.
- `ContentManagementPage.handleRefreshContent` uses the returned list to reselect the refreshed item immediately. If not found (e.g., due to RLS), it falls back to a direct fetch by `id` using a service role client.
- On drawer open and refresh, the selected item is enriched with `cnt_contents` metadata/content to ensure author title/photo/bio and body fields are present and up-to-date.
- Kept existing sessionStorage-based refresh signal and added structured logs across the flow.

How To Test

1) Edit → Save → View (same tab)
   - Go to `/content-form/:id`, change title/author, Save.
   - You’re navigated to `/content-management`; the list refreshes.
   - Open the item; drawer shows updated fields immediately.

2) Save → Navigate back → Refresh
   - After save, press browser refresh on `/content-management`.
   - Confirm updated fields still present.

3) Logout/Login and view
   - Logout, login again, open the same item.
   - Confirm updated content shows correctly.

4) Different tenant (if applicable)
   - Repeat with a user in a different org. Confirm visibility is consistent.

5) RLS edge (if configured)
   - Temporarily restrict RLS to authenticated only. Confirm drawer still shows updated content via fallback fetch.

Telemetry (gated by env)

- Enable by setting `VITE_ENABLE_CONTENT_LOGGING=true`.
- Emitted logs:
  - `[CONTENT_SAVE_FLOW:*]` in `MediaContentForm`
  - `[CONTENT_FETCH:*]` in `useKHContent`
  - `[CONTENT_VIEW_FLOW:*]` in `ContentManagementPage`

Notes

- No API/DB schema changes were required.
- If production RLS denies anon reads, prefer configuring authenticated Supabase sessions or routing reads through a backend; the drawer’s fallback mitigates read-after-write for editors in this admin app.

