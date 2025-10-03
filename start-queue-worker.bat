@echo off
echo Starting Laravel Queue Worker...
echo This will run in the background and process queued jobs automatically.
echo Press Ctrl+C to stop the worker.
echo.

cd /d "%~dp0"
php artisan queue:work --verbose --tries=3 --timeout=90 --memory=512
