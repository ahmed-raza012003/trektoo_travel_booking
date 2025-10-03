# 🚀 Laravel Queue Worker Setup Guide

This guide will help you set up automatic queue processing for your Laravel application, so you don't have to manually run `php artisan queue:listen` anymore.

## 📋 What This Solves

- **Welcome Notifications** will be sent automatically when users register
- **Background jobs** will be processed without manual intervention
- **Email notifications** will be sent in the background
- **Queue processing** works on both local and production environments

## 🏠 Local Development Setup

### Option 1: Quick Start (Recommended)
```bash
# Start the queue worker in background
php artisan queue:start

# Check if it's running
php artisan queue:status

# Stop the worker
php artisan queue:stop-worker
```

### Option 2: Manual Start
```bash
# Windows
start-queue-worker.bat

# PowerShell
.\start-queue-worker.ps1

# Or directly
php artisan queue:work --verbose --tries=3 --timeout=90 --memory=512
```

### Option 3: Windows Service (Advanced)
```bash
# Run as Administrator
install-queue-service.bat
```

## 🚀 Production Server Setup

### For Linux/Ubuntu Servers

#### Option 1: Supervisor (Recommended)
```bash
# Install Supervisor
sudo apt-get install supervisor

# Copy the configuration
sudo cp config/supervisor.conf /etc/supervisor/conf.d/laravel-worker.conf

# Edit the paths in the config file
sudo nano /etc/supervisor/conf.d/laravel-worker.conf

# Update and start
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

#### Option 2: Systemd Service
```bash
# Copy the service file
sudo cp config/laravel-worker.service /etc/systemd/system/

# Edit the paths
sudo nano /etc/systemd/system/laravel-worker.service

# Enable and start
sudo systemctl enable laravel-worker
sudo systemctl start laravel-worker
```

### For Windows Servers

#### Option 1: Windows Service
```bash
# Run as Administrator
install-queue-service.bat
```

#### Option 2: Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "At startup"
4. Action: Start a program
5. Program: `php`
6. Arguments: `artisan queue:work --sleep=3 --tries=3 --max-time=3600`
7. Start in: Your project directory

## 🔧 Configuration

### Queue Driver
Make sure your `.env` file has:
```env
QUEUE_CONNECTION=database
```

### Database Tables
The required tables should already exist:
- `jobs` - Stores queued jobs
- `failed_jobs` - Stores failed jobs
- `job_batches` - Stores job batches

## 📊 Monitoring

### Check Queue Status
```bash
# Check if worker is running
php artisan queue:status

# View failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### View Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Worker logs (if using supervisor)
tail -f storage/logs/worker.log
```

## 🧪 Testing

### Test Welcome Notification
1. Register a new user through your frontend
2. Check the `jobs` table: `SELECT * FROM jobs;`
3. The job should be processed automatically
4. Check your email for the welcome message

### Test Queue Processing
```bash
# Dispatch a test job
php artisan tinker
>>> dispatch(new \App\Jobs\TestJob());
>>> exit

# Check if it was processed
php artisan queue:status
```

## 🛠️ Troubleshooting

### Common Issues

#### Worker Not Starting
```bash
# Check PHP path
which php

# Check permissions
ls -la storage/

# Check logs
tail -f storage/logs/laravel.log
```

#### Jobs Not Processing
```bash
# Check queue connection
php artisan config:show queue

# Check database connection
php artisan migrate:status

# Restart worker
php artisan queue:restart
```

#### Memory Issues
```bash
# Increase memory limit
php artisan queue:work --memory=1024

# Or in php.ini
memory_limit = 512M
```

## 📈 Performance Tips

### For High Traffic
```bash
# Run multiple workers
php artisan queue:work --sleep=1 --tries=3 --max-time=3600 &
php artisan queue:work --sleep=1 --tries=3 --max-time=3600 &
```

### For Production
- Use **Supervisor** or **systemd** for automatic restarts
- Set up **monitoring** with tools like Laravel Horizon
- Configure **log rotation** to prevent disk space issues
- Use **Redis** instead of database for better performance

## 🔄 Maintenance

### Regular Tasks
```bash
# Restart workers (deploy new code)
php artisan queue:restart

# Clean old jobs
php artisan queue:prune-batches --hours=24

# Monitor failed jobs
php artisan queue:failed
```

## 📞 Support

If you encounter any issues:
1. Check the logs: `storage/logs/laravel.log`
2. Verify queue configuration: `php artisan config:show queue`
3. Test database connection: `php artisan migrate:status`
4. Check worker status: `php artisan queue:status`

---

**🎉 That's it! Your queue workers will now run automatically and process Welcome Notifications and other background jobs without manual intervention.**
