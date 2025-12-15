# RLS Validation Live Tests

This directory contains automated tests to validate that Supabase Row Level Security (RLS) and RBAC rules are functioning correctly with live data.

## Test Overview

The `rlsValidationLive.test.ts` file tests three user scenarios:

1. **Staff User (DigitalQatalyst)** - Should see records across multiple organizations
2. **Partner User (Beta Industries)** - Should see only records with matching organisation_id
3. **Enterprise User (Enterprise Corp)** - Should see 0 records or get 403 error

## Setup Instructions

### 1. Environment Configuration

Create a `.env.test` file in the project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Test Mode Configuration
NODE_ENV=test
MOCK_MODE=false
```

### 2. Database Setup

Ensure the following are applied to your Supabase database:

1. **RLS Policies**: Run the RLS migration file:
   ```sql
   -- Apply the RLS policies
   \i database/migrations/2025-01-rls-v2-org-aware.sql
   ```

2. **Test Helper Functions**: Run the test helper migration:
   ```sql
   -- Apply the test helper functions
   \i database/migrations/2025-01-rls-test-helper.sql
   ```

3. **Test Data**: Run the seed data:
   ```sql
   -- Apply the test data
   \i database/db.seed.fixed.sql
   ```

### 3. Running the Tests

```bash
# Run all tests
npm test

# Run only RLS validation tests
npm test -- tests/rbac/rlsValidationLive.test.ts

# Run with verbose output
npm test -- --verbose tests/rbac/rlsValidationLive.test.ts
```

## Expected Results

The tests should produce output similar to:

```
📊 RLS Validation Summary:
================================
✅ Staff: 25 records (multi-org access)
✅ Partner: 8 records (single-org access)
✅ Enterprise: 0 records (access restricted)

🎯 RLS Policy Validation:
- Staff users can access records from multiple organizations: ✅
- Partner users can only access their organization's records: ✅
- Enterprise users are blocked from accessing records: ✅
```

## Test Tables

The tests validate RLS policies on the following tables:

- `contents`
- `services` (mktplc_services)
- `eco_business_directory`
- `eco_growth_areas`
- `eco_zones`

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure `.env.test` file exists with correct Supabase credentials
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **Database Connection Issues**
   - Check that Supabase project is accessible
   - Verify service role key has proper permissions

3. **RLS Policies Not Applied**
   - Ensure RLS migration has been run
   - Check that RLS is enabled on all test tables

4. **Test Data Missing**
   - Ensure seed data has been applied
   - Verify test organizations and users exist

### Debug Mode

To enable debug mode, set the following environment variable:

```env
DEBUG=true
```

This will show additional console output during test execution.

## Test Structure

```
tests/rbac/
├── README.md                    # This file
├── rlsValidationLive.test.ts    # Main test file
└── fixtures/                    # Test fixtures (if needed)
    └── mockTokens.ts           # Mock token definitions
```