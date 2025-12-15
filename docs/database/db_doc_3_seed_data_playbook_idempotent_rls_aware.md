# Document 3 — Seed Data Playbook (Idempotent & RLS‑Aware)

> Purpose: reproducible seeds for **multi‑tenant** testing with **RLS**. All scripts are **idempotent** (`INSERT … ON CONFLICT DO UPDATE`) and safe to re‑run in dev. Includes edge‑case rows, validation queries, and minimal rollbacks.

**Conventions used below**
- Tenant key is **`organization_name`** in the JWT; DB maps to `auth_organizations.id` via `get_org_id_from_claim()`.
- Use **service role** or temporarily disable RLS when inserting seeds for multiple orgs.
- UUIDs in this doc follow the baseline you confirmed (enterpriseorg, partner1org, etc.).

---

## 0) Pre‑checks (run once per environment)
```sql
-- 0.1 Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()

-- 0.2 Helpful: make sure RLS is ON but we will seed with service role or bypass
SET row_security = on;  -- no effect for service role tokens

-- 0.3 (Optional) assert mapping helper exists
\df+ public.get_org_id_from_claim
```

---

## 1) Core auth seeds (orgs, users, profiles)
> Contains six orgs plus a random/testing org. User identities are placeholders; replace as needed. Profiles link users ↔ orgs with a role.

### 1.1 Organizations (authoritative list)
```sql
-- idempotent upserts by (id) + (name)
INSERT INTO public.auth_organizations (id, name, display_name, type, status, metadata)
VALUES
('550e8400-e29b-41d4-a716-446655440100','enterpriseorg','Enterprise Org 1','Enterprise','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440101','enterpriseorg2','Enterprise Org 2','Enterprise','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440102','stafforg','Staff Org 1','Platform','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440103','stafforg2','Staff Org 2','Platform','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440104','partner1org','Partner Org 1','Partner','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440105','partner2org','Partner Org 2','Partner','Active', '{}'),
('550e8400-e29b-41d4-a716-446655440106','randomorg','Random Org (Testing)','Partner','Active', '{}')
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    type         = EXCLUDED.type,
    status       = EXCLUDED.status;

-- Protect uniqueness by name too
ALTER TABLE public.auth_organizations
  ADD CONSTRAINT IF NOT EXISTS auth_organizations_name_key UNIQUE (name);
```

### 1.2 Users (application‑level users)
```sql
-- Users (replace emails/ids if you have canonical directory ids)
INSERT INTO public.auth_users (id, email, name, role, is_active, metadata)
VALUES
('0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a','enterprise.admin@dqproj.onmicrosoft.com','Enterprise Admin','admin',true,'{}'),
('f600ecae-5ece-4330-a923-c545cb4e241e','enterprise.contributor@dqproj.onmicrosoft.com','Enterprise Contributor','contributor',true,'{}'),
('805d92b8-6b12-45ae-add0-09ba3f184a78','enterprise.creator@dqproj.onmicrosoft.com','Enterprise Creator','creator',true,'{}'),
('503c8a9f-c691-4737-b5bf-0839d239132d','enterprise2.admin@dqproj.onmicrosoft.com','Enterprise2 Admin','admin',true,'{}'),
('63228904-8bd1-433c-82ef-f45b21abf66a','enterprise2.contributor@dqproj.onmicrosoft.com','Enterprise2 Contributor','contributor',true,'{}'),
('1af8e966-fafb-428f-8630-f8f6d478c8c0','enterprise2.creator@dqproj.onmicrosoft.com','Enterprise2 Creator','creator',true,'{}'),
('e1548f12-3f88-4a2c-aca4-2949b43b5d68','enterprise2.viewer@dqproj.onmicrosoft.com','Enterprise2 Viewer','viewer',true,'{}'),
('eabe347f-db50-4001-9b0d-f7e8a5b841ec','staff.admin@dqproj.onmicrosoft.com','Staff Admin','admin',true,'{}'),
('643e0088-1eb3-41b1-aa78-3a422aa9e960','staff.approver@dqproj.onmicrosoft.com','Staff Approver','approver',true,'{}'),
('f4ed8c21-812e-4312-9ba7-60b5670eae55','staff.creator@dqproj.onmicrosoft.com','Staff Creator','creator',true,'{}'),
('3d509337-f96c-45a7-b196-c786afa14761','staff.blocked@dqproj.onmicrosoft.com','Staff Blocked','viewer',false,'{}'),
('afc8667b-2742-4b43-9359-dfc717778714','partner1.admin@dqproj.onmicrosoft.com','Partner1 Admin','admin',true,'{}'),
('2a7eb534-1ca0-4920-81f2-009d864a57e6','partner1.contributor@dqproj.onmicrosoft.com','Partner1 Contributor','contributor',true,'{}'),
('3f9299c7-8314-49c2-870f-ec9028ae8768','partner2.creator@dqproj.onmicrosoft.com','Partner2 Creator','creator',true,'{}'),
('461fd697-3e2f-489d-9394-b2859c336edc','partner2.viewer@dqproj.onmicrosoft.com','Partner2 Viewer','viewer',true,'{}'),
('bcbd6ace-9ca4-4090-bd19-6febcd8992e7','partner.noorg@dqproj.onmicrosoft.com','Partner Missing Org','viewer',true,'{}')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, is_active = EXCLUDED.is_active;
```

