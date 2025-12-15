# Document 4 — Ops & Migration Playbook (RLS, FKs, Seeds, Env)

> Purpose: a practical runbook for DB operators and developers to **apply**, **verify**, **troubleshoot**, and **promote** the RBAC/RLS schema across environments (local → staging → production). It consolidates routines we used during cleanup and adds guardrails.

---

## 0) Quick Matrix (what lives where)

| Area | Scope | Authoritative Objects |
|---|---|---|
| **Auth** | Tenants & identities | `auth_organizations`, `auth_users`, `auth_user_profiles` |
| **Ecosystem** | Business directory, zones, growth areas | `eco_business_directory`, `eco_zones`, `eco_growth_areas` |
| **Content** | CMS-like | `cnt_contents`, `cnt_resources`, `comm_mentors` |
| **Workflow** | Reviews & approvals | `wf_review_templates`, `wf_review_cycles`, `wf_review_actions`, `wf_review_assignments`, `wf_review_comments` |
| **Shared / Dim** | Lookups | `dim_*`, `geo_emirates` (kept), `spatial_ref_sys` (kept) |

---

## 1) Environment prerequisites

```sql
-- 1.1 Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()

-- 1.2 Required helper (maps claim → org id)
-- Should already exist from baseline. Verify:
\df+ public.get_org_id_from_claim
```

**JWT convention**
- Application sends `jwt.claims.organization_name` (text).  
- DB resolves `auth_organizations.id` via `get_org_id_from_claim()` and RLS predicates compare against row `organization_id`.

---

## 2) RLS posture (enable + policies)
> These guardrails assume every tenant-scoped table has an `organization_id` `uuid` column.

```sql
-- 2.1 Enable RLS everywhere we need it (idempotent)
DO $$
BEGIN
  PERFORM 1 FROM pg_tables WHERE schemaname='public' AND tablename IN (
    'auth_user_profiles','activity_logs',
    'eco_business_directory','eco_zones','eco_growth_areas',
    'cnt_contents','cnt_resources','comm_mentors',
    'mktplc_investment_opportunities','mktplc_services',
    'wf_review_templates','wf_review_cycles','wf_review_actions','wf_review_assignments','wf_review_comments'
  );
  -- Only turn on if table exists
  IF FOUND THEN
    ALTER TABLE IF EXISTS public.auth_user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.eco_business_directory ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.eco_zones ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.eco_growth_areas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.cnt_contents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.cnt_resources ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.comm_mentors ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.mktplc_investment_opportunities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.mktplc_services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.wf_review_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.wf_review_cycles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.wf_review_actions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.wf_review_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.wf_review_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 2.2 Canonical org policy for read/write (idempotent replacement)
DO $$
DECLARE t text; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN (
    'auth_user_profiles','activity_logs','eco_business_directory','eco_zones','eco_growth_areas','cnt_contents','cnt_resources','comm_mentors','mktplc_investment_opportunities','mktplc_services'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS org_rls_policy ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS org_read ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS org_write ON public.%I', t);

    EXECUTE format($$CREATE POLICY org_read  ON public.%I FOR SELECT USING (organization_id = get_org_id_from_claim())$$, t);
    EXECUTE format($$CREATE POLICY org_write ON public.%I FOR ALL    USING (organization_id = get_org_id_from_claim()) WITH CHECK (organization_id = get_org_id_from_claim())$$, t);
  END LOOP;
END$$;
```

**Notes**
- If you need PUBLIC read for some tables, add a separate `Public read` policy with `USING (true)`.
- `service_role` bypass is not required if your Supabase service key uses `bypass RLS` (default). Otherwise add a policy like `USING (current_setting('request.jwt.claim.role', true)='service_role')`.

---

## 3) Foreign keys & constraints sanity

```sql
-- 3.1 Ensure FK from scoped tables → auth_organizations(id)
ALTER TABLE IF EXISTS public.eco_business_directory
  DROP CONSTRAINT IF EXISTS eco_business_directory_organization_id_fkey,
  ADD  CONSTRAINT eco_business_directory_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.eco_zones
  DROP CONSTRAINT IF EXISTS eco_zones_organization_id_fkey,
  ADD  CONSTRAINT eco_zones_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.eco_growth_areas
  DROP CONSTRAINT IF EXISTS eco_growth_areas_organization_id_fkey,
  ADD  CONSTRAINT eco_growth_areas_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.cnt_contents
  DROP CONSTRAINT IF EXISTS cnt_contents_organization_id_fkey,
  ADD  CONSTRAINT cnt_contents_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.cnt_resources
  DROP CONSTRAINT IF EXISTS cnt_resources_organization_id_fkey,
  ADD  CONSTRAINT cnt_resources_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.comm_mentors
  DROP CONSTRAINT IF EXISTS comm_mentors_organization_id_fkey,
  ADD  CONSTRAINT comm_mentors_organization_id_fkey FOREIGN KEY (organization_id)
       REFERENCES public.auth_organizations(id) ON DELETE SET NULL;
```

