# PowerShell script to seed transformed data into new Supabase database
# Usage: .\scripts\seed-transformed-data.ps1 -DatabaseUrl "postgresql://..." -DataFile "database/dumps/data_transformed.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$DataFile,
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Seed Transformed Data into Database" -ForegroundColor Cyan
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

# Check if data file exists
if (-not (Test-Path $DataFile)) {
    Write-Host "ERROR: Data file not found: $DataFile" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database URL: $($DatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
Write-Host "  Data File: $DataFile" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "ERROR: psql not found in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools." -ForegroundColor Yellow
    exit 1
}

# Ask for confirmation
Write-Host "WARNING: This will insert data into the database." -ForegroundColor Yellow
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "  1. Backed up the current database" -ForegroundColor Gray
Write-Host "  2. Verified the data file is correct" -ForegroundColor Gray
Write-Host "  3. Tested the transformation script" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Seeding data..." -ForegroundColor Cyan
Write-Host ""

try {
    # Read and execute SQL file
    $sqlContent = Get-Content $DataFile -Raw -Encoding UTF8
    
    # Execute using psql
    $sqlContent | & psql $DatabaseUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Data seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Data seeding failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error seeding data: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Data Seeding Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

