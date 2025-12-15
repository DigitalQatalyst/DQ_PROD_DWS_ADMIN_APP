# RLS Validation Test Runner (PowerShell)
# This script runs the RLS validation tests with proper environment setup

Write-Host "🧪 Starting RLS Validation Tests..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if .env.test exists
if (-not (Test-Path ".env.test")) {
    Write-Host "❌ Error: .env.test file not found!" -ForegroundColor Red
    Write-Host "Please create .env.test with the following variables:" -ForegroundColor Yellow
    Write-Host "SUPABASE_URL=your_supabase_project_url" -ForegroundColor Yellow
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key" -ForegroundColor Yellow
    Write-Host "NODE_ENV=test" -ForegroundColor Yellow
    Write-Host "MOCK_MODE=false" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env.test
Get-Content ".env.test" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Check if required environment variables are set
$supabaseUrl = [Environment]::GetEnvironmentVariable("SUPABASE_URL")
$supabaseKey = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY")

if ([string]::IsNullOrEmpty($supabaseUrl) -or [string]::IsNullOrEmpty($supabaseKey)) {
    Write-Host "❌ Error: Required environment variables not set!" -ForegroundColor Red
    Write-Host "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.test" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "📊 Supabase URL: $supabaseUrl" -ForegroundColor White
Write-Host "🔑 Service Role Key: $($supabaseKey.Substring(0, [Math]::Min(20, $supabaseKey.Length)))..." -ForegroundColor White

# Run the tests
Write-Host ""
Write-Host "🚀 Running RLS validation tests..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

npm test -- tests/rbac/rlsValidationLive.test.ts --verbose

Write-Host ""
Write-Host "✅ RLS validation tests completed!" -ForegroundColor Green
Write-Host "Check the output above for test results and summary." -ForegroundColor White
