# Election Voting System - Reliable Startup Script with Auto-Recovery
# This script ensures a smooth startup with error prevention and recovery

param(
    [switch]$SkipVerification = $false,
    [switch]$AutoRecovery = $true,
    [switch]$Verbose = $false
)

function Write-Header {
    param([string]$text)
    Write-Host "`n$("="*60)" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "$("="*60)" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$text, [int]$step, [int]$total)
    Write-Host "`n[$step/$total] $text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$text)
    Write-Host "✓ $text" -ForegroundColor Green
}

function Write-Error {
    param([string]$text)
    Write-Host "✗ $text" -ForegroundColor Red
}

function Write-Warning {
    param([string]$text)
    Write-Host "⚠ $text" -ForegroundColor Yellow
}

function Stop-ProcessOnPort {
    param([int]$port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                     Where-Object { $_.State -eq 'Listen' } | 
                     ForEach-Object { Get-Process -Id $_.OwningProcess }
        
        if ($processes) {
            Write-Warning "Stopping processes on port $port..."
            $processes | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Success "Freed port $port"
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Test-MongoDB {
    try {
        $result = mongosh --eval "db.adminCommand('ping')" 2>&1
        return ($? -and $result -match "ok")
    } catch {
        return $false
    }
}

function Start-MongoDB {
    Write-Step "Starting MongoDB" 1 7
    
    try {
        # Try to start MongoDB service on Windows
        Stop-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        
        if (Test-MongoDB) {
            Write-Success "MongoDB started successfully"
            return $true
        } else {
            Write-Warning "MongoDB service started but not responding yet"
            Start-Sleep -Seconds 3
            if (Test-MongoDB) {
                Write-Success "MongoDB is now responding"
                return $true
            }
        }
    } catch {
        Write-Warning "Could not start MongoDB service - it may already be running"
    }
    
    if (Test-MongoDB) {
        Write-Success "MongoDB is running"
        return $true
    } else {
        Write-Error "MongoDB is not running"
        Write-Host "  Solution:" -ForegroundColor Gray
        Write-Host "    Windows: net start MongoDB" -ForegroundColor Gray
        Write-Host "    Mac: brew services start mongodb-community" -ForegroundColor Gray
        Write-Host "    Linux: sudo systemctl start mongodb" -ForegroundColor Gray
        return $false
    }
}

function Prepare-Backend {
    Write-Step "Preparing backend" 2 7
    
    # Check .env
    if (-not (Test-Path "backend\.env")) {
        Write-Warning "backend/.env not found - creating from example"
        if (Test-Path "backend\.env.example") {
            Copy-Item "backend\.env.example" "backend\.env"
            Write-Success "Created backend/.env"
        } else {
            Write-Error "backend/.env.example not found!"
            return $false
        }
    } else {
        Write-Success "backend/.env exists"
    }
    
    # Check dependencies
    if (-not (Test-Path "backend\node_modules")) {
        Write-Warning "Backend dependencies not installed"
        Write-Host "  Installing npm packages..." -ForegroundColor Gray
        Push-Location backend
        npm install | Out-Null
        if ($?) {
            Write-Success "Backend dependencies installed"
        } else {
            Write-Error "Failed to install backend dependencies"
            Pop-Location
            return $false
        }
        Pop-Location
    } else {
        Write-Success "Backend dependencies already installed"
    }
    
    return $true
}

function Prepare-Frontend {
    Write-Step "Preparing frontend" 3 7
    
    # Check dependencies
    if (-not (Test-Path "frontend\node_modules")) {
        Write-Warning "Frontend dependencies not installed"
        Write-Host "  Installing npm packages..." -ForegroundColor Gray
        Push-Location frontend
        npm install | Out-Null
        if ($?) {
            Write-Success "Frontend dependencies installed"
        } else {
            Write-Error "Failed to install frontend dependencies"
            Pop-Location
            return $false
        }
        Pop-Location
    } else {
        Write-Success "Frontend dependencies already installed"
    }
    
    return $true
}

function Seed-Database {
    Write-Step "Checking database" 4 7
    
    try {
        $userCount = mongosh --eval "use election_voting; db.users.countDocuments()" 2>&1 | Select-String -Pattern "\d+"
        
        if ($userCount -and [int]$userCount.Matches[0].Value -gt 0) {
            Write-Success "Database already seeded ($($userCount.Matches[0].Value) users)"
            return $true
        }
    } catch {}
    
    Write-Warning "Database needs seeding"
    Write-Host "  Seeding with demo data..." -ForegroundColor Gray
    
    Push-Location backend
    npm run seed 2>&1 | Where-Object { $_ -match "created|success|error" } | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    Pop-Location
    
    Write-Success "Database seeded"
    return $true
}

function Check-Ports {
    Write-Step "Checking ports" 5 7
    
    $port5000Free = -not (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue)
    $port5173Free = -not (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue)
    
    if (-not $port5000Free) {
        Write-Warning "Port 5000 is in use - attempting to free it"
        if (Stop-ProcessOnPort -port 5000) {
            Write-Success "Port 5000 is now free"
        } else {
            Write-Error "Could not free port 5000"
            return $false
        }
    } else {
        Write-Success "Port 5000 is available"
    }
    
    if (-not $port5173Free) {
        Write-Warning "Port 5173 is in use - attempting to free it"
        if (Stop-ProcessOnPort -port 5173) {
            Write-Success "Port 5173 is now free"
        } else {
            Write-Warning "Could not free port 5173 - Vite will auto-select next port"
        }
    } else {
        Write-Success "Port 5173 is available"
    }
    
    return $true
}

function Start-Services {
    Write-Step "Starting services" 6 7
    
    # Start Backend
    Write-Host "`nStarting backend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Mahesh\Code Library\election-voting-system\backend'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 5
    
    # Start Frontend
    Write-Host "Starting frontend dev server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Mahesh\Code Library\election-voting-system\frontend'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
    
    Write-Success "Services started"
    return $true
}

# MAIN EXECUTION

Write-Header "ELECTION VOTING SYSTEM - STARTUP"

if (-not $SkipVerification) {
    Write-Step "Running verification" 0 7
    Write-Host "  Checking prerequisites..." -ForegroundColor Gray
    
    # Quick verification
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if (-not $nodeVersion -or -not $npmVersion) {
        Write-Error "Node.js or npm not installed"
        exit 1
    }
    
    Write-Success "Node.js: $nodeVersion"
    Write-Success "npm: $npmVersion"
}

# Execute startup steps
try {
    if (-not (Start-MongoDB)) {
        exit 1
    }
    
    if (-not (Prepare-Backend)) {
        exit 1
    }
    
    if (-not (Prepare-Frontend)) {
        exit 1
    }
    
    if (-not (Seed-Database)) {
        Write-Warning "Database seeding had issues but continuing..."
    }
    
    if (-not (Check-Ports)) {
        exit 1
    }
    
    if (-not (Start-Services)) {
        exit 1
    }
    
} catch {
    Write-Error "Startup failed: $_"
    exit 1
}

Write-Header "STARTUP COMPLETE - APPLICATION READY"

Write-Host "`n📱 Access Points:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000/api" -ForegroundColor White

Write-Host "`n🔐 Admin Credentials:" -ForegroundColor Green
Write-Host "  Email:    admin@voting.com" -ForegroundColor White
Write-Host "  Password: Admin@123456" -ForegroundColor White

Write-Host "`n💡 Quick Links:" -ForegroundColor Green
Write-Host "  Register: http://localhost:5173/register" -ForegroundColor White
Write-Host "  Vote:     http://localhost:5173/vote" -ForegroundColor White
Write-Host "  Results:  http://localhost:5173/results" -ForegroundColor White
Write-Host "  Admin:    http://localhost:5173/admin/login" -ForegroundColor White

Write-Host "`n📊 Monitoring:" -ForegroundColor Green
Write-Host "  Run .\monitor-health.ps1 in a new terminal to monitor system health" -ForegroundColor White

Write-Host "`n⚠️  Important:" -ForegroundColor Yellow
Write-Host "  • Two terminal windows opened (Backend + Frontend)" -ForegroundColor White
Write-Host "  • Keep both terminals running while using the app" -ForegroundColor White
Write-Host "  • Press Ctrl+C in either terminal to stop that service" -ForegroundColor White

Write-Host "`n✓ Application is ready to use!`n" -ForegroundColor Green
