#!/bin/bash

# RLS Validation Test Runner
# This script runs the RLS validation tests with proper environment setup

echo "🧪 Starting RLS Validation Tests..."
echo "=================================="

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo "❌ Error: .env.test file not found!"
    echo "Please create .env.test with the following variables:"
    echo "SUPABASE_URL=your_supabase_project_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    echo "NODE_ENV=test"
    echo "MOCK_MODE=false"
    exit 1
fi

# Load environment variables
export $(cat .env.test | grep -v '^#' | xargs)

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set!"
    echo "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.test"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📊 Supabase URL: $SUPABASE_URL"
echo "🔑 Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Run the tests
echo ""
echo "🚀 Running RLS validation tests..."
echo "=================================="

npm test -- tests/rbac/rlsValidationLive.test.ts --verbose

echo ""
echo "✅ RLS validation tests completed!"
echo "Check the output above for test results and summary."
