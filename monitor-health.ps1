# Election Voting System - Health Monitoring Script
# Continuously monitors the application and checks for errors

function Test-API {
    param([string]$url, [int]$timeout = 5)
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $timeout -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Test-MongoDB {
    $mongoTest = mongosh --eval "db.adminCommand('ping')" 2>&1
    return ($? -and $mongoTest -match "ok")
}

function Get-ProcessInfo {
    param([string]$name)
    $proc = Get-Process -Name $name -ErrorAction SilentlyContinue
    if ($proc) {
        return @{
            Running = $true
            PID = $proc.Id
            Memory = "$([Math]::Round($proc.WorkingSet/1MB, 2)) MB"
        }
    }
    return @{ Running = $false }
}

function Write-Status {
    param([string]$service, [bool]$healthy, [hashtable]$info = @{})
    
    $status = if ($healthy) { "✓" } else { "✗" }
    $color = if ($healthy) { "Green" } else { "Red" }
    
    $message = "[$status] $service"
    if ($info.Running) {
        $message += " (PID: $($info.PID), Memory: $($info.Memory))"
    }
    
    Write-Host $message -ForegroundColor $color
}

$LoopCount = 0
$ErrorThreshold = 3
$ConsecutiveErrors = @{
    Backend = 0
    Frontend = 0
    MongoDB = 0
}

Write-Host "`n" + "="*60
Write-Host "  HEALTH MONITORING (Press Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host "="*60 + "`n"

while ($true) {
    $LoopCount++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # Test MongoDB
    $mongoHealthy = Test-MongoDB
    if ($mongoHealthy) {
        $ConsecutiveErrors.MongoDB = 0
        Write-Status "MongoDB" $true
    } else {
        $ConsecutiveErrors.MongoDB++
        Write-Status "MongoDB" $false
        if ($ConsecutiveErrors.MongoDB -ge $ErrorThreshold) {
            Write-Host "  ⚠️  MongoDB unreachable - try: net start MongoDB" -ForegroundColor Yellow
        }
    }
    
    # Test Backend API
    $backendHealthy = Test-API "http://localhost:5000/api/health"
    $backendProc = Get-ProcessInfo "node"
    if ($backendHealthy) {
        $ConsecutiveErrors.Backend = 0
        Write-Status "Backend (5000)" $true $backendProc
    } else {
        $ConsecutiveErrors.Backend++
        Write-Status "Backend (5000)" $false $backendProc
        if ($ConsecutiveErrors.Backend -ge $ErrorThreshold) {
            Write-Host "  ⚠️  Backend not responding - restart with: cd backend && npm run dev" -ForegroundColor Yellow
        }
    }
    
    # Test Frontend
    $frontendHealthy = Test-API "http://localhost:5173"
    if ($frontendHealthy) {
        $ConsecutiveErrors.Frontend = 0
        Write-Status "Frontend (5173)" $true
    } else {
        $ConsecutiveErrors.Frontend++
        Write-Status "Frontend (5173)" $false
        if ($ConsecutiveErrors.Frontend -ge $ErrorThreshold) {
            Write-Host "  ⚠️  Frontend not responding - restart with: cd frontend && npm run dev" -ForegroundColor Yellow
        }
    }
    
    # Overall status
    $allHealthy = $mongoHealthy -and $backendHealthy -and $frontendHealthy
    $healthyServices = @($mongoHealthy, $backendHealthy, $frontendHealthy) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host ""
    if ($allHealthy) {
        Write-Host "  ✓ All systems operational (3/3 healthy)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $healthyServices/3 services healthy" -ForegroundColor Yellow
    }
    
    Write-Host "  Check #$LoopCount at $timestamp`n"
    
    Start-Sleep -Seconds 10
}
