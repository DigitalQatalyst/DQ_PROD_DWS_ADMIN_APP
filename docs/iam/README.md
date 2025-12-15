# Identity & Access Management (IAM) Documentation

## Overview

This directory contains all documentation related to authentication, authorization, and role-based access control (RBAC) for the Platform Admin Dashboard.

## Core IAM Documents

### Permissions & Authorization

- **[PERMISSIONS_REFERENCE.md](./PERMISSIONS_REFERENCE.md)** ⭐ **CURRENT** - Complete RBAC permissions matrix
  - Based on actual `src/auth/ability.ts` implementation
  - Permission matrix for all user segments × roles
  - CASL ability rules

### Implementation Guides

- **[CASL_AUTHORIZATION_GUIDE.md](./CASL_AUTHORIZATION_GUIDE.md)** - CASL authorization implementation
  - Type-safe permission checking
  - Component-level access control
  - Usage examples

- **[FEDERATED_IDENTITY_IMPLEMENTATION.md](./FEDERATED_IDENTITY_IMPLEMENTATION.md)** - Federated identity authentication
  - Azure EEI integration
  - Internal JWT pattern
  - Database-driven authorization

### Configuration & Claims

- **[RBAC_CLAIMS_CONFIGURATION.md](./RBAC_CLAIMS_CONFIGURATION.md)** - RBAC claims configuration
  - Required Azure claims
  - Claim validation rules
  - Access denial scenarios

- **[AZURE_CLAIMS_REFERENCE.md](./AZURE_CLAIMS_REFERENCE.md)** - Azure claims reference
  - All supported claim values
  - Claim name variations
  - Configuration steps

### Troubleshooting

- **[FEDERATED_IDENTITY_TROUBLESHOOTING.md](./FEDERATED_IDENTITY_TROUBLESHOOTING.md)** - Troubleshooting federated identity issues
  - Common issues and solutions
  - Debug checklist
  - Migration steps

## IAM System Architecture

### Authentication Flow
```
Azure EEI → Internal JWT → Database Authorization → CASL Abilities
```

### Authorization Layers
1. **Authentication**: Azure External Identities (EEI)
2. **Identity**: Supabase `auth_user_profiles` table
3. **Authorization**: CASL-based ability system
4. **Enforcement**: Component and API level checks

## Key Concepts

### User Segments
- **Database field**: `customer_type`
- **Frontend field**: `user_segment`
- **Values**: internal (staff), partner, customer (enterprise), advisor
- **Purpose**: Defines organizational relationship

### Roles
- **Database**: admin, approver, creator, contributor, viewer
- **Frontend**: admin, editor, approver, viewer
- **Normalization**: creator + contributor → editor
- **Purpose**: Defines permissions

### Schema Mapping
See [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md) for complete database-to-frontend mapping documentation.

## Quick References

- **Current permissions**: [PERMISSIONS_REFERENCE.md](./PERMISSIONS_REFERENCE.md)
- **Database schema**: [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md)
- **Setup guide**: [SETUP.md](../SETUP.md)

## Related Documentation

- [Database Schema](../database/SCHEMA_REFERENCE.md) - Auth tables and fields
- [Architecture](../architecture/ARCHITECTURE.md) - Overall system design
- [Changelog](../CHANGELOG.md) - IAM implementation history

