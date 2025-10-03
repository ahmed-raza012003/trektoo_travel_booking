# PowerShell script to start Laravel Queue Worker
Write-Host "Starting Laravel Queue Worker..." -ForegroundColor Green
Write-Host "This will run in the background and process queued jobs automatically." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the worker." -ForegroundColor Yellow
Write-Host ""

# Change to the project directory
Set-Location $PSScriptRoot

# Start the queue worker
php artisan queue:work --verbose --tries=3 --timeout=90 --memory=512
