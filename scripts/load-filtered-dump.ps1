# PowerShell script to load filtered dump with error handling
# This script loads data and skips errors for tables that don't exist
# Usage: .\scripts\load-filtered-dump.ps1 -DatabaseUrl "postgresql://..." -DataFile "database/dumps/data_old_kh_filtered.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$DataFile,
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Load Filtered Data Dump (Error Tolerant)" -ForegroundColor Cyan
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
        $encodedPassword = $DatabasePassword -replace ' ', '%20' -replace '#', '%23' -replace '\$', '%24' -replace '&', '%26'
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

# Load the helper function from the main script
$mainScriptPath = Join-Path $PSScriptRoot "migrate-kh-to-cnt-all-in-one.ps1"
if (Test-Path $mainScriptPath) {
    # Extract the function from the main script
    $mainScriptContent = Get-Content $mainScriptPath -Raw
    if ($mainScriptContent -match '(?s)function Get-PsqlConnectionParams\s*\{[^}]+\}') {
        $functionDefinition = $Matches[0]
        Invoke-Expression $functionDefinition
    }
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

Write-Host "Loading data with error tolerance..." -ForegroundColor Cyan
Write-Host "  (Errors for missing tables will be ignored)" -ForegroundColor Gray
Write-Host ""

# Read the SQL file and split into statements
$sqlContent = Get-Content $DataFile -Raw -Encoding UTF8

# Split by semicolons to get individual statements
# But be careful with COPY statements which may have data lines
$statements = @()
$currentStatement = ""
$inCopyData = $false

foreach ($line in ($sqlContent -split "`r?`n")) {
    $currentStatement += $line + "`n"
    
    # Check if this is a COPY statement
    if ($line -match '^\s*COPY\s+') {
        $inCopyData = $true
    }
    
    # Check if COPY data ends (\.)
    if ($inCopyData -and $line -match '^\s*\\\.') {
        $inCopyData = $false
        $statements += $currentStatement
        $currentStatement = ""
    }
    # Regular statement end
    elseif (-not $inCopyData -and $line -match ';\s*$') {
        $statements += $currentStatement
        $currentStatement = ""
    }
}

if ($currentStatement.Trim()) {
    $statements += $currentStatement
}

Write-Host "  Found $($statements.Count) statements to process" -ForegroundColor Gray
Write-Host ""

# Process each statement
$successCount = 0
$errorCount = 0
$skippedCount = 0

foreach ($statement in $statements) {
    if ([string]::IsNullOrWhiteSpace($statement.Trim())) {
        continue
    }
    
    # Extract table name for reporting
    $tableName = "unknown"
    if ($statement -match '(?:COPY|INSERT\s+INTO)\s+public\.(\w+)|(?:COPY|INSERT\s+INTO)\s+(\w+)') {
        $tableName = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
    }
    
    # Execute the statement
    try {
        $result = $statement | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "  [OK] $tableName" -ForegroundColor Green
        } else {
            # Check if error is about table not existing
            $errorOutput = $result -join "`n"
            if ($errorOutput -match 'relation.*does not exist|table.*does not exist') {
                $skippedCount++
                Write-Host "  [SKIP] $tableName (table does not exist)" -ForegroundColor Yellow
            } else {
                $errorCount++
                Write-Host "  [ERROR] $tableName" -ForegroundColor Red
                Write-Host "    $($errorOutput -replace "`n", " " -replace "`r", "")" -ForegroundColor Gray
            }
        }
    } catch {
        $errorCount++
        Write-Host "  [ERROR] $tableName : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Load Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Skipped (table not found): $skippedCount" -ForegroundColor Yellow
Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "Next step: Run the transformation script:" -ForegroundColor Cyan
    Write-Host "  psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) -f scripts/transform-kh-data-to-cnt.sql" -ForegroundColor Gray
}

