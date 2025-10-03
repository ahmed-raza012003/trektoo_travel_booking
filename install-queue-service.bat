@echo off
echo Installing Laravel Queue Worker as Windows Service...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - OK
) else (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Install NSSM (Non-Sucking Service Manager) if not installed
if not exist "C:\nssm\nssm.exe" (
    echo Downloading NSSM...
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'"
    powershell -Command "Expand-Archive -Path 'nssm.zip' -DestinationPath 'C:\' -Force"
    move "C:\nssm-2.24\win64\nssm.exe" "C:\nssm\"
    rmdir /s /q "C:\nssm-2.24"
    del "nssm.zip"
)

REM Get current directory
set PROJECT_DIR=%~dp0
set PHP_PATH=php

REM Install the service
echo Installing Laravel Queue Worker service...
C:\nssm\nssm.exe install "LaravelQueueWorker" "%PHP_PATH%" "artisan queue:work --sleep=3 --tries=3 --max-time=3600"
C:\nssm\nssm.exe set "LaravelQueueWorker" AppDirectory "%PROJECT_DIR%"
C:\nssm\nssm.exe set "LaravelQueueWorker" DisplayName "Laravel Queue Worker"
C:\nssm\nssm.exe set "LaravelQueueWorker" Description "Laravel Queue Worker for processing background jobs"
C:\nssm\nssm.exe set "LaravelQueueWorker" Start SERVICE_AUTO_START

REM Start the service
echo Starting service...
C:\nssm\nssm.exe start "LaravelQueueWorker"

echo.
echo ✅ Laravel Queue Worker service installed and started!
echo.
echo To manage the service:
echo   - Start:   C:\nssm\nssm.exe start LaravelQueueWorker
echo   - Stop:    C:\nssm\nssm.exe stop LaravelQueueWorker
echo   - Remove:  C:\nssm\nssm.exe remove LaravelQueueWorker confirm
echo.
pause
