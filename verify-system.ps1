# Election Voting System - Pre-Startup Verification Script
# This script verifies all prerequisites are met before running the application

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$script:errors = @()
$script:warnings = @()
$script:success = @()

function Write-Check {
    param([string]$message, [ValidateSet("success", "error", "warning", "info")]$type = "info")
    
    switch ($type) {
        "success" { Write-Host "✓ $message" -ForegroundColor Green; $script:success += $message }
        "error" { Write-Host "✗ $message" -ForegroundColor Red; $script:errors += $message }
        "warning" { Write-Host "⚠ $message" -ForegroundColor Yellow; $script:warnings += $message }
        "info" { Write-Host "ℹ $message" -ForegroundColor Cyan }
    }
}

Write-Host "`n" + "="*60
Write-Host "  ELECTION VOTING SYSTEM - PRE-STARTUP VERIFICATION" -ForegroundColor Magenta
Write-Host "="*60 + "`n"

# 1. Check Node.js
Write-Host "[1/9] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($?) {
    Write-Check "Node.js installed: $nodeVersion" "success"
} else {
    Write-Check "Node.js not found - CRITICAL" "error"
}

# 2. Check npm
Write-Host "`n[2/9] Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($?) {
    Write-Check "npm installed: $npmVersion" "success"
} else {
    Write-Check "npm not found - CRITICAL" "error"
}

# 3. Check MongoDB
Write-Host "`n[3/9] Checking MongoDB..." -ForegroundColor Yellow
$mongoTest = mongosh --eval "ping: 1" 2>&1
if ($mongoTest -match "ok" -or $mongoTest -match "1") {
    Write-Check "MongoDB is running and accessible" "success"
} else {
    Write-Check "MongoDB not running - must start before running backend" "error"
}

# 4. Check backend .env
Write-Host "`n[4/9] Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env"
    if ($envContent -match "MONGODB_URI" -and $envContent -match "JWT_SECRET") {
        Write-Check "backend/.env configured correctly" "success"
    } else {
        Write-Check "backend/.env missing required variables" "warning"
    }
} else {
    Write-Check "backend/.env not found - creating from example" "warning"
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Check "Created backend/.env from example" "success"
    }
}

# 5. Check backend dependencies
Write-Host "`n[5/9] Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Check "Backend dependencies installed" "success"
} else {
    Write-Check "Backend dependencies not installed" "warning"
    Write-Host "  Run: cd backend && npm install" -ForegroundColor Gray
}

# 6. Check frontend dependencies
Write-Host "`n[6/9] Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Check "Frontend dependencies installed" "success"
} else {
    Write-Check "Frontend dependencies not installed" "warning"
    Write-Host "  Run: cd frontend && npm install" -ForegroundColor Gray
}

# 7. Check face-api models
Write-Host "`n[7/9] Checking face-api models..." -ForegroundColor Yellow
$modelCount = (Get-ChildItem "frontend\public\models" -ErrorAction SilentlyContinue | Measure-Object).Count
if ($modelCount -gt 0) {
    Write-Check "Face API models present ($modelCount files)" "success"
} else {
    Write-Check "Face API models not found - facial recognition will not work" "warning"
}

# 8. Check database seeding
Write-Host "`n[8/9] Checking database state..." -ForegroundColor Yellow
$dbCheck = mongosh --eval "use election_voting; db.users.countDocuments()" 2>&1
if ($? -and $dbCheck -match "\d+") {
    Write-Check "Election database exists and is populated" "success"
} else {
    Write-Check "Database needs seeding - run: cd backend && npm run seed" "warning"
}

# 9. Check for port conflicts
Write-Host "`n[9/9] Checking for port conflicts..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if (-not $port5000) {
    Write-Check "Port 5000 (backend) is available" "success"
} else {
    Write-Check "Port 5000 is in use - backend may fail to start" "warning"
}

if (-not $port5173) {
    Write-Check "Port 5173 (frontend) is available" "success"
} else {
    Write-Check "Port 5173 is in use - frontend may fail to start" "warning"
}

# Summary
Write-Host "`n" + "="*60
Write-Host "  VERIFICATION SUMMARY" -ForegroundColor Magenta
Write-Host "="*60

$totalChecks = $script:success.Count + $script:errors.Count + $script:warnings.Count
$passRate = [Math]::Round(($script:success.Count / $totalChecks) * 100, 1)

Write-Host "`nResults: $($script:success.Count) passed, $($script:warnings.Count) warnings, $($script:errors.Count) critical"
Write-Host "Health: $passRate%`n"

if ($script:errors.Count -gt 0) {
    Write-Host "❌ CRITICAL ISSUES FOUND - Fix before running:" -ForegroundColor Red
    $script:errors | ForEach-Object { Write-Host "  • $_" }
    Write-Host ""
}

if ($script:warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS - May cause issues:" -ForegroundColor Yellow
    $script:warnings | ForEach-Object { Write-Host "  • $_" }
    Write-Host ""
}

if ($script:errors.Count -eq 0 -and $script:warnings.Count -eq 0) {
    Write-Host "✅ ALL SYSTEMS READY - You can run: .\start-app.ps1" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "⚠️  Please address issues above before running the application" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
