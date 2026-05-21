# Election Voting System - Startup Script
# Starts both backend and frontend servers with proper error handling

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Election Voting System - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check MongoDB
Write-Host "`n[1/3] Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.adminCommand('ping')" 2>&1
    if ($mongoTest -match "ok") {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "✗ MongoDB appears to be offline" -ForegroundColor Yellow
        Write-Host "   Please start MongoDB before running the backend" -ForegroundColor Yellow
        Write-Host "   Windows: net start MongoDB" -ForegroundColor White
        Write-Host "   Mac: brew services start mongodb-community" -ForegroundColor White
    }
} catch {
    Write-Host "⚠ Could not verify MongoDB (install mongosh if needed)" -ForegroundColor Yellow
}

# Start Backend
Write-Host "`n[2/3] Starting backend server..." -ForegroundColor Yellow
Push-Location backend

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "✗ backend/.env not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "  ✓ Created .env file" -ForegroundColor Green
        Write-Host "  ⚠ Please review and update backend/.env if needed" -ForegroundColor Yellow
    } else {
        Write-Host "Creating default .env..." -ForegroundColor Yellow
        @"
MONGODB_URI=mongodb://localhost:27017/election_voting
JWT_SECRET=your-secret-key-min-32-characters-long
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
"@ | Out-File .env -Encoding UTF8
        Write-Host "  ✓ Created .env file with defaults" -ForegroundColor Green
    }
}

# Seed database on first run (optional)
Write-Host "  Seeding database with initial data (if needed)..." -ForegroundColor Cyan
npm run seed 2>&1 | Out-Null

# Start backend in new terminal
Write-Host "  Starting server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Pop-Location

# Wait for backend to start
Write-Host "`nWaiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n[3/3] Starting frontend server..." -ForegroundColor Yellow
Push-Location frontend
Write-Host "  Starting on port 5173..." -ForegroundColor Green

# Start frontend in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Pop-Location

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n📱 Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host "`n🔐 Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@voting.com" -ForegroundColor White
Write-Host "  Password: Admin@123456" -ForegroundColor White

Write-Host "`n💡 Quick Links:" -ForegroundColor Cyan
Write-Host "  Register:        http://localhost:5173/register" -ForegroundColor White
Write-Host "  Vote:            http://localhost:5173/vote" -ForegroundColor White
Write-Host "  Results:         http://localhost:5173/results" -ForegroundColor White
Write-Host "  Admin Login:     http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "  Admin Dashboard: http://localhost:5173/admin/dashboard" -ForegroundColor White

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "  • Two terminals will open for backend and frontend" -ForegroundColor White
Write-Host "  • Keep both terminals running while using the app" -ForegroundColor White
Write-Host "  • Close either terminal to stop that service" -ForegroundColor White
Write-Host "  • Check browser console (F12) for any errors" -ForegroundColor White

Write-Host "`n📖 For more info, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop (in terminal windows)" -ForegroundColor Yellow