### 1.3 User ↔ Org Profiles (membership + roles)
```sql
-- Ensure composite uniqueness to allow multi‑org membership
ALTER TABLE public.auth_user_profiles
  ADD CONSTRAINT IF NOT EXISTS auth_user_profiles_user_org_unique UNIQUE (user_id, organization_id);

-- Enterprise org memberships
INSERT INTO public.auth_user_profiles (user_id, organization_id, role, customer_type)
VALUES
('0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a','550e8400-e29b-41d4-a716-446655440100','admin','enterprise'),
('f600ecae-5ece-4330-a923-c545cb4e241e','550e8400-e29b-41d4-a716-446655440100','contributor','enterprise'),
('805d92b8-6b12-45ae-add0-09ba3f184a78','550e8400-e29b-41d4-a716-446655440100','creator','enterprise')
ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role, customer_type = EXCLUDED.customer_type;

-- Enterprise 2
INSERT INTO public.auth_user_profiles (user_id, organization_id, role, customer_type)
VALUES
('503c8a9f-c691-4737-b5bf-0839d239132d','550e8400-e29b-41d4-a716-446655440101','admin','enterprise'),
('63228904-8bd1-433c-82ef-f45b21abf66a','550e8400-e29b-41d4-a716-446655440101','contributor','enterprise'),
('1af8e966-fafb-428f-8630-f8f6d478c8c0','550e8400-e29b-41d4-a716-446655440101','creator','enterprise'),
('e1548f12-3f88-4a2c-aca4-2949b43b5d68','550e8400-e29b-41d4-a716-446655440101','viewer','enterprise')
ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role, customer_type = EXCLUDED.customer_type;

-- Staff orgs
INSERT INTO public.auth_user_profiles (user_id, organization_id, role, customer_type)
VALUES
('eabe347f-db50-4001-9b0d-f7e8a5b841ec','550e8400-e29b-41d4-a716-446655440102','admin','staff'),
('643e0088-1eb3-41b1-aa78-3a422aa9e960','550e8400-e29b-41d4-a716-446655440102','approver','staff'),
('f4ed8c21-812e-4312-9ba7-60b5670eae55','550e8400-e29b-41d4-a716-446655440103','creator','staff'),
('3d509337-f96c-45a7-b196-c786afa14761','550e8400-e29b-41d4-a716-446655440106','viewer','staff')
ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role, customer_type = EXCLUDED.customer_type;

-- Partner orgs
INSERT INTO public.auth_user_profiles (user_id, organization_id, role, customer_type)
VALUES
('afc8667b-2742-4b43-9359-dfc717778714','550e8400-e29b-41d4-a716-446655440104','admin','partner'),
('2a7eb534-1ca0-4920-81f2-009d864a57e6','550e8400-e29b-41d4-a716-446655440104','contributor','partner'),
('3f9299c7-8314-49c2-870f-ec9028ae8768','550e8400-e29b-41d4-a716-446655440105','creator','partner'),
('461fd697-3e2f-489d-9394-b2859c336edc','550e8400-e29b-41d4-a716-446655440105','viewer','partner'),
('bcbd6ace-9ca4-4090-bd19-6febcd8992e7',NULL,'viewer','partner')  -- missing org edge case
ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role, customer_type = EXCLUDED.customer_type;
```

