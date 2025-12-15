# PowerShell script to load COPY format dump using psql -f (handles backslashes correctly)
# Usage: .\scripts\load-copy-format-dump.ps1 -DatabaseUrl "postgresql://..." -DataFile "database/dumps/data_old_kh_filtered.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$DataFile,
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Load COPY Format Dump" -ForegroundColor Cyan
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

# Check if data file exists
if (-not (Test-Path $DataFile)) {
    Write-Host "ERROR: Data file not found: $DataFile" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database: $($connParams.Host):$($connParams.Port)/$($connParams.Database)" -ForegroundColor Gray
Write-Host "  User: $($connParams.User)" -ForegroundColor Gray
Write-Host "  Data File: $DataFile" -ForegroundColor Gray
Write-Host ""

Write-Host "Loading COPY format dump..." -ForegroundColor Cyan
Write-Host "  Using psql -f to handle COPY format correctly" -ForegroundColor Gray
Write-Host ""

# Use psql -f to load the file directly (handles COPY format natively)
$psqlArgs = @(
    "--host=$($connParams.Host)",
    "--port=$($connParams.Port)",
    "--username=$($connParams.User)",
    "--dbname=$($connParams.Database)",
    "--file=$DataFile"
)

& psql @psqlArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Data loaded successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[WARNING] Some errors occurred during loading" -ForegroundColor Yellow
    Write-Host "  This is normal if the schema has changed." -ForegroundColor Gray
    Write-Host "  Check the errors above - if they're about missing columns," -ForegroundColor Gray
    Write-Host "  you may need to create the old schema tables first or adjust the transformation." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next step: Run the transformation script to migrate data to new schema" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Load Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

