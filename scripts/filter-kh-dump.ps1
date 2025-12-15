# PowerShell script to filter KnowledgeHub dump to only include relevant tables
# This removes INSERT statements for tables that don't exist in the new schema
# Usage: .\scripts\filter-kh-dump.ps1 -InputFile "database/dumps/data_old_kh.sql" -OutputFile "database/dumps/data_old_kh_filtered.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,
    
    [string]$OutputFile = ""
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Filter KnowledgeHub Data Dump" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Tables we want to keep (KnowledgeHub tables that will be transformed)
$relevantTables = @(
    'media_items',
    'articles',
    'videos',
    'podcasts',
    'reports',
    'tools',
    'events',
    'taxonomies',
    'media_taxonomies',
    'media_assets',
    'media_views'
)

# Set default output file if not provided
if (-not $OutputFile) {
    $directory = Split-Path -Parent $InputFile
    $basename = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
    $extension = [System.IO.Path]::GetExtension($InputFile)
    $OutputFile = Join-Path $directory "${basename}_filtered${extension}"
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Input File: $InputFile" -ForegroundColor Gray
Write-Host "  Output File: $OutputFile" -ForegroundColor Gray
Write-Host "  Relevant Tables: $($relevantTables -join ', ')" -ForegroundColor Gray
Write-Host ""

# Check if input file exists
if (-not (Test-Path $InputFile)) {
    Write-Host "ERROR: Input file not found: $InputFile" -ForegroundColor Red
    exit 1
}

Write-Host "Filtering dump file..." -ForegroundColor Cyan
Write-Host ""

# Read the dump file
$content = Get-Content $InputFile -Raw -Encoding UTF8

# Split into lines for processing
$lines = $content -split "`r?`n"

$outputLines = @()
$inRelevantTable = $false
$currentTable = $null
$skipUntilNextCommand = $false
$tablePattern = '^\s*COPY\s+public\.(\w+)\s+\(|^\s*INSERT\s+INTO\s+public\.(\w+)\s+\(|^\s*COPY\s+(\w+)\s+\(|^\s*INSERT\s+INTO\s+(\w+)\s+\('

foreach ($line in $lines) {
    # Check if this line starts a COPY or INSERT command
    if ($line -match $tablePattern) {
        $tableName = if ($Matches[1]) { $Matches[1] } 
                     elseif ($Matches[2]) { $Matches[2] }
                     elseif ($Matches[3]) { $Matches[3] }
                     else { $Matches[4] }
        
        if ($relevantTables -contains $tableName) {
            $inRelevantTable = $true
            $currentTable = $tableName
            $skipUntilNextCommand = $false
            $outputLines += $line
            Write-Host "  [KEEP] Table: $tableName" -ForegroundColor Green
        } else {
            $inRelevantTable = $false
            $currentTable = $null
            $skipUntilNextCommand = $true
            Write-Host "  [SKIP] Table: $tableName" -ForegroundColor Yellow
        }
    }
    # Check if this is a COPY data line (\.)
    elseif ($line -match '^\s*\\\.') {
        if ($inRelevantTable) {
            $outputLines += $line
            $inRelevantTable = $false
            $currentTable = $null
        }
        $skipUntilNextCommand = $false
    }
    # Check if this is the end of a statement (;)
    elseif ($line -match ';\s*$') {
        if ($inRelevantTable) {
            $outputLines += $line
            $inRelevantTable = $false
            $currentTable = $null
        }
        $skipUntilNextCommand = $false
    }
    # If we're in a relevant table section, keep the line
    elseif ($inRelevantTable -and -not $skipUntilNextCommand) {
        $outputLines += $line
    }
    # Keep SET statements, comments, and other non-table-specific commands
    elseif ($line -match '^\s*(SET|--|/\*|COPY\s+public\.|INSERT\s+INTO\s+public\.)' -or 
            $line -match '^\s*$' -or
            $line -match '^--') {
        # Only keep if it's not table-specific or if we're not skipping
        if (-not $skipUntilNextCommand) {
            $outputLines += $line
        }
    }
}

# Write filtered output
$outputContent = $outputLines -join "`n"
Set-Content -Path $OutputFile -Value $outputContent -Encoding UTF8

$inputSize = (Get-Item $InputFile).Length / 1KB
$outputSize = (Get-Item $OutputFile).Length / 1KB

Write-Host ""
Write-Host "[SUCCESS] Filtered dump created!" -ForegroundColor Green
Write-Host "  Input Size: $([math]::Round($inputSize, 2)) KB" -ForegroundColor Gray
Write-Host "  Output Size: $([math]::Round($outputSize, 2)) KB" -ForegroundColor Gray
Write-Host "  Reduction: $([math]::Round((1 - $outputSize/$inputSize) * 100, 1))%" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Load the filtered dump: Get-Content '$OutputFile' | psql <your-connection-string>" -ForegroundColor Gray
Write-Host "  2. Run the transformation script: psql <your-connection-string> -f scripts/transform-kh-data-to-cnt.sql" -ForegroundColor Gray
Write-Host ""