**Validation**
```sql
SELECT o.name, count(*) members
FROM public.auth_user_profiles p
LEFT JOIN public.auth_organizations o ON o.id = p.organization_id
GROUP BY 1 ORDER BY 1;
```

---

## 2) Ecosystem seeds (eco_*)
> Includes **one NULL‑org row per table** to test public/edge behavior.

### 2.1 Business Directory
```sql
INSERT INTO public.eco_business_directory (id, name, organization_id, type, status, contact_email, created_by)
VALUES
('d5877f57-58f0-4944-924e-89973bc1c956','Alpha Holdings','550e8400-e29b-41d4-a716-446655440100','Private','Active','alpha@example.com','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a'),
('2df46789-39cb-4477-b6de-0f6535ae5c84','Beta Partners','550e8400-e29b-41d4-a716-446655440104','Private','Active','beta@example.com','afc8667b-2742-4b43-9359-dfc717778714'),
('c684c876-7793-4870-b442-ea73b3ef857d','Gamma Ventures','550e8400-e29b-41d4-a716-446655440105','Private','Active','gamma@example.com','3f9299c7-8314-49c2-870f-ec9028ae8768'),
('f120c6c8-ba3f-44a5-bc1e-ac7a7f302093','Delta Engineering','550e8400-e29b-41d4-a716-446655440101','Private','Active','delta@example.com','503c8a9f-c691-4737-b5bf-0839d239132d'),
('6577f498-b3df-40c7-9114-d589cfe16e21','Epsilon Hub','550e8400-e29b-41d4-a716-446655440102','Private','Active','epsilon@example.com','eabe347f-db50-4001-9b0d-f7e8a5b841ec'),
('f1dc718f-13d8-4305-9ad6-8e7c0cf81c2c','Zeta Consultancy',NULL,'Private','Active','zeta@example.com',NULL)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, organization_id=EXCLUDED.organization_id, status=EXCLUDED.status;
```

### 2.2 Zones
```sql
INSERT INTO public.eco_zones (id, name, organization_id, status, created_by)
VALUES
('a1111111-1111-4111-a111-111111111111','Free Zone A','550e8400-e29b-41d4-a716-446655440100','Active','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a'),
('a2222222-2222-4222-a222-222222222222','Tech Park B','550e8400-e29b-41d4-a716-446655440104','Active','afc8667b-2742-4b43-9359-dfc717778714'),
('a3333333-3333-4333-a333-333333333333','Industrial C','550e8400-e29b-41d4-a716-446655440101','Active','503c8a9f-c691-4737-b5bf-0839d239132d'),
('a4444444-4444-4444-a444-444444444444','Unmapped Zone',NULL,'Active',NULL)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, organization_id=EXCLUDED.organization_id, status=EXCLUDED.status;
```

