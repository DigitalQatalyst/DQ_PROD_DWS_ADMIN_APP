# Platform Admin Dashboard - Documentations

Welcome to the Platform Admin Dashboard documentation. This directory contains comprehensive guides, references, and implementation history.

## Quick Navigation

### Getting Started
- **[SETUP.md](./SETUP.md)** - Installation, environment configuration, and quick start guide

### Architecture & Design
- **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - System architecture and design patterns
- **[PRODUCTION_SESSION_ARCHITECTURE.md](./architecture/PRODUCTION_SESSION_ARCHITECTURE.md)** - Production session management

### Identity & Access Management (IAM)
- **[README.md](./iam/README.md)** - IAM documentation index
- **[PERMISSIONS_REFERENCE.md](./iam/PERMISSIONS_REFERENCE.md)** ⭐ - Complete RBAC permissions matrix
- **[CASL_AUTHORIZATION_GUIDE.md](./iam/CASL_AUTHORIZATION_GUIDE.md)** - CASL authorization implementation
- **[RBAC_CLAIMS_CONFIGURATION.md](./iam/RBAC_CLAIMS_CONFIGURATION.md)** - RBAC claims configuration
- **[RBAC_PROGRESSIVE_DESIGN.md](./iam/RBAC_PROGRESSIVE_DESIGN.md)** - Progressive permissions design
- **[AZURE_CLAIMS_REFERENCE.md](./iam/AZURE_CLAIMS_REFERENCE.md)** - Azure claims reference
- **[FEDERATED_IDENTITY_IMPLEMENTATION.md](./iam/FEDERATED_IDENTITY_IMPLEMENTATION.md)** - Federated identity authentication
- **[FEDERATED_IDENTITY_TROUBLESHOOTING.md](./iam/FEDERATED_IDENTITY_TROUBLESHOOTING.md)** - Troubleshooting federated identity issues

### Database Documentation
- **[SCHEMA_REFERENCE.md](./database/SCHEMA_REFERENCE.md)** - **AUTHORITATIVE** current schema reference
- **[DATA_DICTIONARY.md](./database/DATA_DICTIONARY.md)** - Complete data dictionary
- **[DATABASE_MIGRATION_EXECUTION_GUIDE.md](./database/DATABASE_MIGRATION_EXECUTION_GUIDE.md)** - How to run migrations
- **[db_doc_1_current_schema_rls_detailed.md](./database/db_doc_1_current_schema_rls_detailed.md)** - Detailed RLS documentation
- **[db_doc_2_developer_integration_guide.md](./database/db_doc_2_developer_integration_guide.md)** - Developer integration guide
- **[db_doc_3_seed_data_playbook_idempotent_rls_aware.md](./database/db_doc_3_seed_data_playbook_idempotent_rls_aware.md)** - Seed data playbook
- **[db_doc_4_ops_migration_playbook_rls_fks_seeds_env.md](./database/db_doc_4_ops_migration_playbook_rls_fks_seeds_env.md)** - Operations migration guide

### Identity & Access Management
- **[PERMISSIONS_REFERENCE.md](./iam/PERMISSIONS_REFERENCE.md)** - **CURRENT** RBAC permissions matrix
- **[CASL_AUTHORIZATION_GUIDE.md](./iam/CASL_AUTHORIZATION_GUIDE.md)** - CASL authorization implementation
- **[RBAC_CLAIMS_CONFIGURATION.md](./iam/RBAC_CLAIMS_CONFIGURATION.md)** - RBAC claims configuration
- **[AZURE_CLAIMS_REFERENCE.md](./iam/AZURE_CLAIMS_REFERENCE.md)** - Azure claims reference
- **[FEDERATED_IDENTITY_IMPLEMENTATION.md](./iam/FEDERATED_IDENTITY_IMPLEMENTATION.md)** - Federated identity authentication
- **[FEDERATED_IDENTITY_TROUBLESHOOTING.md](./iam/FEDERATED_IDENTITY_TROUBLESHOOTING.md)** - Troubleshooting federated identity issues

