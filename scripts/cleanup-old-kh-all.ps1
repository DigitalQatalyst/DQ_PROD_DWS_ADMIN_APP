# PowerShell script to clean up old KnowledgeHub functions, views, and tables
# Usage: .\scripts\cleanup-old-kh-all.ps1 -DatabaseUrl "postgresql://..."

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD,
    
    [switch]$SkipFunctions,
    [switch]$SkipTables,
    [switch]$DryRun
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Old KnowledgeHub Cleanup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Handle password
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
        $encodedPassword = $DatabasePassword -replace ' ', '%20' -replace '#', '%23' -replace '\$', '%24' -replace '&', '%26'
    }
    $DatabaseUrl = $DatabaseUrl -replace '\$encPwd', $encodedPassword
} elseif ($DatabasePassword) {
    $env:PGPASSWORD = $DatabasePassword
}

# Parse connection parameters
function Get-PsqlConnectionParams-Local {
    param([string]$DatabaseUrl, [string]$Password)
    $env:PGPASSWORD = $Password
    if ($DatabaseUrl -match '^postgresql://([^:]+)(?::[^@]+)?@([^/]+)(?:/(.+?))?(?:\?.*)?$') {
        $user = $Matches[1]
        $hostPort = $Matches[2]
        $database = if ($Matches[3]) { $Matches[3] } else { "postgres" }
        if ($hostPort -match '^([^:]+)(?::(\d+))?$') {
            return @{
                Host = $Matches[1]
                Port = if ($Matches[2]) { $Matches[2] } else { "5432" }
                User = $user
                Database = $database
            }
        }
    }
    return $null
}

$connParams = Get-PsqlConnectionParams-Local -DatabaseUrl $DatabaseUrl -Password $DatabasePassword

if (-not $connParams) {
    Write-Host "ERROR: Could not parse database URL" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database: $($connParams.Host):$($connParams.Port)/$($connParams.Database)" -ForegroundColor Gray
Write-Host "  Skip Functions: $SkipFunctions" -ForegroundColor Gray
Write-Host "  Skip Tables: $SkipTables" -ForegroundColor Gray
Write-Host "  Dry Run: $DryRun" -ForegroundColor Gray
Write-Host ""

# Verify data migration
Write-Host "Step 1: Verifying data migration..." -ForegroundColor Cyan
$verifySQL = @"
SELECT 
    (SELECT COUNT(*) FROM public.media_items) AS old_count,
    (SELECT COUNT(*) FROM public.cnt_contents) AS new_count;
"@

$verifyResult = $verifySQL | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) -t -A
$oldCount, $newCount = $verifyResult -split '\|'

Write-Host "  Old schema (media_items): $oldCount rows" -ForegroundColor Gray
Write-Host "  New schema (cnt_contents): $newCount rows" -ForegroundColor Gray

if ([int]$newCount -lt [int]$oldCount) {
    Write-Host "  [ERROR] New schema has fewer rows! Migration may be incomplete." -ForegroundColor Red
    Write-Host "  Aborting cleanup for safety." -ForegroundColor Yellow
    exit 1
}

Write-Host "  [SUCCESS] Data migration verified" -ForegroundColor Green
Write-Host ""

# Step 2: Clean up functions and views
if (-not $SkipFunctions) {
    Write-Host "Step 2: Cleaning up old functions and views..." -ForegroundColor Cyan
    $scriptPath = Join-Path $PSScriptRoot "cleanup-old-kh-functions.sql"
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would run: $scriptPath" -ForegroundColor Gray
    } else {
        if (Test-Path $scriptPath) {
            & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) --file="$scriptPath"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [SUCCESS] Old functions and views removed" -ForegroundColor Green
            } else {
                Write-Host "  [WARNING] Some errors occurred" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [ERROR] Script not found: $scriptPath" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Step 3: Clean up tables
if (-not $SkipTables) {
    Write-Host "Step 3: Cleaning up old tables..." -ForegroundColor Cyan
    Write-Host "  WARNING: This will permanently delete old tables!" -ForegroundColor Yellow
    $confirm = Read-Host "  Type 'yes' to continue"
    
    if ($confirm -eq 'yes') {
        $scriptPath = Join-Path $PSScriptRoot "cleanup-old-kh-tables.sql"
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would run: $scriptPath" -ForegroundColor Gray
        } else {
            if (Test-Path $scriptPath) {
                & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) --file="$scriptPath"
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [SUCCESS] Old tables removed" -ForegroundColor Green
                } else {
                    Write-Host "  [WARNING] Some errors occurred" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  [ERROR] Script not found: $scriptPath" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  [SKIPPED] User cancelled" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