### 2.3 Growth Areas
```sql
INSERT INTO public.eco_growth_areas (id, name, organization_id, status, priority, created_by)
VALUES
('b1111111-1111-4111-b111-111111111111','AI & Data',   '550e8400-e29b-41d4-a716-446655440100','Active','High','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a'),
('b2222222-2222-4222-b222-222222222222','Green Energy','550e8400-e29b-41d4-a716-446655440104','Active','Medium','afc8667b-2742-4b43-9359-dfc717778714'),
('b3333333-3333-4333-b333-333333333333','Advanced Mfg','550e8400-e29b-41d4-a716-446655440105','Active','Low','3f9299c7-8314-49c2-870f-ec9028ae8768'),
('b4444444-4444-4444-b444-444444444444','Edge Case',   NULL,'Active','Low',NULL)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, organization_id=EXCLUDED.organization_id, status=EXCLUDED.status, priority=EXCLUDED.priority;
```

**Validation**
```sql
SELECT 'eco_business_directory' AS t, count(*) total, count(organization_id) with_org FROM public.eco_business_directory
UNION ALL
SELECT 'eco_zones', count(*), count(organization_id) FROM public.eco_zones
UNION ALL
SELECT 'eco_growth_areas', count(*), count(organization_id) FROM public.eco_growth_areas;
```

---

## 3) Content & Community seeds (cnt_*, comm_*)

### 3.1 Contents
```sql
INSERT INTO public.cnt_contents (id, title, content_type, status, organization_id, created_by)
VALUES
('c1111111-1111-4111-c111-111111111111','How to register a company','Article','Published','550e8400-e29b-41d4-a716-446655440100','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a'),
('c2222222-2222-4222-c222-222222222222','Export compliance checklist','Guide','Published','550e8400-e29b-41d4-a716-446655440104','afc8667b-2742-4b43-9359-dfc717778714'),
('c3333333-3333-4333-c333-333333333333','SME funding 101','Article','Draft',NULL,NULL)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, content_type=EXCLUDED.content_type, status=EXCLUDED.status, organization_id=EXCLUDED.organization_id;
```

### 3.2 Resources
```sql
INSERT INTO public.cnt_resources (id, title, resource_type, organization_id, created_by)
VALUES
('r1111111-1111-4111-r111-111111111111','Template: Business Plan','Templates','550e8400-e29b-41d4-a716-446655440100','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a'),
('r2222222-2222-4222-r222-222222222222','Checklist: VAT Registration','Tools','550e8400-e29b-41d4-a716-446655440104','afc8667b-2742-4b43-9359-dfc717778714'),
('r3333333-3333-4333-r333-333333333333','Edge: Unscoped Resource','Templates',NULL,NULL)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, resource_type=EXCLUDED.resource_type, organization_id=EXCLUDED.organization_id;
```

### 3.3 Community Mentors
```sql
INSERT INTO public.comm_mentors (id, user_id, name, organization_id)
VALUES
('m1111111-1111-4111-m111-111111111111','0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a','Alice Mentor','550e8400-e29b-41d4-a716-446655440100'),
('m2222222-2222-4222-m222-222222222222','afc8667b-2742-4b43-9359-dfc717778714','Bob Advisor','550e8400-e29b-41d4-a716-446655440104'),
('m3333333-3333-4333-m333-333333333333',NULL,'NullOrg Coach',NULL)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, organization_id=EXCLUDED.organization_id;
```

**Validation**
```sql
SELECT 'cnt_contents' AS t, count(*) total, count(organization_id) with_org FROM public.cnt_contents
UNION ALL
SELECT 'cnt_resources', count(*), count(organization_id) FROM public.cnt_resources
UNION ALL
SELECT 'comm_mentors', count(*), count(organization_id) FROM public.comm_mentors;
```

---

## 4) Minimal Workflow seeds (wf_*)
> Optional, only if you want workflow tables populated for UI validations.
```sql
INSERT INTO public.wf_review_templates (id, template_name, content_type, workflow_steps)
VALUES ('wftpl-0011-1111-4111-aaaa-aaaaaaaaaaaa','Default Article Flow','Article', '{"steps":[{"role":"approver"},{"role":"admin"}]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wf_review_cycles (id, content_id, cycle_number, status)
VALUES ('wfcyc-0011-1111-4111-aaaa-aaaaaaaaaaaa','c1111111-1111-4111-c111-111111111111',1,'Draft')
ON CONFLICT (id) DO NOTHING;
```