### History & Implementation
- **[CHANGELOG.md](./CHANGELOG.md)** - Implementation history and major changes

## Directory Structure

```
docs/
├── README.md (this file)
├── SETUP.md
├── CHANGELOG.md
├── architecture/
│   ├── ARCHITECTURE.md
│   └── PRODUCTION_SESSION_ARCHITECTURE.md
├── iam/ ⭐ Identity & Access Management
│   ├── PERMISSIONS_REFERENCE.md ⭐ CURRENT RBAC
│   ├── CASL_AUTHORIZATION_GUIDE.md
│   ├── RBAC_CLAIMS_CONFIGURATION.md
│   ├── AZURE_CLAIMS_REFERENCE.md
│   ├── FEDERATED_IDENTITY_IMPLEMENTATION.md
│   └── FEDERATED_IDENTITY_TROUBLESHOOTING.md
├── database/
│   ├── SCHEMA_REFERENCE.md ⭐ AUTHORITATIVE
│   ├── DATA_DICTIONARY.md
│   ├── DATABASE_MIGRATION_EXECUTION_GUIDE.md
│   └── db_doc_*.md (detailed documentation)
├── guides/ (non-IAM how-to guides)
├── configuration/ (non-IAM configuration)
└── archive/ (historical implementation docs)
```

## Key Documentation Highlights

### ⭐ Most Important Documents

1. **SCHEMA_REFERENCE.md** - Authoritative current database schema
   - Documents `user_segment` column (not `customer_type`)
   - Current role constraints
   - Frontend mapping layer

2. **PERMISSIONS_REFERENCE.md** - Current RBAC system
   - Permission matrix for all user segments × roles
   - Based on actual `src/auth/ability.ts` code
   - CASL ability rules

3. **CHANGELOG.md** - Implementation history
   - Consolidates all historical implementation summaries
   - Tracks major refactorings and changes

## Current System State

### Authentication & Authorization
- **Authentication**: Azure External Identities (EEI)
- **Authorization**: Database-driven RBAC
- **Pattern**: Federated identity with internal JWT
- **Permissions**: CASL-based ability system

### Database Schema (Current)
- **User Segments**: `internal`, `partner`, `customer`, `advisor`
- **Roles**: `admin`, `editor`, `approver`, `viewer`
- **Key Table**: `auth_user_profiles` with `user_segment` column

### Frontend Mapping
- Database uses `user_segment` (migrated from `customer_type`)
- Roles normalized to 4 values (creator/contributor → editor)
- Organization-scoped access for non-internal users

## Documentation Status

⚠️ **Note**: Some documentation may reference historical implementations. For current state, refer to:
- `SCHEMA_REFERENCE.md` for database schema
- `PERMISSIONS_REFERENCE.md` for permissions
- `CHANGELOG.md` for implementation history

## Contributing to Documentation

When updating documentation:

1. **Update authoritative docs first**: SCHEMA_REFERENCE.md and PERMISSIONS_REFERENCE.md
2. **Check for accuracy**: Verify against actual codebase (`src/auth/ability.ts`, database schema)
3. **Add to CHANGELOG.md**: Document significant changes
4. **Update cross-references**: Fix links if files are moved

## Need Help?

- **Setup Issues**: See [SETUP.md](./SETUP.md) troubleshooting section
- **Authentication Problems**: See [FEDERATED_IDENTITY_TROUBLESHOOTING.md](./guides/FEDERATED_IDENTITY_TROUBLESHOOTING.md)
- **Permission Questions**: See [PERMISSIONS_REFERENCE.md](./configuration/PERMISSIONS_REFERENCE.md)
- **Schema Questions**: See [SCHEMA_REFERENCE.md](./database/SCHEMA_REFERENCE.md)

## Related Documentation

- Code-level docs: See inline JSDoc comments in source files
- API docs: See `api/routes/` directory
- Test docs: See `tests/` directory
- Architecture decision records: See implementation history in CHANGELOG.md

---

**Last Updated**: January 28, 2025  
**Documentation Version**: 2.0 (Restructured)
