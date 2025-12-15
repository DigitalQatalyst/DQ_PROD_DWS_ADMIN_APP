# Document 1 — Current Schema, RLS & Helper Functions (Detailed)

> Baseline: after_schema_baseline.sql (Supabase Postgres). This document consolidates the working configuration we validated: tables, FKs, RLS policies, helper functions, triggers, and grants. It’s meant for engineers to audit and extend in dev/prod.

---

## 1) Tables in scope (post-cleanup)

**Auth**
- `auth_organizations` — canonical org registry (id, name, display_name, ...)
- `auth_users` — application users (non-Supabase auth shadow)
- `auth_user_profiles` — link user ↔ org (+ role, customer_type, prefs)

**Ecosystem**
- `eco_business_directory` — businesses/providers (FK → auth_organizations)
- `eco_growth_areas` — economic growth areas (FK → auth_organizations)
- `eco_zones` — zones/locations (FK → auth_organizations)
- `cnt_contents` — editorial content
- `cnt_resources` — resources library
- `cnt_experiences` — experiences (kept)
- `cnt_events`, `cnt_metrics` — included but RLS currently public/read or org-scoped where noted

**Workflow (renamed with `wf_` prefix)**
- `wf_review_cycles`, `wf_review_actions`, `wf_review_assignments`, `wf_review_comments`, `wf_review_templates`

**Telemetry**
- `activity_logs`

> Note: `spatial_ref_sys` retained (PostGIS/system metadata). All other deprecated tables dropped earlier in the process.

---

## 2) Foreign keys (selected highlights)

```sql
-- auth_user_profiles ↔ auth (and cascades)
ALTER TABLE ONLY public.auth_user_profiles
  ADD CONSTRAINT auth_user_profiles_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.auth_user_profiles
  ADD CONSTRAINT auth_user_profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.auth_users(id) ON DELETE CASCADE;

-- ecosystem ↔ dimensions
ALTER TABLE ONLY public.eco_business_directory
  ADD CONSTRAINT business_directory_primary_sector_id_fkey
  FOREIGN KEY (primary_sector_id)
  REFERENCES public.dim_sectors(id);

ALTER TABLE ONLY public.eco_business_directory
  ADD CONSTRAINT business_directory_primary_support_category_id_fkey
  FOREIGN KEY (primary_support_category_id)
  REFERENCES public.dim_support_categories(id);

-- content ownership
ALTER TABLE ONLY public.cnt_contents
  ADD CONSTRAINT cnt_contents_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.auth_users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.cnt_contents
  ADD CONSTRAINT cnt_contents_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

-- experiences ↔ orgs/businesses
ALTER TABLE ONLY public.cnt_experiences
  ADD CONSTRAINT cnt_experiences_location_id_fkey
  FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);

ALTER TABLE ONLY public.cnt_experiences
  ADD CONSTRAINT cnt_experiences_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.cnt_experiences
  ADD CONSTRAINT cnt_experiences_provider_id_fkey
  FOREIGN KEY (provider_id) REFERENCES public.eco_business_directory(id);

-- metrics ↔ geo/zones
ALTER TABLE ONLY public.cnt_metrics
  ADD CONSTRAINT cnt_metrics_emirate_id_fkey FOREIGN KEY (emirate_id) REFERENCES public.geo_emirates(id);
ALTER TABLE ONLY public.cnt_metrics
  ADD CONSTRAINT cnt_metrics_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);
```

> Every ecosystem/content table has an `organization_id` column and an RLS policy referencing JWT `organization_name → org_id` resolution (see §3/§4).

---

## 3) RLS — core pattern (org-scoped + service override)

**Enable RLS** (representative):
```sql
ALTER TABLE public.cnt_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnt_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnt_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comm_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_business_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_growth_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_user_profiles ENABLE ROW LEVEL SECURITY;
-- workflow tables also enabled
ALTER TABLE public.wf_review_actions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wf_review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wf_review_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wf_review_cycles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wf_review_templates   ENABLE ROW LEVEL SECURITY;
```

**Org read/write policies** (applied to each org-scoped table):
```sql
-- Read within org (also works for write filters below)
CREATE POLICY org_read ON public.cnt_contents
USING (organization_id = public.get_org_id_from_claim())
WITH CHECK (organization_id = public.get_org_id_from_claim());

-- Write within org
CREATE POLICY org_write ON public.cnt_contents
USING (organization_id = public.get_org_id_from_claim())
WITH CHECK (organization_id = public.get_org_id_from_claim());

-- Same pattern on: cnt_resources, cnt_experiences, comm_mentors,
-- eco_business_directory, eco_growth_areas, eco_programs, eco_zones,
-- mktplc_investment_opportunities, mktplc_services, activity_logs,
-- auth_user_profiles (USING/WITH CHECK mirror the above).
```

