<!-- Copilot / AI agent guidance for the MZN-EJP-Admin-Partner-App repo -->
# Quick Project Overview

- **Stack**: TypeScript React frontend (Vite) + Node/Express-style API(s). Key libs: `@casl/ability`, `@supabase/supabase-js`, Azure EEI, `tsx` for running TS servers.
- **Front-end entry**: `src/index.tsx` and `src/App.tsx` (routes in `AppRouter.tsx`). Built with Vite (`vite.config.ts`) — dev server proxies `/api` → `http://localhost:3001`.
- **Backends**: Two API folders exist: `api/` and `AdminApp_API/`. Each contains `server.ts` and `server-minimal.ts` and run via `tsx`.
- **Database**: Migrations and dumps in `database/` and authoritative schema in `docs/database/SCHEMA_REFERENCE.md`.

# Common Commands

- Frontend dev: `npm run dev` (root) — starts Vite on port `3000` and proxies `/api` to `localhost:3001`.
- Frontend build: `npm run build` and preview with `npm run preview`.
- Tests: `npm test` (Jest).
- Export policies script: `npm run export-policies` (runs `scripts/exportPolicies.ts`).
- Start backend (admin API):
  - `cd AdminApp_API; npm run dev` (runs `tsx watch server.ts`).
  - Alternative API: `cd api; npm run dev`.
- Type-check backend: `cd AdminApp_API; npm run type-check`.

# Project-specific Conventions (important — follow these exactly)

- Temporary / WIP documents: put them in `/workspace`. Finalized documentation must live under `/docs` and updates should be made in-place (see `.cursorrules`).
- Authoritative schema and permissions: update `docs/database/SCHEMA_REFERENCE.md` and `docs/iam/PERMISSIONS_REFERENCE.md` first when making DB or RBAC changes.
- Field / role mapping rules (implemented in code):
  - Database uses `user_segment` (values: `internal`, `partner`, `customer`, `advisor`). Frontend maps these to internal labels; see `src/lib/federatedAuthSupabase.ts` and `src/context/AuthContext.tsx`.
  - Role normalization: `creator` + `contributor` → `editor` in frontend. See `src/auth/ability.ts` and `src/shared/permissions.ts` for canonical mappings.

# Authorization & IAM

- CASL abilities implemented in `src/auth/ability.ts`. The canonical action/subject registry is `src/shared/permissions.ts` — use that registry for any new permission/action names.
- When changing permissions, update `docs/iam/PERMISSIONS_REFERENCE.md` and the `RolePermissions` registry simultaneously.

# Integration Points & External Dependencies

- Supabase client usage: `@supabase/supabase-js` across frontend and API. Look for `src/lib/*supabase*` and `api/lib/`.
- Azure External Identities (EEI) integration is used for authentication; check `src/lib/federatedAuthSupabase.ts` and environment variables used in `AdminApp_API/server.ts`.
- File uploads and blob storage: `@azure/storage-blob` is used in backend services.

# Debugging & Local Setup Tips

- Vite proxies `/api` to `http://localhost:3001`. Always start the backend before calling API routes from the frontend.
- On Windows, repository scripts and many maintenance utilities are PowerShell scripts under `scripts/` (e.g., `dump-schema.ps1`). Run them from PowerShell: `.
scripts\your-script.ps1`.
- If an API change requires DB schema updates, update `docs/database/SCHEMA_REFERENCE.md` and include migration SQL under `database/migrations/`.

# Files & Locations to Inspect First (examples)

- Frontend entry and router: `src/index.tsx`, `src/App.tsx`, `src/AppRouter.tsx`.
- Auth & permissions: `src/auth/ability.ts`, `src/shared/permissions.ts`, `src/context/AuthContext.tsx`.
- API servers: `api/server.ts`, `AdminApp_API/server.ts`, `api/routes/`, `AdminApp_API/routes/`.
- Database and migrations: `database/`, `docs/database/SCHEMA_REFERENCE.md`.
- Project scripts: `scripts/` (PowerShell + SQL helpers).

# Quick Examples

- Start everything (PowerShell):
```
cd "D:\Khalifa Fund Project\Dev Environment\MZN-EJP-Admin-Partner-App"
npm run dev             # frontend (Vite)
cd AdminApp_API; npm run dev  # backend on :3001
```

- Run tests:
```
npm test
```

# What an AI agent should never do automatically

- Do not modify `docs/database/SCHEMA_REFERENCE.md` or `docs/iam/PERMISSIONS_REFERENCE.md` without cross-checking `database/latest_db_*.sql` and `src/auth/ability.ts`.
- Do not create final docs directly in `/docs` — draft in `/workspace` and move only after verification (see `.cursorrules`).

# Feedback

If anything here is unclear or you want additional examples (e.g., a sample PR checklist for IAM/schema changes), tell me which area to expand and I'll iterate.