---

## 5) RLS visibility smoke tests
> Run one block per org to confirm isolation works. (Service role will see all rows.)

```sql
-- Enterprise
SET LOCAL jwt.claims.organization_name = 'enterpriseorg';
SELECT 'eco_business_directory' AS t, count(*) FROM public.eco_business_directory
UNION ALL SELECT 'eco_zones', count(*) FROM public.eco_zones
UNION ALL SELECT 'eco_growth_areas', count(*) FROM public.eco_growth_areas
UNION ALL SELECT 'cnt_contents', count(*) FROM public.cnt_contents
UNION ALL SELECT 'cnt_resources', count(*) FROM public.cnt_resources
UNION ALL SELECT 'comm_mentors', count(*) FROM public.comm_mentors;

-- Partner 1
RESET ALL; SET row_security = on; SET LOCAL jwt.claims.organization_name = 'partner1org';
SELECT 'eco_business_directory' AS t, count(*) FROM public.eco_business_directory
UNION ALL SELECT 'eco_zones', count(*) FROM public.eco_zones
UNION ALL SELECT 'eco_growth_areas', count(*) FROM public.eco_growth_areas
UNION ALL SELECT 'cnt_contents', count(*) FROM public.cnt_contents
UNION ALL SELECT 'cnt_resources', count(*) FROM public.cnt_resources
UNION ALL SELECT 'comm_mentors', count(*) FROM public.comm_mentors;
```

**Drill‑down example**
```sql
SET LOCAL jwt.claims.organization_name = 'enterpriseorg';
SELECT id, organization_id, name FROM public.eco_business_directory ORDER BY name;
```

---

## 6) Edge‑case tests
- **Null‑org rows** exist by design (one per table) to verify non‑scoped/public policy behavior. Your RLS currently restricts to org rows; expect these to be invisible for normal users unless a specific public policy is in place.
- **Cross‑org visibility**: should always be 0 for a given claim unless a special policy (e.g., staff/platform) permits.

---