**Role-specific policies** (examples kept):
```sql
-- Contents (partner can insert/update within their org; staff can do all)
CREATE POLICY contents_insert_policy ON public.cnt_contents FOR INSERT
WITH CHECK (
  CASE
    WHEN public.is_staff_user()   THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
  END
);

CREATE POLICY contents_update_policy ON public.cnt_contents
USING (
  organization_id = public.get_org_id_from_claim()
)
WITH CHECK (
  organization_id = public.get_org_id_from_claim()
);

CREATE POLICY contents_delete_policy ON public.cnt_contents FOR DELETE
USING (CASE WHEN public.is_staff_user() THEN true ELSE false END);

-- Business Directory (same pattern)
CREATE POLICY business_directory_insert_policy ON public.eco_business_directory FOR INSERT
WITH CHECK (
  CASE
    WHEN public.is_staff_user()   THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
  END
);

CREATE POLICY business_directory_update_policy ON public.eco_business_directory
USING (organization_id = public.get_org_id_from_claim())
WITH CHECK (organization_id = public.get_org_id_from_claim());

CREATE POLICY business_directory_delete_policy ON public.eco_business_directory FOR DELETE
USING (CASE WHEN public.is_staff_user() THEN true ELSE false END);
```

**Service-role override** (bypass for backfills/admin jobs):
```sql
-- Representative (applied e.g. to eco_zones, mktplc_investment_opportunities, mktplc_services)
CREATE POLICY admin_override ON public.eco_zones
USING (current_setting('request.jwt.claim.role', true) = 'service_role')
WITH CHECK (true);
```

> Final audit showed duplicate legacy policies were removed/normalized so `org_read/org_write` plus a few role policies remain the source of truth.

---

## 4) Helper functions (JWT→Org mapping, role checks, context)

### 4.1 Org mapping from claim
```sql
CREATE OR REPLACE FUNCTION public.get_org_id_from_claim() RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  org_name text;
  org_id   uuid;
BEGIN
  -- Read org_name from JWT claim
  org_name := current_setting('jwt.claims.organization_name', true);
  -- Map to org_id
  SELECT id INTO org_id
  FROM public.auth_organizations
  WHERE name = org_name;
  RETURN org_id;
END; $$;
```

### 4.2 Current org from standard claim keys (alt helper)
```sql
CREATE OR REPLACE FUNCTION public.get_current_organisation_id() RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'organisation_id')::uuid,
    (auth.jwt() ->> 'organization_id')::uuid,
    NULL
  );
END; $$;
```

### 4.3 Current user id (Azure B2C → Supabase → fallback)
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_id() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_id text;
BEGIN
  -- Azure B2C style
  BEGIN
    user_id := current_setting('request.jwt.claims', true)::json->>'sub';
    IF user_id IS NOT NULL THEN RETURN user_id; END IF;
  EXCEPTION WHEN OTHERS THEN END;
  -- Supabase
  user_id := (SELECT auth.uid());
  IF user_id IS NOT NULL THEN RETURN user_id; END IF;
  -- Fallback
  RETURN NULL;
END; $$;
```

### 4.4 Staff/partner/platform checks (used by policies)
```sql
CREATE OR REPLACE FUNCTION public.is_staff_user() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN get_current_customer_type() = 'staff';
END; $$;

CREATE OR REPLACE FUNCTION public.is_partner_user() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN get_current_customer_type() = 'partner';
END; $$;

CREATE OR REPLACE FUNCTION public.is_platform_user() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  is_staff boolean := false;
  user_id  text;
BEGIN
  user_id := get_current_user_id();
  IF user_id IS NULL THEN RETURN FALSE; END IF;
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = user_id AND up.customer_type = 'staff')
  INTO is_staff;
  RETURN is_staff;
END; $$;
```

### 4.5 Request-scoped context helpers (console/local testing)
```sql
CREATE OR REPLACE FUNCTION public.clear_current_user_context() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('app.current_user_id', NULL, false);
  PERFORM set_config('app.customer_type',  NULL, false);
  PERFORM set_config('app.user_role',      NULL, false);
  PERFORM set_config('app.organisation_name', NULL, false);
  PERFORM set_config('app.organisation_id',   NULL, false);
END; $$;

-- NOTE: we used direct SET commands for jwt.claims.* while testing.
```

---

## 5) Triggers (updated_at maintenance)

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

-- Applied to multiple tables (examples)
CREATE OR REPLACE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.mktplc_services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_zones_updated_at
BEFORE UPDATE ON public.eco_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_review_comments_updated_at
BEFORE UPDATE ON public.wf_review_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_review_workflow_templates_updated_at
BEFORE UPDATE ON public.wf_review_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 6) Grants (schema/table usage)

```sql
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, test_user;

