# Simple server runner to see actual errors
$env:SUPABASE_URL="https://eipfmtuxdktbotimuunl.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="placeholder-service-role-key"
$env:JWT_SECRET="52sdrQaVIjUpjHsOMPaUbQCXgAwsI42AM3vz6PYfMs"
$env:PORT="3001"
$env:NODE_ENV="development"

Write-Host "Starting API server..." -ForegroundColor Green
Write-Host ""

cd "C:\Users\shara\Documents\wip_repos\Ready_to_Review_v48_KF_Platform-Admin-Dashboard_SR--1\api"

npx tsx server.ts
