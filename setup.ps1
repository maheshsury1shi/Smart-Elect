# First Time Setup Script
# This script installs dependencies for both backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Election Voting System - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check Node.js installation
Write-Host "`n[1/4] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($?) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm installation
Write-Host "`n[2/4] Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>&1
if ($?) {
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`n[3/4] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($?) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Install frontend dependencies
Write-Host "`n[4/4] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($?) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Ensure MongoDB is running" -ForegroundColor White
Write-Host "2. Run the application: .\start-app.ps1" -ForegroundColor White
Write-Host "`nFor detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
