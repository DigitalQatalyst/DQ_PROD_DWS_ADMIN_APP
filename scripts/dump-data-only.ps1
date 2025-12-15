# PowerShell script to dump data-only from Supabase database
# Usage: .\scripts\dump-data-only.ps1 -DatabaseUrl "postgresql://..." -OutputFile "database/dumps/data_old_db.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [string]$OutputFile = "",
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Supabase Database Data-Only Dump" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Handle password in URL if present
if ($DatabaseUrl -match '\$encPwd') {
    if (-not $DatabasePassword) {
        $securePassword = Read-Host "Enter database password" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $DatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    Add-Type -AssemblyName System.Web -ErrorAction SilentlyContinue
    if ([System.Web.HttpUtility]) {
        $encodedPassword = [System.Web.HttpUtility]::UrlEncode($DatabasePassword)
    } else {
        $encodedPassword = $DatabasePassword -replace ' ', '%20' -replace '#', '%23' -replace '\$', '%24' -replace '&', '%26' -replace "'", '%27' -replace '\(', '%28' -replace '\)', '%29' -replace '\*', '%2A' -replace '\+', '%2B' -replace ',', '%2C' -replace '/', '%2F' -replace ':', '%3A' -replace ';', '%3B' -replace '=', '%3D' -replace '\?', '%3F' -replace '@', '%40' -replace '\[', '%5B' -replace '\]', '%5D'
    }
    $DatabaseUrl = $DatabaseUrl -replace '\$encPwd', $encodedPassword
} elseif ($DatabasePassword) {
    $env:PGPASSWORD = $DatabasePassword
}

# Set default output file if not provided
if (-not $OutputFile) {
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $OutputFile = "database/dumps/data_old_db_${timestamp}.sql"
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database URL: $($DatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
Write-Host "  Output File: $OutputFile" -ForegroundColor Gray
Write-Host ""

# Check if pg_dump is available
try {
    $null = Get-Command pg_dump -ErrorAction Stop
} catch {
    Write-Host "ERROR: pg_dump not found in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools." -ForegroundColor Yellow
    exit 1
}

# Create dump directory if it doesn't exist
$dumpDir = Split-Path -Parent $OutputFile
if (-not (Test-Path $dumpDir)) {
    New-Item -ItemType Directory -Path $dumpDir -Force | Out-Null
    Write-Host "Created directory: $dumpDir" -ForegroundColor Gray
    Write-Host ""
}

# Dump data only (no schema)
Write-Host "Dumping data (no schema)..." -ForegroundColor Cyan
Write-Host "  This may take a few moments..." -ForegroundColor Gray
Write-Host ""

try {
    # Run pg_dump with data-only flags
    $pgDumpArgs = @(
        $DatabaseUrl,
        "--data-only",             # Data only, no schema
        "--no-owner",              # Don't include ownership commands
        "--no-acl",                # Don't include ACL (permissions)
        "--verbose",               # Verbose output
        "--file=$OutputFile",
        "--schema=public"         # Only public schema
    )
    
    & pg_dump $pgDumpArgs
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $OutputFile).Length / 1KB
        Write-Host ""
        Write-Host "[SUCCESS] Data dump created successfully!" -ForegroundColor Green
        Write-Host "  File: $OutputFile" -ForegroundColor Gray
        Write-Host "  Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Data dump includes:" -ForegroundColor Cyan
        Write-Host "  - media_items" -ForegroundColor Gray
        Write-Host "  - articles, videos, podcasts, reports, tools, events" -ForegroundColor Gray
        Write-Host "  - taxonomies" -ForegroundColor Gray
        Write-Host "  - media_taxonomies" -ForegroundColor Gray
        Write-Host "  - media_assets" -ForegroundColor Gray
        Write-Host "  - media_views" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "[ERROR] Data dump failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error creating data dump: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Data Dump Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