## 7) Rollback (dev only)
```sql
-- Remove all seeded rows while keeping schema
DELETE FROM public.comm_mentors        WHERE id IN ('m1111111-1111-4111-m111-111111111111','m2222222-2222-4222-m222-222222222222','m3333333-3333-4333-m333-333333333333');
DELETE FROM public.cnt_resources       WHERE id IN ('r1111111-1111-4111-r111-111111111111','r2222222-2222-4222-r222-222222222222','r3333333-3333-4333-r333-333333333333');
DELETE FROM public.cnt_contents        WHERE id IN ('c1111111-1111-4111-c111-111111111111','c2222222-2222-4222-c222-222222222222','c3333333-3333-4333-c333-333333333333');
DELETE FROM public.eco_growth_areas    WHERE id IN ('b1111111-1111-4111-b111-111111111111','b2222222-2222-4222-b222-222222222222','b3333333-3333-4333-b333-333333333333','b4444444-4444-4444-b444-444444444444');
DELETE FROM public.eco_zones           WHERE id IN ('a1111111-1111-4111-a111-111111111111','a2222222-2222-4222-a222-222222222222','a3333333-3333-4333-a333-333333333333','a4444444-4444-4444-a444-444444444444');
DELETE FROM public.eco_business_directory WHERE id IN ('d5877f57-58f0-4944-924e-89973bc1c956','2df46789-39cb-4477-b6de-0f6535ae5c84','c684c876-7793-4870-b442-ea73b3ef857d','f120c6c8-ba3f-44a5-bc1e-ac7a7f302093','6577f498-b3df-40c7-9114-d589cfe16e21','f1dc718f-13d8-4305-9ad6-8e7c0cf81c2c');
DELETE FROM public.auth_user_profiles  WHERE (user_id, organization_id) IN (
  ('0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a','550e8400-e29b-41d4-a716-446655440100'),
  ('f600ecae-5ece-4330-a923-c545cb4e241e','550e8400-e29b-41d4-a716-446655440100'),
  ('805d92b8-6b12-45ae-add0-09ba3f184a78','550e8400-e29b-41d4-a716-446655440100'),
  ('503c8a9f-c691-4737-b5bf-0839d239132d','550e8400-e29b-41d4-a716-446655440101'),
  ('63228904-8bd1-433c-82ef-f45b21abf66a','550e8400-e29b-41d4-a716-446655440101'),
  ('1af8e966-fafb-428f-8630-f8f6d478c8c0','550e8400-e29b-41d4-a716-446655440101'),
  ('e1548f12-3f88-4a2c-aca4-2949b43b5d68','550e8400-e29b-41d4-a716-446655440101'),
  ('eabe347f-db50-4001-9b0d-f7e8a5b841ec','550e8400-e29b-41d4-a716-446655440102'),
  ('643e0088-1eb3-41b1-aa78-3a422aa9e960','550e8400-e29b-41d4-a716-446655440102'),
  ('f4ed8c21-812e-4312-9ba7-60b5670eae55','550e8400-e29b-41d4-a716-446655440103'),
  ('3d509337-f96c-45a7-b196-c786afa14761','550e8400-e29b-41d4-a716-446655440106'),
  ('afc8667b-2742-4b43-9359-dfc717778714','550e8400-e29b-41d4-a716-446655440104'),
  ('2a7eb534-1ca0-4920-81f2-009d864a57e6','550e8400-e29b-41d4-a716-446655440104'),
  ('3f9299c7-8314-49c2-870f-ec9028ae8768','550e8400-e29b-41d4-a716-446655440105'),
  ('461fd697-3e2f-489d-9394-b2859c336edc','550e8400-e29b-41d4-a716-446655440105'),
  ('bcbd6ace-9ca4-4090-bd19-6febcd8992e7',NULL)
);
DELETE FROM public.auth_users WHERE id IN (
  '0cb38d45-5d28-4ff3-a4d1-a5e1bdd1109a','f600ecae-5ece-4330-a923-c545cb4e241e','805d92b8-6b12-45ae-add0-09ba3f184a78','503c8a9f-c691-4737-b5bf-0839d239132d','63228904-8bd1-433c-82ef-f45b21abf66a','1af8e966-fafb-428f-8630-f8f6d478c8c0','e1548f12-3f88-4a2c-aca4-2949b43b5d68','eabe347f-db50-4001-9b0d-f7e8a5b841ec','643e0088-1eb3-41b1-aa78-3a422aa9e960','f4ed8c21-812e-4312-9ba7-60b5670eae55','3d509337-f96c-45a7-b196-c786afa14761','afc8667b-2742-4b43-9359-dfc717778714','2a7eb534-1ca0-4920-81f2-009d864a57e6','3f9299c7-8314-49c2-870f-ec9028ae8768','461fd697-3e2f-489d-9394-b2859c336edc','bcbd6ace-9ca4-4090-bd19-6febcd8992e7'
);
DELETE FROM public.auth_organizations WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440100','550e8400-e29b-41d4-a716-446655440101','550e8400-e29b-41d4-a716-446655440102','550e8400-e29b-41d4-a716-446655440103','550e8400-e29b-41d4-a716-446655440104','550e8400-e29b-41d4-a716-446655440105','550e8400-e29b-41d4-a716-446655440106'
);
```

---

## 8) Tips for adding more seed data later
- **Keep one null‑org row** for each table to test policy behavior.
- Use **deterministic UUIDs** (or reserved ranges) for easier rollbacks.
- Prefer **`ON CONFLICT DO UPDATE`** seeds; your CI can replay without side effects.
- After seeding, run **RLS smoke tests** (Section 5) for at least two orgs.

---

**End of Playbook.**  Use this as your base for adding scenarios (e.g., more services, more growth areas), and keep the IDs stable across environments for simpler fixtures & e2e tests.