```sql
-- 3.2 Membership uniqueness and helpful indexes
ALTER TABLE IF EXISTS public.auth_user_profiles
  ADD CONSTRAINT IF NOT EXISTS auth_user_profiles_user_org_unique UNIQUE (user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_eco_business_directory_org  ON public.eco_business_directory (organization_id);
CREATE INDEX IF NOT EXISTS idx_eco_zones_org              ON public.eco_zones (organization_id);
CREATE INDEX IF NOT EXISTS idx_eco_growth_areas_org       ON public.eco_growth_areas (organization_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_org           ON public.cnt_contents (organization_id);
CREATE INDEX IF NOT EXISTS idx_cnt_resources_org          ON public.cnt_resources (organization_id);
CREATE INDEX IF NOT EXISTS idx_comm_mentors_org           ON public.comm_mentors (organization_id);
```

---

## 4) Seeding workflow (summary)
1. **Load core seeds** — orgs, users, profiles (Doc 3 §1).  
2. **Load ecosystem seeds** — business directory, zones, growth areas (Doc 3 §2).  
3. **Load content/community seeds** — contents, resources, mentors (Doc 3 §3).  
4. **Run RLS smoke tests** (Doc 3 §5) to ensure per‑org isolation.

> Seeds are **idempotent**; safe to re-run. Use service role for cross-tenant insertion.

---

## 5) Validation queries (copy/paste)

```sql
-- 5.1 RLS enabled?
SELECT n.nspname AS schema_name, c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity=true
ORDER BY 1,2;

-- 5.2 Policy inventory
SELECT schemaname, tablename, policyname, cmd AS command, permissive, roles, polqual AS using_condition, polwithcheck AS with_check
FROM pg_policies WHERE schemaname='public'
ORDER BY tablename, policyname;

-- 5.3 Org integrity (no orphans)
WITH scoped AS (
  SELECT 'eco_business_directory' t, organization_id FROM public.eco_business_directory
  UNION ALL SELECT 'eco_zones', organization_id FROM public.eco_zones
  UNION ALL SELECT 'eco_growth_areas', organization_id FROM public.eco_growth_areas
  UNION ALL SELECT 'cnt_contents', organization_id FROM public.cnt_contents
  UNION ALL SELECT 'cnt_resources', organization_id FROM public.cnt_resources
  UNION ALL SELECT 'comm_mentors', organization_id FROM public.comm_mentors
)
SELECT t AS table_name,
       COUNT(*) total,
       SUM((organization_id IS NOT NULL)::int) with_org,
       SUM((organization_id IS NULL)::int)  without_org
FROM scoped GROUP BY 1 ORDER BY 1;

-- 5.4 Visibility check by claim (set each in a separate transaction)
SET LOCAL jwt.claims.organization_name = 'enterpriseorg';
SELECT 'eco_business_directory' AS t, count(*) FROM public.eco_business_directory
UNION ALL SELECT 'eco_zones', count(*) FROM public.eco_zones
UNION ALL SELECT 'eco_growth_areas', count(*) FROM public.eco_growth_areas
UNION ALL SELECT 'cnt_contents', count(*) FROM public.cnt_contents
UNION ALL SELECT 'cnt_resources', count(*) FROM public.cnt_resources
UNION ALL SELECT 'comm_mentors', count(*) FROM public.comm_mentors;
```

---

## 6) Promotion to staging/production

**Order of operations**
1. Apply **schema migrations** (DDL) — FKs, indexes, RLS enablement & policies.
2. Apply **seed data** for reference/lookup (orgs, roles, dims) using service role.
3. Configure app to send **`organization_name` claim** per request/session.
4. Run **validation queries** (Section 5).

**Rollback strategy**
- Schema: always include `DROP POLICY IF EXISTS` / `IF EXISTS` guards in migrations.
- Data: seed UUIDs are deterministic; use the Rollback section in Doc 3 to delete seeded rows.

---

## 7) Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| App sees zero rows for tenant | Claim missing or mismatch | Inspect header/JWT; `SET LOCAL jwt.claims.organization_name='…'`; verify `auth_organizations.name` exists. |
| Service role still filtered | Service key not bypassing RLS | Add explicit `admin_override` policy OR use Supabase service key with `bypass RLS`. |
| FK errors on seed | Org/User referenced doesn’t exist | Seed `auth_organizations` and `auth_users` first; re-run profiles. |
| Duplicate membership | Unique constraint missing | Ensure `auth_user_profiles_user_org_unique` exists. |
| Null‑org test rows appear for tenants | Public read policy exists | Remove/adjust `Public read` policies for scoped tables. |

---

## 8) Appendix — Minimal `admin_override` (optional)
```sql
-- Only if you need non-bypass admin tokens to see everything
DO $$
DECLARE t text; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN (
    'auth_user_profiles','activity_logs','eco_business_directory','eco_zones','eco_growth_areas','cnt_contents','cnt_resources','comm_mentors'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_override ON public.%I', t);
    EXECUTE format($$CREATE POLICY admin_override ON public.%I FOR ALL USING (current_setting('request.jwt.claim.role', true)='service_role')$$, t);
  END LOOP;
END$$;
```

---

**End of Playbook.** Use this as your single source of truth for operating and promoting the multi‑tenant RLS setup.

