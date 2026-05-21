@echo off
REM ==============================================================
REM Election Voting System - Complete Startup Script
REM ==============================================================

echo.
echo ============================================
echo   ELECTION VOTING SYSTEM - STARTUP GUIDE
echo ============================================
echo.

REM Check if MongoDB is running
echo [1] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MongoDB is running
) else (
    echo ⚠ MongoDB is NOT running. Starting...
    net start MongoDB
    timeout /t 2
)

echo.
echo [2] Backend Setup & Seeding...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

echo Seeding database...
call npm run seed
if "%ERRORLEVEL%" neq "0" (
    echo ✗ Seeding failed! Check MongoDB connection.
    pause
    exit /b 1
)

echo.
echo [3] Frontend Setup...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo ============================================
echo   ✓ ALL CHECKS COMPLETE
echo ============================================
echo.
echo NEXT STEPS - Open TWO terminals:
echo.
echo Terminal 1 - Start Backend:
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 - Start Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Admin Credentials:
echo   Email: admin@voting.com
echo   Password: Admin@123456
echo.
pause
