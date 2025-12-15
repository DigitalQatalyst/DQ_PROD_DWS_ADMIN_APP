# All-in-one script to migrate KnowledgeHub data to cnt_contents schema
# This script automates the entire migration process and can resume from where it left off
# Usage: .\scripts\migrate-kh-to-cnt-all-in-one.ps1
#
# IMPORTANT: When calling this script, wrap URLs in single quotes or escape the & character
# Example: .\scripts\migrate-kh-to-cnt-all-in-one.ps1 -OldDatabaseUrl 'postgresql://...&pgbouncer=true' -NewDatabaseUrl 'postgresql://...&pgbouncer=true'
#
# NOTE: If your old database has other tables, first filter the dump:
#   .\scripts\filter-kh-dump.ps1 -InputFile "database/dumps/data_old_kh.sql" -OutputFile "database/dumps/data_old_kh_filtered.sql"
# Then use the filtered dump file in Step 3

param(
    [Parameter(Mandatory=$true)]
    [string]$OldDatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$NewDatabaseUrl,
    
    [string]$OldDatabasePassword = $env:OLD_SUPABASE_DB_PASSWORD,
    
    [string]$NewDatabasePassword = $env:SUPABASE_DB_PASSWORD,
    
    [switch]$SkipBackup,
    
    [switch]$DryRun,
    
    [switch]$ForceRestart,
    
    [string]$FilteredDumpFile = ""
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "KnowledgeHub to cnt_contents Migration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Handle passwords - check for $encPwd placeholder
$needsOldPassword = ($OldDatabaseUrl -match '\$encPwd') -and (-not $OldDatabasePassword)
$needsNewPassword = ($NewDatabaseUrl -match '\$encPwd') -and (-not $NewDatabasePassword)

if ($needsOldPassword) {
    $securePassword = Read-Host "Enter OLD database password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $OldDatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    # Clear secure string from memory
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

if ($needsNewPassword) {
    $securePassword = Read-Host "Enter NEW database password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $NewDatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    # Clear secure string from memory
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

# URL encode passwords
function Encode-Password {
    param([string]$Password)
    Add-Type -AssemblyName System.Web -ErrorAction SilentlyContinue
    if ([System.Web.HttpUtility]) {
        return [System.Web.HttpUtility]::UrlEncode($Password)
    } else {
        return $Password -replace ' ', '%20' -replace '#', '%23' -replace '\$', '%24' -replace '&', '%26' -replace "'", '%27' -replace '\(', '%28' -replace '\)', '%29' -replace '\*', '%2A' -replace '\+', '%2B' -replace ',', '%2C' -replace '/', '%2F' -replace ':', '%3A' -replace ';', '%3B' -replace '=', '%3D' -replace '\?', '%3F' -replace '@', '%40' -replace '\[', '%5B' -replace '\]', '%5D'
    }
}

if ($OldDatabaseUrl -match '\$encPwd') {
    $OldDatabaseUrl = $OldDatabaseUrl -replace '\$encPwd', (Encode-Password $OldDatabasePassword)
}
if ($NewDatabaseUrl -match '\$encPwd') {
    $NewDatabaseUrl = $NewDatabaseUrl -replace '\$encPwd', (Encode-Password $NewDatabasePassword)
}

# Create directories
$dumpsDir = "database/dumps"
$scriptsDir = "scripts"
if (-not (Test-Path $dumpsDir)) {
    New-Item -ItemType Directory -Path $dumpsDir -Force | Out-Null
}

# Status tracking file
$statusFile = "$dumpsDir/migration_status.json"

# Load or create migration status
function Get-MigrationStatus {
    if (Test-Path $statusFile -and -not $ForceRestart) {
        try {
            $content = Get-Content $statusFile -Raw | ConvertFrom-Json
            return $content
        } catch {
            Write-Host "  [INFO] Could not parse status file, starting fresh" -ForegroundColor Yellow
        }
    }
    return @{
        Step1_Backup = @{ Completed = $false; File = $null; Timestamp = $null }
        Step2_Dump = @{ Completed = $false; File = $null; Timestamp = $null }
        Step3_Load = @{ Completed = $false; Timestamp = $null }
        Step4_Transform = @{ Completed = $false; Timestamp = $null }
    }
}

function Save-MigrationStatus {
    param($Status)
    $Status | ConvertTo-Json -Depth 10 | Set-Content $statusFile
}

function Test-StepCompleted {
    param(
        [string]$StepName,
        [object]$Status,
        [string]$CheckFile = $null,
        [object]$CheckDatabaseResult = $null  # null = don't check, true = check passed, false = check failed
    )
    
    if ($ForceRestart) {
        return $false
    }
    
    $stepStatus = $Status."$StepName"
    if ($stepStatus.Completed) {
        # Verify file exists if specified
        if ($CheckFile -and -not (Test-Path $CheckFile)) {
            Write-Host "  [WARNING] Status says $StepName completed but file not found: $CheckFile" -ForegroundColor Yellow
            return $false
        }
        # Check database state if specified
        # If CheckDatabaseResult is not null, it means we performed a check - verify it passed
        if ($null -ne $CheckDatabaseResult) {
            if (-not $CheckDatabaseResult) {
                Write-Host "  [WARNING] Status says $StepName completed but database check failed" -ForegroundColor Yellow
                return $false
            }
        }
        return $true
    }
    return $false
}

function Mark-StepCompleted {
    param(
        [string]$StepName,
        [object]$Status,
        [string]$File = $null,
        [string]$Timestamp = $null
    )
    
    $Status."$StepName" = @{
        Completed = $true
        File = $File
        Timestamp = if ($Timestamp) { $Timestamp } else { (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') }
    }
    Save-MigrationStatus $Status
}

function Get-PsqlConnectionParams {
    param(
        [string]$DatabaseUrl,
        [string]$Password
    )
    
    # Set PGPASSWORD environment variable to avoid URL encoding issues
    $env:PGPASSWORD = $Password
    
    # Parse the URL to extract connection parameters
    # Format: postgresql://user:pass@host:port/database?params
    if ($DatabaseUrl -match '^postgresql://([^:]+)(?::[^@]+)?@([^/]+)(?:/(.+?))?(?:\?.*)?$') {
        $user = $Matches[1]
        $hostPort = $Matches[2]
        $database = if ($Matches[3]) { $Matches[3] } else { "postgres" }
        
        # Split host and port
        if ($hostPort -match '^([^:]+)(?::(\d+))?$') {
            $host = $Matches[1]
            $port = if ($Matches[2]) { $Matches[2] } else { "5432" }
            
            # Return connection parameters as hashtable for pg_dump/psql
            return @{
                Host = $host
                Port = $port
                User = $user
                Database = $database
                ConnectionString = "postgresql://${user}@${host}:${port}/${database}"
            }
        }
    }
    
    # Fallback: try to extract what we can
    Write-Warning "Could not fully parse URL, using fallback method"
    $cleanUrl = $DatabaseUrl -replace ':[^@]*@', '@'
    return @{
        ConnectionString = $cleanUrl
    }
}

# Initialize status
$migrationStatus = Get-MigrationStatus

# Use existing files from status if available, otherwise create new ones
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'

if ($migrationStatus.Step2_Dump.Completed -and $migrationStatus.Step2_Dump.File -and (Test-Path $migrationStatus.Step2_Dump.File)) {
    $dataDumpFile = $migrationStatus.Step2_Dump.File
    Write-Host "  [INFO] Using existing data dump: $dataDumpFile" -ForegroundColor Gray
} else {
    $dataDumpFile = "$dumpsDir/data_old_kh_${timestamp}.sql"
}

if ($migrationStatus.Step1_Backup.Completed -and $migrationStatus.Step1_Backup.File -and (Test-Path $migrationStatus.Step1_Backup.File)) {
    $backupFile = $migrationStatus.Step1_Backup.File
    Write-Host "  [INFO] Using existing backup: $backupFile" -ForegroundColor Gray
} else {
    $backupFile = "$dumpsDir/backup_new_db_${timestamp}.sql"
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Old Database: $($OldDatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
Write-Host "  New Database: $($NewDatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
Write-Host "  Data Dump: $dataDumpFile" -ForegroundColor Gray
if (-not $SkipBackup) {
    Write-Host "  Backup File: $backupFile" -ForegroundColor Gray
}
Write-Host "  Status File: $statusFile" -ForegroundColor Gray
if ($ForceRestart) {
    Write-Host "  Mode: FORCE RESTART (will re-run all steps)" -ForegroundColor Yellow
}
if ($DryRun) {
    Write-Host "  Mode: DRY RUN (no changes will be made)" -ForegroundColor Yellow
}
Write-Host ""

# Show current status
Write-Host "Migration Status:" -ForegroundColor Cyan
$steps = @(
    @{ Name = "Step 1: Backup"; Status = $migrationStatus.Step1_Backup; Skip = $SkipBackup }
    @{ Name = "Step 2: Dump"; Status = $migrationStatus.Step2_Dump; Skip = $false }
    @{ Name = "Step 3: Load"; Status = $migrationStatus.Step3_Load; Skip = $false }
    @{ Name = "Step 4: Transform"; Status = $migrationStatus.Step4_Transform; Skip = $false }
)

foreach ($step in $steps) {
    if ($step.Skip) {
        Write-Host "  $($step.Name): SKIPPED" -ForegroundColor Gray
    } elseif ($step.Status.Completed) {
        Write-Host "  $($step.Name): COMPLETED" -ForegroundColor Green
    } else {
        Write-Host "  $($step.Name): PENDING" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check tools
try {
    $null = Get-Command pg_dump -ErrorAction Stop
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "ERROR: PostgreSQL client tools not found." -ForegroundColor Red
    exit 1
}

# Step 1: Backup new database (if not skipped)
if (-not $SkipBackup -and -not $DryRun) {
    Write-Host "Step 1: Backing up new database..." -ForegroundColor Cyan
    
    if (Test-StepCompleted -StepName "Step1_Backup" -Status $migrationStatus -CheckFile $backupFile) {
        Write-Host "  [SKIPPED] Backup already completed: $backupFile" -ForegroundColor Green
    } else {
        # Use environment variable for password to avoid URL parsing issues
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
        # Build connection string without special characters
        $pgDumpArgs = @(
            "--host=$($connParams.Host)",
            "--port=$($connParams.Port)",
            "--username=$($connParams.User)",
            "--dbname=$($connParams.Database)",
            "--schema-only",
            "--no-owner",
            "--no-acl",
            "--file=$backupFile"
        )
        & pg_dump @pgDumpArgs
        if ($LASTEXITCODE -eq 0) {
            Mark-StepCompleted -StepName "Step1_Backup" -Status $migrationStatus -File $backupFile
            Write-Host "  [SUCCESS] Backup created: $backupFile" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] Backup failed, but continuing..." -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Step 2: Dump data from old database
Write-Host "Step 2: Dumping data from old database..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  [DRY RUN] Would dump data from: $($OldDatabaseUrl -replace ':[^:@]+@', ':***@')" -ForegroundColor Gray
} else {
    if (Test-StepCompleted -StepName "Step2_Dump" -Status $migrationStatus -CheckFile $dataDumpFile) {
        Write-Host "  [SKIPPED] Data dump already completed: $dataDumpFile" -ForegroundColor Green
        $fileSize = (Get-Item $dataDumpFile).Length / 1KB
        Write-Host "  [INFO] File size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    } else {
        # Use environment variable for password to avoid URL parsing issues
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $OldDatabaseUrl -Password $OldDatabasePassword
        # Build connection string without special characters
        $pgDumpArgs = @(
            "--host=$($connParams.Host)",
            "--port=$($connParams.Port)",
            "--username=$($connParams.User)",
            "--dbname=$($connParams.Database)",
            "--data-only",
            "--no-owner",
            "--no-acl",
            "--schema=public",
            "--file=$dataDumpFile"
        )
        & pg_dump @pgDumpArgs
        if ($LASTEXITCODE -eq 0) {
            Mark-StepCompleted -StepName "Step2_Dump" -Status $migrationStatus -File $dataDumpFile
            $fileSize = (Get-Item $dataDumpFile).Length / 1KB
            Write-Host "  [SUCCESS] Data dump created: $dataDumpFile ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] Data dump failed" -ForegroundColor Red
            exit 1
        }
    }
}
Write-Host ""

# Step 3: Load data into new database
Write-Host "Step 3: Loading data into new database..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  [DRY RUN] Would load data from: $dataDumpFile" -ForegroundColor Gray
} else {
    # Use filtered dump if provided, otherwise use regular dump
    $loadFile = if ($FilteredDumpFile -and (Test-Path $FilteredDumpFile)) {
        Write-Host "  [INFO] Using filtered dump file: $FilteredDumpFile" -ForegroundColor Gray
        $FilteredDumpFile
    } else {
        $dataDumpFile
    }
    
    if (-not (Test-Path $loadFile)) {
        Write-Host "  [ERROR] Data dump file not found: $loadFile" -ForegroundColor Red
        Write-Host "  Tip: If your old DB has irrelevant tables, filter the dump first:" -ForegroundColor Yellow
        Write-Host "    .\scripts\filter-kh-dump.ps1 -InputFile `"$dataDumpFile`" -OutputFile `"database/dumps/data_old_kh_filtered.sql`"" -ForegroundColor Gray
        exit 1
    }
    
    # Check if data is already loaded (media_items table exists with data)
    $checkLoadSQL = @"
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'media_items'
) AND EXISTS (
    SELECT 1 FROM public.media_items LIMIT 1
);
"@
    
    try {
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
        # Use connection parameters instead of URL
        $checkLoadResult = $checkLoadSQL | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) -t -A 2>&1
        $isDataLoaded = ($checkLoadResult -match "t$|^t\s*$")
    } catch {
        $isDataLoaded = $false
    }
    
    if (Test-StepCompleted -StepName "Step3_Load" -Status $migrationStatus -CheckDatabaseResult $isDataLoaded) {
        Write-Host "  [SKIPPED] Data already loaded into new database" -ForegroundColor Green
    } else {
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
        # Use connection parameters instead of URL
        # Use error-tolerant loading if not filtered
        if ($FilteredDumpFile -and (Test-Path $FilteredDumpFile)) {
            # Filtered dump - load normally
            $sqlContent = Get-Content $loadFile -Raw -Encoding UTF8
            $sqlContent | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database)
        } else {
            # Not filtered - use error-tolerant loading
            Write-Host "  [INFO] Using error-tolerant loading (will skip tables that don't exist)" -ForegroundColor Gray
            & "$PSScriptRoot/load-filtered-dump.ps1" -DatabaseUrl $NewDatabaseUrl -DataFile $loadFile -DatabasePassword $NewDatabasePassword
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  [WARNING] Some errors occurred during loading, but continuing..." -ForegroundColor Yellow
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Mark-StepCompleted -StepName "Step3_Load" -Status $migrationStatus
            Write-Host "  [SUCCESS] Data loaded into new database" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] Failed to load data" -ForegroundColor Red
            Write-Host "  You can fix the issue and re-run this script to continue from Step 3" -ForegroundColor Yellow
            exit 1
        }
    }
}
Write-Host ""

# Step 4: Transform data
Write-Host "Step 4: Transforming data to new schema..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  [DRY RUN] Would run transformation script" -ForegroundColor Gray
} else {
    $transformScript = "$scriptsDir/transform-kh-data-to-cnt.sql"
    if (-not (Test-Path $transformScript)) {
        Write-Host "  [ERROR] Transformation script not found: $transformScript" -ForegroundColor Red
        exit 1
    }
    
    # Check if transformation is already done (cnt_contents has data that matches media_items)
    $checkTransformSQL = @"
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'cnt_contents'
) AND EXISTS (
    SELECT 1 FROM public.cnt_contents 
    WHERE id IN (SELECT id FROM public.media_items) 
    LIMIT 1
);
"@
    
    try {
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
        # Use connection parameters instead of URL
        $checkTransformResult = $checkTransformSQL | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) -t -A 2>&1
        $isTransformed = ($checkTransformResult -match "t$|^t\s*$")
    } catch {
        $isTransformed = $false
    }
    
    if (Test-StepCompleted -StepName "Step4_Transform" -Status $migrationStatus -CheckDatabaseResult $isTransformed) {
        Write-Host "  [SKIPPED] Data transformation already completed" -ForegroundColor Green
    } else {
        $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
        # Use connection parameters instead of URL
        Get-Content $transformScript -Raw -Encoding UTF8 | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database)
        
        if ($LASTEXITCODE -eq 0) {
            Mark-StepCompleted -StepName "Step4_Transform" -Status $migrationStatus
            Write-Host "  [SUCCESS] Data transformation completed" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] Data transformation failed" -ForegroundColor Red
            Write-Host "  Check the error messages above for details." -ForegroundColor Yellow
            Write-Host "  You can fix the issue and re-run this script to continue from Step 4" -ForegroundColor Yellow
            exit 1
        }
    }
}
Write-Host ""

# Step 5: Verify migration
Write-Host "Step 5: Verifying migration..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  [DRY RUN] Would verify data counts" -ForegroundColor Gray
} else {
    $verifySQL = @"
SELECT 
    'media_items' AS old_table,
    COUNT(*) AS count
FROM public.media_items
UNION ALL
SELECT 
    'cnt_contents' AS new_table,
    COUNT(*) AS count
FROM public.cnt_contents;
"@
    
    Write-Host "  Data counts:" -ForegroundColor Gray
    $connParams = Get-PsqlConnectionParams -DatabaseUrl $NewDatabaseUrl -Password $NewDatabasePassword
    # Use connection parameters instead of URL
    $verifySQL | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) -t -A | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Verify data in the new database" -ForegroundColor Gray
Write-Host "  2. Check for any missing required fields" -ForegroundColor Gray
Write-Host "  3. Test application functionality" -ForegroundColor Gray
Write-Host "  4. Clean up old tables if no longer needed" -ForegroundColor Gray
Write-Host ""

