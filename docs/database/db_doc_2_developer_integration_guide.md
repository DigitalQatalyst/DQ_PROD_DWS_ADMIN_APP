# Document 2 — Developer Integration Guide (Supabase + RLS)

> Purpose: give developers a precise, copy‑paste‑ready guide to build, test, and ship features against the multi‑tenant, RLS‑enforced database. This covers JWT claims, client/server patterns, and minimal SQL helpers you’ll actually call from code.

---

## 1) TL;DR for engineers
- **Every request must carry `organization_name` in the JWT** (e.g., `enterpriseorg`, `partner1org`). RLS maps this to `auth_organizations.id` via `get_org_id_from_claim()`.
- **Service jobs** (backfills, migrations, admin screens) should use the **service role** key; RLS bypass is handled by `admin_override` policies.
- **Write paths**: if `organization_id` is omitted on INSERT, the `set_org_and_creator` trigger (when attached) will populate it based on the claim. Otherwise include `organization_id` explicitly.
- **“Who am I?”** in SQL: use `auth.uid()` and helper funcs (see Doc 1). In your app code, prefer your auth library for the user id, role, and org name.

---

## 2) JWT & claims

### 2.1 Required claims
```json
{
  "sub": "<user-uuid>",
  "role": "authenticated",
  "organization_name": "enterpriseorg",
  "exp": 1735689600
}
```

**Notes**
- `organization_name` is the **text key** RLS uses to resolve the tenant (`auth_organizations.name`).
- `role` is used for platform/service checks in some policies (e.g., `service_role`).
- If you use Azure AD/B2C, ensure the token you mint for Supabase includes `organization_name` and maps `sub` consistently to your `auth_users.id` (or federate via Supabase Auth depending on your architecture).

### 2.2 Local console testing
```sql
-- In a SQL session
SET row_security = on;
SET LOCAL jwt.claims.organization_name = 'enterpriseorg';
-- Now any SELECT/INSERT/UPDATE/DELETE is filtered by RLS for enterpriseorg
```

---

## 3) Client patterns

### 3.1 Supabase JS — user-level CRUD (RLS enforced)
```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
})

// Ensure your auth provider/session carries organization_name in the JWT
const { data, error } = await supabase
  .from('eco_business_directory')
  .select('*')
  .order('name')

if (error) throw error
console.log('visible businesses', data)
```

### 3.2 Row creation — 2 approaches
**A) Let the trigger populate `organization_id`**
```ts
await supabase.from('eco_business_directory').insert({
  name: 'NewCo',
  type: 'Private',
  contact_email: 'hello@newco.test'
})
```
**B) Explicit `organization_id` (recommended for admin tooling)**
```ts
await supabase.from('eco_business_directory').insert({
  name: 'BetaCo',
  organization_id: '550e8400-e29b-41d4-a716-446655440104'
})
```

### 3.3 Service role (admin jobs)
```ts
// Use the service role key ONLY in trusted server contexts.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

await supabaseAdmin.from('eco_zones').insert({
  name: 'Zone X',
  organization_id: '550e8400-e29b-41d4-a716-446655440100'
})
```

---

## 4) Backend patterns (Node/Edge/Functions)

### 4.1 Injecting claims
- If your IdP is **Azure AD/B2C**, mint a token that includes `organization_name`.
- If you proxy via an API/Edge function, you can **re-sign** a JWT adding `organization_name` before forwarding to Supabase.

### 4.2 Verifying RLS in integration tests
```sql
SET row_security = on;
SET LOCAL jwt.claims.organization_name = 'partner1org';
SELECT count(*) FROM cnt_resources; -- Should equal only partner1org rows
```

### 4.3 Common failure modes
| Symptom | Likely Cause | Fix |
|--------|--------------|-----|
| Query returns **no rows** but table has data | Missing `organization_name` claim | Ensure session token carries the claim; check Network tab or `auth.getSession()`.
| Users can see **all rows** | Using service role key in client | Never expose service role to browsers; restrict to server.
| Insert blocked | Policy mismatch | Confirm `INSERT` policy and WITH CHECK uses `get_org_id_from_claim()`.

---

## 5) Minimal SQL you’ll actually call

### Resolve org id (sometimes useful in admin tools)
```sql
SELECT id FROM public.auth_organizations WHERE name = $1;  -- $1 = 'enterpriseorg'
```

### Per-table filtered query (server side)
```sql
SET LOCAL jwt.claims.organization_name = 'enterpriseorg';
SELECT id, name FROM public.eco_business_directory ORDER BY name;
```

### Visibility diagnostic (quick copy/paste)
```sql
SET row_security = on;
SET LOCAL jwt.claims.organization_name = 'partner1org';
SELECT 'eco_business_directory' AS t, count(*) FROM public.eco_business_directory
UNION ALL
SELECT 'eco_zones', count(*) FROM public.eco_zones
UNION ALL
SELECT 'cnt_contents', count(*) FROM public.cnt_contents;
```

---

## 6) Data writing guidelines
- Always provide **required** business keys (`name`, `slug` if unique, etc.).
- If you omit `organization_id`, ensure the **trigger is attached** to that table in the environment (see Doc 1 §5).
- Prefer **idempotent upserts** for sync jobs:
```sql
INSERT INTO public.eco_business_directory (id, name, organization_id)
VALUES ($1, $2, $3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
```

---

## 7) Security notes
- RLS is the **primary isolation**. Don’t duplicate tenant filters in code.
- Service role usage should be logged and isolated to server-only contexts.
- If adding new tables, copy the `org_read/org_write` policy pair and add FKs to `auth_organizations` and (optionally) `auth_users` for `created_by`.

---

## 8) Quick checklists

### New feature DB checklist
- [ ] New tables include `organization_id`, `created_by`, `created_at`, `updated_at`.
- [ ] FK: `organization_id → auth_organizations(id)`.
- [ ] Triggers added: `set_org_and_creator`, `update_updated_at_column`.
- [ ] RLS: `org_read` + `org_write` created & table RLS enabled.
- [ ] Grants to `authenticated` and `service_role` applied.

### Pre‑prod verification
- [ ] Run RLS visibility smoke test for 2 orgs.
- [ ] Verify one “null‑org” row exists only where intended (edge cases).
- [ ] Confirm admin override with `service_role` path.

---

## 9) Appendix — Postman / cURL

```bash
curl -X POST \
  -H "Authorization: Bearer $USER_JWT_WITH_ORGNAME" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","organization_id":"550e8400-e29b-41d4-a716-446655440104"}' \
  "$SUPABASE_URL/rest/v1/eco_business_directory"
```

> Replace `$USER_JWT_WITH_ORGNAME` with a token that includes `organization_name` claim.

---

**Done.** Next doc: *Ops & Migration Playbook* or *Seed Data Playbook*? (Your call — both are ready in outline.)

