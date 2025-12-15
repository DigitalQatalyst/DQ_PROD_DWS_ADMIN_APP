# PowerShell script to create old KnowledgeHub schema and load data
# This creates the old schema tables, loads data, then transforms to new schema
# Usage: .\scripts\setup-old-schema-and-load.ps1 -DatabaseUrl "postgresql://..." -DataFile "database/dumps/data_old_kh_filtered.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$DataFile,
    
    [string]$DatabasePassword = $env:SUPABASE_DB_PASSWORD
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setup Old Schema & Load Data" -ForegroundColor Cyan
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

# Check if data file exists
if (-not (Test-Path $DataFile)) {
    Write-Host "ERROR: Data file not found: $DataFile" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database: $($connParams.Host):$($connParams.Port)/$($connParams.Database)" -ForegroundColor Gray
Write-Host "  Data File: $DataFile" -ForegroundColor Gray
Write-Host ""

# Step 1: Create old schema tables (if they don't exist)
Write-Host "Step 1: Creating old KnowledgeHub schema tables..." -ForegroundColor Cyan

$createSchemaSQL = @"
-- Create old KnowledgeHub schema tables if they don't exist
CREATE TABLE IF NOT EXISTS public.media_items(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text,
  summary text,
  status text DEFAULT 'Draft'::text NOT NULL,
  visibility text DEFAULT 'Public'::text NOT NULL,
  language text DEFAULT 'en'::text,
  published_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  seo_title text,
  seo_description text,
  canonical_url text,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  thumbnail_url text,
  -- All columns from the dump COPY statement
  audio_url text,
  episode_no int,
  pages int,
  file_size_mb numeric,
  event_start_at timestamptz,
  event_end_at timestamptz,
  venue text,
  registration_url text,
  valid_until timestamptz,
  event_duration text,
  podcast_duration text,
  video_duration text,
  tool_url text,
  tool_requirements text,
  domain text,
  format text,
  popularity text,
  authors jsonb DEFAULT '[]'::jsonb,
  author_slugs text[] DEFAULT '{}'::text[]
);

CREATE TABLE IF NOT EXISTS public.articles(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  body_html text,
  body_json jsonb,
  byline text,
  source text,
  announcement_date date,
  document_url text
);

CREATE TABLE IF NOT EXISTS public.videos(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  video_url text,
  platform text,
  duration_sec int,
  transcript_url text
);

CREATE TABLE IF NOT EXISTS public.podcasts(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  audio_url text,
  is_video_episode boolean DEFAULT false,
  episode_no int,
  duration_sec int,
  transcript_url text
);

CREATE TABLE IF NOT EXISTS public.reports(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  document_url text,
  pages int,
  file_size_mb numeric,
  highlights jsonb,
  toc jsonb
);

CREATE TABLE IF NOT EXISTS public.tools(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  document_url text,
  requirements text,
  file_size_mb numeric
);

CREATE TABLE IF NOT EXISTS public.events(
  id uuid PRIMARY KEY REFERENCES public.media_items(id) ON DELETE CASCADE,
  start_at timestamptz,
  end_at timestamptz,
  venue text,
  registration_url text,
  timezone text,
  mode text,
  agenda jsonb
);

CREATE TABLE IF NOT EXISTS public.taxonomies(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL,
  label text NOT NULL,
  key text NOT NULL,
  description text,
  archived boolean DEFAULT false NOT NULL,
  position int DEFAULT 0 NOT NULL,
  allowed_media_types jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_taxonomies_kind_key ON public.taxonomies (kind, key);

CREATE TABLE IF NOT EXISTS public.media_taxonomies(
  media_id uuid NOT NULL,
  taxonomy_id uuid NOT NULL,
  PRIMARY KEY (media_id, taxonomy_id),
  FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE,
  FOREIGN KEY (taxonomy_id) REFERENCES public.taxonomies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.media_assets(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id uuid NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  kind text,
  mime text,
  size_bytes bigint,
  width int,
  height int,
  duration_sec int,
  checksum text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_views(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id uuid NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now() NOT NULL
);
"@

Write-Host "  Creating tables..." -ForegroundColor Gray
$output = $createSchemaSQL | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database) 2>&1

# Check for errors (excluding "already exists" which is fine)
$errors = $output | Where-Object { $_ -match 'ERROR' -and $_ -notmatch 'already exists' }
if ($errors) {
    Write-Host "  [WARNING] Some errors occurred:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  [SUCCESS] Old schema tables created (or already exist)" -ForegroundColor Green
}
Write-Host ""

# Step 2: Load data using psql -f (handles COPY format correctly)
Write-Host "Step 2: Loading data from dump file..." -ForegroundColor Cyan
Write-Host "  Using psql -f to handle COPY format correctly" -ForegroundColor Gray
Write-Host ""

$psqlArgs = @(
    "--host=$($connParams.Host)",
    "--port=$($connParams.Port)",
    "--username=$($connParams.User)",
    "--dbname=$($connParams.Database)",
    "--file=$DataFile"
)

$loadOutput = & psql @psqlArgs 2>&1

# Filter out expected errors (like "already exists" for constraints)
$actualErrors = $loadOutput | Where-Object { 
    $_ -match 'ERROR' -and 
    $_ -notmatch 'already exists' -and
    $_ -notmatch 'duplicate key'
}

if ($LASTEXITCODE -eq 0 -or $actualErrors.Count -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Data loaded successfully!" -ForegroundColor Green
    if ($loadOutput -match 'COPY \d+') {
        $match = $loadOutput | Select-String -Pattern 'COPY (\d+)'
        if ($match) {
            Write-Host "  Rows loaded: $($match.Matches.Groups[1].Value)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host ""
    Write-Host "[WARNING] Some errors occurred during loading:" -ForegroundColor Yellow
    $actualErrors | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    if ($actualErrors.Count -gt 10) {
        Write-Host "  ... and $($actualErrors.Count - 10) more errors" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setup Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Run the transformation script to migrate data to new schema:" -ForegroundColor Cyan
Write-Host "  Get-Content 'scripts/transform-kh-data-to-cnt.sql' -Raw -Encoding UTF8 | & psql --host=$($connParams.Host) --port=$($connParams.Port) --username=$($connParams.User) --dbname=$($connParams.Database)" -ForegroundColor Gray
Write-Host ""

