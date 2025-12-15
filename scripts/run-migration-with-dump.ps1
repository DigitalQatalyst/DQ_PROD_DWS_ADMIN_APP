# PowerShell script to dump Supabase database and run migration
# Usage: .\scripts\run-migration-with-dump.ps1

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$MigrationFile = "supabase/migrations/20251105091500_kh_blend_into_cnt.sql",
    [string]$DumpFile = "database/dumps/db_dump_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Supabase Database Migration Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is provided
if (-not $DatabaseUrl) {
    Write-Host "DATABASE_URL not found in environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please provide your Supabase database connection string:" -ForegroundColor Yellow
    Write-Host "Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -ForegroundColor Gray
    Write-Host ""
    $DatabaseUrl = Read-Host "Enter DATABASE_URL (or press Enter to skip dump and use Supabase Dashboard)"
    
    if (-not $DatabaseUrl) {
        Write-Host ""
        Write-Host "Skipping database dump. To run migration manually:" -ForegroundColor Yellow
        Write-Host "1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
        Write-Host "2. Copy contents of: $MigrationFile" -ForegroundColor White
        Write-Host "3. Paste and run in SQL Editor" -ForegroundColor White
        exit 0
    }
}

# Check if migration file exists
if (-not (Test-Path $MigrationFile)) {
    Write-Host "ERROR: Migration file not found: $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Migration File: $MigrationFile" -ForegroundColor Gray
Write-Host "  Dump File: $DumpFile" -ForegroundColor Gray
Write-Host ""

# Check if pg_dump is available
$pgDumpAvailable = $false
try {
    $null = Get-Command pg_dump -ErrorAction Stop
    $pgDumpAvailable = $true
} catch {
    Write-Host "WARNING: pg_dump not found in PATH." -ForegroundColor Yellow
    Write-Host "  Install PostgreSQL client tools or skip dump." -ForegroundColor Gray
}

# Check if psql is available
$psqlAvailable = $false
try {
    $null = Get-Command psql -ErrorAction Stop
    $psqlAvailable = $true
} catch {
    Write-Host "WARNING: psql not found in PATH." -ForegroundColor Yellow
    Write-Host "  Install PostgreSQL client tools to run migration automatically." -ForegroundColor Gray
}

Write-Host ""

# Step 1: Create database dump
if ($pgDumpAvailable) {
    Write-Host "Step 1: Creating database dump..." -ForegroundColor Cyan
    
    # Create dump directory if it doesn't exist
    $dumpDir = Split-Path -Parent $DumpFile
    if (-not (Test-Path $dumpDir)) {
        New-Item -ItemType Directory -Path $dumpDir -Force | Out-Null
        Write-Host "  Created directory: $dumpDir" -ForegroundColor Gray
    }
    
    try {
        # Run pg_dump
        $pgDumpArgs = @(
            $DatabaseUrl,
            "--no-owner",
            "--no-acl",
            "--file=$DumpFile"
        )
        
        Write-Host "  Running: pg_dump [connection string] --no-owner --no-acl --file=$DumpFile" -ForegroundColor Gray
        & pg_dump $pgDumpArgs
        
        if ($LASTEXITCODE -eq 0) {
            $fileSize = (Get-Item $DumpFile).Length / 1MB
            Write-Host "  ✓ Database dump created successfully: $DumpFile ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Database dump failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "  ✗ Error creating dump: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Step 1: Skipping database dump (pg_dump not available)" -ForegroundColor Yellow
    Write-Host "  To create a dump manually:" -ForegroundColor Gray
    Write-Host "    pg_dump `"$DatabaseUrl`" --no-owner --no-acl --file=$DumpFile" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Run migration
if ($psqlAvailable) {
    Write-Host "Step 2: Running migration..." -ForegroundColor Cyan
    
    try {
        # Read migration file content
        $migrationContent = Get-Content $MigrationFile -Raw -Encoding UTF8
        
        Write-Host "  Reading migration file: $MigrationFile" -ForegroundColor Gray
        
        # Run migration using psql
        Write-Host "  Executing migration..." -ForegroundColor Gray
        $migrationContent | & psql $DatabaseUrl
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Migration applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            Write-Host "  Check the error messages above for details." -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "  ✗ Error running migration: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Step 2: Cannot run migration automatically (psql not available)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To run the migration manually:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
    Write-Host "2. Copy contents of: $MigrationFile" -ForegroundColor White
    Write-Host "3. Paste and run in SQL Editor" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install PostgreSQL client tools and run:" -ForegroundColor Gray
    Write-Host "  psql `"$DatabaseUrl`" -f $MigrationFile" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Process Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan









