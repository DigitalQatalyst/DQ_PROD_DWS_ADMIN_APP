# PowerShell script to dump Supabase database schema
# Usage: 
#   .\scripts\dump-schema.ps1 -DatabaseUrl "postgresql://postgres.nywlgmvnpaeemyxlhttx:$encPwd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
#   OR
#   .\scripts\dump-schema.ps1 -ProjectRef "nywlgmvnpaeemyxlhttx" -DatabasePassword "your-password"

param(
    [string]$ProjectRef = "nywlgmvnpaeemyxlhttx",
    
    [string]$OutputFile = "",
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD,
    
    [string]$DatabaseUrl = "",
    
    [string]$PoolerRegion = "aws-1-ap-southeast-1"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Supabase Database Schema Dump" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Build connection string
if ($DatabaseUrl) {
    # Use provided connection URL directly
    Write-Host "Using provided database URL" -ForegroundColor Green
    # Extract password from URL if present, or use PGPASSWORD
    if ($DatabaseUrl -match '\$encPwd') {
        # Password is in URL as $encPwd variable - need to replace it
        if (-not $DatabasePassword) {
            $securePassword = Read-Host "Enter database password" -AsSecureString
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
            $DatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        }
        # URL encode password for connection string
        Add-Type -AssemblyName System.Web -ErrorAction SilentlyContinue
        if ([System.Web.HttpUtility]) {
            $encodedPassword = [System.Web.HttpUtility]::UrlEncode($DatabasePassword)
        } else {
            # Fallback if System.Web not available - basic encoding
            $encodedPassword = $DatabasePassword -replace ' ', '%20' -replace '#', '%23' -replace '\$', '%24' -replace '&', '%26' -replace "'", '%27' -replace '\(', '%28' -replace '\)', '%29' -replace '\*', '%2A' -replace '\+', '%2B' -replace ',', '%2C' -replace '/', '%2F' -replace ':', '%3A' -replace ';', '%3B' -replace '=', '%3D' -replace '\?', '%3F' -replace '@', '%40' -replace '\[', '%5B' -replace '\]', '%5D'
        }
        $DatabaseUrl = $DatabaseUrl -replace '\$encPwd', $encodedPassword
    } else {
        # Password might be in URL already, or use PGPASSWORD
        if ($DatabasePassword) {
            $env:PGPASSWORD = $DatabasePassword
        }
    }
} else {
    # Build pooler connection string
    $dbUser = "postgres.$ProjectRef"
    $dbHost = "$PoolerRegion.pooler.supabase.com"
    $dbName = "postgres"
    $dbPort = "6543"
    
    # Get password if not provided
    if (-not $DatabasePassword) {
        Write-Host "Database password required for: $dbHost" -ForegroundColor Yellow
        $securePassword = Read-Host "Enter database password" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $DatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    
    # URL encode password for connection string
    Add-Type -AssemblyName System.Web
    $encodedPassword = [System.Web.HttpUtility]::UrlEncode($DatabasePassword)
    
    # Build pooler connection URL
    $DatabaseUrl = "postgresql://$dbUser`:$encodedPassword@$dbHost`:$dbPort/$dbName`?sslmode=require&pgbouncer=true"
}

# Set default output file if not provided
if (-not $OutputFile) {
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $projectName = if ($ProjectRef) { $ProjectRef } else { "supabase" }
    $OutputFile = "database/dumps/schema_${projectName}_${timestamp}.sql"
}

Write-Host "Configuration:" -ForegroundColor Green
if ($ProjectRef) {
    Write-Host "  Project Reference: $ProjectRef" -ForegroundColor Gray
}
Write-Host "  Database URL: $($DatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
Write-Host "  Output File: $OutputFile" -ForegroundColor Gray
Write-Host ""

# Check if pg_dump is available
$pgDumpAvailable = $false
try {
    $null = Get-Command pg_dump -ErrorAction Stop
    $pgDumpAvailable = $true
} catch {
    Write-Host "ERROR: pg_dump not found in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "  - Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "  - Or use Chocolatey: choco install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, add PostgreSQL bin directory to your PATH." -ForegroundColor Yellow
    exit 1
}

# Create dump directory if it doesn't exist
$dumpDir = Split-Path -Parent $OutputFile
if (-not (Test-Path $dumpDir)) {
    New-Item -ItemType Directory -Path $dumpDir -Force | Out-Null
    Write-Host "Created directory: $dumpDir" -ForegroundColor Gray
    Write-Host ""
}

# Dump schema only
Write-Host "Dumping database schema..." -ForegroundColor Cyan
Write-Host "  This may take a few moments..." -ForegroundColor Gray
Write-Host ""

try {
    # Run pg_dump with schema-only flags
    $pgDumpArgs = @(
        $DatabaseUrl,
        "--schema-only",           # Schema only, no data
        "--no-owner",              # Don't include ownership commands
        "--no-acl",                # Don't include ACL (permissions)
        "--verbose",               # Verbose output
        "--file=$OutputFile"
    )
    
    & pg_dump $pgDumpArgs
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $OutputFile).Length / 1KB
        Write-Host ""
        Write-Host "[SUCCESS] Schema dump created successfully!" -ForegroundColor Green
        Write-Host "  File: $OutputFile" -ForegroundColor Gray
        Write-Host "  Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Schema dump includes:" -ForegroundColor Cyan
        Write-Host "  - Table definitions" -ForegroundColor Gray
        Write-Host "  - Views" -ForegroundColor Gray
        Write-Host "  - Functions" -ForegroundColor Gray
        Write-Host "  - Triggers" -ForegroundColor Gray
        Write-Host "  - Indexes" -ForegroundColor Gray
        Write-Host "  - Constraints" -ForegroundColor Gray
        Write-Host "  - Sequences" -ForegroundColor Gray
        Write-Host "  - RLS policies" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "[ERROR] Schema dump failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  - Incorrect password" -ForegroundColor Gray
        Write-Host "  - Network connectivity issues" -ForegroundColor Gray
        Write-Host "  - Database server not accessible" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error creating schema dump: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Schema Dump Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

