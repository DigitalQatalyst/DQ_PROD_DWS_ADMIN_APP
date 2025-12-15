# Database Schema Reference - Auth User Profiles

## Overview

This document provides the **authoritative reference** for the authentication and authorization schema in the Platform Admin Dashboard. It documents the actual current state of the database and how it integrates with the frontend.

## Auth User Profiles Table

### Table Name
`auth_user_profiles`

### Purpose
Stores user authorization and role information for RBAC enforcement. Links users to organizations and defines their permissions.

### Current Schema (As of latest_db_aftermigration_251028.sql)

```sql
CREATE TABLE IF NOT EXISTS "public"."auth_user_profiles" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "user_id" UUID REFERENCES auth_users(id),
    "organization_id" UUID REFERENCES organisations(id),
    "role" TEXT DEFAULT 'viewer' NOT NULL,
    "customer_type" TEXT DEFAULT 'enterprise' NOT NULL,
    "profile_data" JSONB DEFAULT '{}',
    "preferences" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT "customer_type_check" CHECK (
        "customer_type" IN ('staff','partner','enterprise','advisor')
    ),
    CONSTRAINT "role_check" CHECK (
        "role" IN ('admin','approver','creator','contributor','viewer')
    )
);
```

**Note**: There is a pending migration to rename `customer_type` to `user_segment` (`migrate_to_user_segment.sql`), but as of the latest schema backup, this change has not been applied.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Primary key |
| `user_id` | UUID | FK → auth_users | Reference to user |
| `organization_id` | UUID | FK → organisations | Reference to organization |
| `role` | TEXT | NOT NULL, CHECK | User role: `admin`, `approver`, `creator`, `contributor`, `viewer` |
| `customer_type` | TEXT | NOT NULL, CHECK | Customer type: `staff`, `partner`, `enterprise`, `advisor` |
| `profile_data` | JSONB | DEFAULT '{}' | Additional profile information |
| `preferences` | JSONB | DEFAULT '{}' | User preferences |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## Customer Types (Database Field: customer_type)

Defines **who the user is** in the system.

| Type | Description | Organization Filter | Access Level |
|------|-------------|---------------------|--------------|
| `staff` | Platform staff/admin users | None (all content) | Full platform access |
| `partner` | Service provider organizations | Own organization | Org-scoped content |
| `enterprise` | Enterprise end users | Own organization | Limited access |
| `advisor` | Consultant/advisor users | Own organization | Org-scoped content |

## Roles

Defines **what the user can do** in the system.

| Role | Permissions | Use Case |
|------|-------------|----------|
| `admin` | Full CRUD + approve/publish | System administrators |
| `approver` | Read, approve | Content reviewers |
| `creator` | Create, read, update | Content creators |
| `contributor` | Read, update | Content contributors |
| `viewer` | Read-only | Stakeholders and read-only users |

## Frontend Mapping Layer

**Critical**: The frontend TypeScript code uses **different terminology** than the database:

### Database → Frontend Mapping

**Customer Type Mapping** (database `customer_type` → frontend `user_segment`):
| Database Value | Frontend Value | Notes |
|----------------|----------------|-------|
| `staff` | `internal` | Mapped in frontend layer |
| `partner` | `partner` | No change |
| `enterprise` | `customer` | Mapped in frontend layer |
| `advisor` | `advisor` | No change |

**Role Mapping** (database roles → frontend roles):
| Database Value | Frontend Value | Notes |
|----------------|----------------|-------|
| `admin` | `admin` | No change |
| `approver` | `approver` | No change |
| `creator` | `editor` | Normalized in frontend |
| `contributor` | `editor` | Normalized in frontend |
| `viewer` | `viewer` | No change |

This mapping happens in `src/lib/federatedAuthSupabase.ts` and `src/context/AuthContext.tsx`.

### Database to Frontend Mapping

| Database Value | Frontend Value | Notes |
|----------------|----------------|-------|
| `internal` | `internal` | No change |
| `partner` | `partner` | No change |
| `customer` | `customer` | No change |
| `advisor` | `advisor` | No change |

| Database Value | Frontend Value | Notes |
|----------------|----------------|-------|
| `admin` | `admin` | No change |
| `editor` | `editor` | Normalized from `creator` + `contributor` |
| `approver` | `approver` | No change |
| `viewer` | `viewer` | No change |

## Indexes

```sql
CREATE INDEX idx_auth_user_profiles_user_segment 
    ON auth_user_profiles (user_segment);

CREATE INDEX idx_auth_user_profiles_role 
    ON auth_user_profiles (role);

CREATE INDEX idx_auth_user_profiles_segment_role 
    ON auth_user_profiles (user_segment, role);
```

## Row Level Security (RLS)

The table has RLS enabled. Policies control access based on:
- User's organization membership
- User's role permissions
- Data ownership patterns

## References

- Migration script: `database/migrations/migrate_to_user_segment.sql`
- Frontend types: `src/types/index.ts`
- CASL ability rules: `src/auth/ability.ts`
- Authorization context: `src/context/AuthContext.tsx`

