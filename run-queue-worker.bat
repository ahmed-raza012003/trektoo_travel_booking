@echo off
REM This file runs the queue worker in the background
REM It creates a PID file for tracking

cd /d "%~dp0"

REM Create PID file with current process ID
echo %~1 > storage\queue-worker.pid

REM Run the queue worker
php artisan queue:work --verbose --tries=3 --timeout=90 --memory=512
