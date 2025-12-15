# Start the API Server
# PowerShell script to start the backend API with tsx

Write-Host "Starting API Server..." -ForegroundColor Green
Write-Host ""

# Load environment variables from .env.local
if (Test-Path "../.env.local") {
    Write-Host "Loading environment variables from .env.local" -ForegroundColor Yellow
    Get-Content "../.env.local" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}

# Check if required env vars are set
if (-not $env:SUPABASE_SERVICE_ROLE_KEY -or $env:SUPABASE_SERVICE_ROLE_KEY -eq 'your-service-role-key-here') {
    Write-Host "`nWARNING: SUPABASE_SERVICE_ROLE_KEY is not configured!" -ForegroundColor Red
    Write-Host "The server will start but federated identity login will fail." -ForegroundColor Yellow
    Write-Host ""
}

# Set default values if not set
if (-not $env:PORT) { $env:PORT = "3001" }
if (-not $env:JWT_SECRET) { $env:JWT_SECRET = "52sdrQaVIjUpjHsOMPaUbQCXgAwsI42AM3vz6PYfMs" }

Write-Host "Environment:" -ForegroundColor Cyan
Write-Host "  PORT: $env:PORT"
Write-Host "  SUPABASE_URL: $env:SUPABASE_URL"
Write-Host "  JWT_SECRET: **** (configured)"
Write-Host ""

# Start the server
Write-Host "Starting server on port $env:PORT..." -ForegroundColor Green
Write-Host ""

npx tsx server.ts