-- Representative table grants (RLS still applies)
GRANT ALL   ON TABLE public.cnt_contents  TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.cnt_contents  TO test_user;
GRANT ALL   ON TABLE public.cnt_resources TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.cnt_resources TO test_user;
GRANT ALL   ON TABLE public.comm_mentors  TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.comm_mentors  TO test_user;
-- …likewise for eco_* and wf_* tables as per baseline.
```

---

## 7) RLS testing helpers

**Simple one-shot check per claim value**
```sql
-- Enable RLS during testing
SET row_security = on;
-- Simulate claim (org by *name*)
SET LOCAL jwt.claims.organization_name = 'partner1org';

-- Expect to see only rows whose organization_id matches mapping(partner1org)
SELECT id, organization_id, name
FROM public.eco_business_directory
ORDER BY name;
```

**Aggregate visibility overview**
```sql
-- Returns rows per table with counts and visible org_ids
SELECT * FROM public.test_rls_visibility('partner1org');
```

---

## 8) Gotchas & conventions

- All app queries must ensure the JWT includes `organization_name` (string). RLS maps this to `auth_organizations.id` using `get_org_id_from_claim()`.
- Use **service_role** only for admin jobs/backfills; it bypasses RLS via `admin_override`.
- If you add new org-scoped tables, copy the `org_read` + `org_write` policy pair and ensure a proper FK to `auth_organizations(id)`.
- Prefer `ON DELETE SET NULL` for foreign ownership (`created_by`, `organization_id`) so soft-deletions don’t cascade data loss.
- Triggers update `updated_at` consistently; keep them when adding write tables.

---

## 9) Appendix — Representative table DDL (trimmed)

> Below are trimmed CREATE TABLE statements for the most-used tables. The full dump remains source-of-truth; these reflect the current columns relevant to RLS/FKs.

```sql
CREATE TABLE IF NOT EXISTS public.auth_organizations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  display_name text,
  type text,
  status text DEFAULT 'Active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_user_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  organization_id uuid,
  role text DEFAULT 'viewer',
  customer_type text DEFAULT 'enterprise',
  profile_data jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cnt_contents (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  title text NOT NULL,
  content_type text DEFAULT 'Article',
  author_id uuid,
  author_name text,
  status text DEFAULT 'Draft',
  published_at timestamptz,
  content text,
  summary text,
  tags text[],
  featured_image_url text,
  view_count int DEFAULT 0,
  like_count int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  description text,
  category text,
  thumbnail_url text,
  read_time text,
  duration text,
  comment_count int DEFAULT 0,
  engagement jsonb DEFAULT '{"likes":0,"views":0,"comments":0}'::jsonb,
  organization_id uuid,
  content_subtype text,
  slug text,
  sector text,
  key_points text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  content_url text,
  source text,
  story_data jsonb DEFAULT '{}'::jsonb,
  entrepreneur_name text,
  entrepreneur_company text,
  entrepreneur_location text,
  impact_metrics jsonb DEFAULT '{}'::jsonb,
  primary_sector_id uuid,
  primary_support_category_id uuid,
  target_stage_id uuid,
  average_rating numeric,
  share_count int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.eco_business_directory (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'Private',
  industry text,
  size text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  location text,
  website text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid,
  organization_type text DEFAULT 'business',
  slug text,
  products jsonb DEFAULT '[]'::jsonb,
  certifications text[] DEFAULT '{}',
  financials jsonb DEFAULT '{}'::jsonb,
  key_people jsonb DEFAULT '[]'::jsonb,
  view_count int DEFAULT 0,
  primary_sector_id uuid,
  primary_support_category_id uuid,
  rating numeric,
  review_count int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.eco_zones (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name text NOT NULL,
  description text,
  zone_type text,
  status text DEFAULT 'Active',
  organization_id uuid,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  slug text
);

CREATE TABLE IF NOT EXISTS public.comm_mentors (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  user_id uuid,
  name text NOT NULL,
  slug text UNIQUE,
  organization_id uuid,
  description text,
  bio text,
  image_url text,
  rating numeric,
  review_count int DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 10) Next steps

- **App integration**: pass `organization_name` (e.g. `enterpriseorg`, `partner1org`) in the JWT; the DB resolves to `auth_organizations.id` and RLS filters rows accordingly.
- **Add seed data**: use the Seed Playbook (Document 3) to add scenarios for new orgs/users while keeping one “null-org” record per table for edge-case testing.
- **Observability**: keep `test_rls_visibility(text)` for local console checks. In application code, rely on signed JWT claims instead.

