# RLS Validation Test Setup Instructions

## Quick Setup

The RLS validation tests are now configured to run gracefully without requiring Supabase credentials by default.

### Option 1: Run Tests Without Supabase (Default)

The tests will automatically skip if Supabase is not configured:

```bash
npm test -- tests/rbac/rlsValidationLive.test.ts
```

You'll see output like:
```
⚠️ Skipping RLS validation tests - Supabase not configured
💡 To run these tests, set REQUIRE_SUPABASE=true and provide Supabase credentials
```

### Option 2: Run Tests With Supabase

To run the actual RLS validation tests:

1. **Create a `.env.test` file** in the project root:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REQUIRE_SUPABASE=true
NODE_ENV=test
```

2. **Run the tests**:
```bash
npm test -- tests/rbac/rlsValidationLive.test.ts
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Determines if Supabase tests run | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Determines if Supabase tests run | Your Supabase service role key |
| `REQUIRE_SUPABASE` | Optional | Set to `true` to require Supabase for tests |
| `NODE_ENV` | Optional | Set to `test` for test environment |

## Test Behavior

- **Without Supabase credentials**: Tests skip gracefully with informative messages
- **With Supabase credentials**: Tests run and validate RLS policies
- **With `REQUIRE_SUPABASE=true`**: Tests will fail if Supabase is not configured

## Troubleshooting

### Test Skipping When You Want Them to Run

If tests are skipping when you want them to run:

1. Check that `.env.test` file exists
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Ensure the values are correct (no extra spaces, quotes, etc.)

### Tests Failing When They Should Skip

If tests are failing instead of skipping:

1. Check that environment variables are not set
2. Verify `REQUIRE_SUPABASE` is not set to `true`
3. Ensure the test file is properly configured

## Example Output

### With Supabase Configured:
```
🧪 Starting RLS Validation Live Tests...
📊 Testing with live Supabase data and RLS policies

👤 Testing Staff User: admin@digitalqatalyst.com
  📋 contents: 5 records
  📋 services: 3 records
  ...

✅ Staff: 25 records (multi-org access)
✅ Partner: 8 records (single-org access)
✅ Enterprise: 0 records (access restricted)
```

### Without Supabase Configured:
```
🧪 Starting RLS Validation Live Tests...
📊 Testing with live Supabase data and RLS policies
⚠️ Skipping RLS validation tests - Supabase not configured
💡 To run these tests, set REQUIRE_SUPABASE=true and provide Supabase credentials
```
