# 🚀 Trektoo Travel Booking - Complete Project Helper

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Local Development Setup](#local-development-setup)
4. [Production Server Setup](#production-server-setup)
5. [Data Management](#data-management)
6. [Queue System](#queue-system)
7. [File Reference](#file-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Trektoo Travel Booking** is a Laravel + Next.js application that provides:
- ✅ **Activity Booking** - Browse and book travel activities
- ✅ **Hotel Booking** - Ratehawk integration for hotels
- ✅ **User Management** - Registration, login, notifications
- ✅ **Payment Processing** - Stripe integration
- ✅ **Admin Dashboard** - Manage bookings and activities
- ✅ **API Integration** - Klook activities, Ratehawk hotels
- ✅ **Automated Systems** - Queue processing, data refresh

---

## 🚀 Quick Start Guide

### **For New Developers:**
1. **Clone the repository**
2. **Follow Local Development Setup** (below)
3. **Run the setup commands**
4. **Start the development servers**

### **For Production Deployment:**
1. **Follow Production Server Setup** (below)
2. **Configure environment variables**
3. **Set up automated systems**
4. **Deploy and monitor**

---

## 🖥️ Local Development Setup

### **Prerequisites:**
- PHP 8.1+ with Laravel
- Node.js 18+ with Next.js
- Composer
- SQLite/MySQL database
- Git

### **Step 1: Environment Setup**
```bash
# Clone repository
git clone <repository-url>
cd trektoo_travel_booking

# Install PHP dependencies
composer install

# Install Node.js dependencies
cd frontend
npm install
cd ..

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite
```

### **Step 2: Database Setup**
```bash
# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

### **Step 3: Start Development Servers**

#### **Backend (Laravel):**
```bash
# Start Laravel server
php artisan serve
# Server runs on: http://localhost:8000
```

#### **Frontend (Next.js):**
```bash
# Start Next.js server
cd frontend
npm run dev
# Server runs on: http://localhost:3000
```

### **Step 4: Set Up Automated Systems**

#### **Queue Worker (Background Jobs):**
```bash
# Start queue worker for notifications
php artisan queue:start

# Check status
php artisan queue:status

# Stop when needed
php artisan queue:stop-worker
```

#### **Data Refresh (Activities):**
```bash
# Manual data dump (first time)
php artisan klook:dump-activities --limit=1000

# Set up automatic refresh (Windows Task Scheduler)
# 1. Open Task Scheduler
# 2. Create Basic Task: "Laravel Activities Scheduler"
# 3. Trigger: Daily, repeat every 1 minute
# 4. Action: Start a program
# 5. Program: C:\laragon\www\TREKTOO\trektoo_travel_booking\run-scheduler.bat
```

### **Step 5: Verify Setup**
```bash
# Check Laravel
php artisan --version

# Check database
php artisan tinker
>>> App\Models\Activity::count()

# Check queue
php artisan queue:status

# Check frontend
# Visit: http://localhost:3000
```

---

## 🌐 Production Server Setup

### **Prerequisites:**
- Linux server (Ubuntu/CentOS)
- PHP 8.1+ with extensions
- Nginx/Apache
- MySQL/PostgreSQL
- Node.js 18+
- Composer
- Git

### **Step 1: Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install nginx mysql-server php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd composer nodejs npm git -y

# Start services
sudo systemctl start nginx mysql
sudo systemctl enable nginx mysql
```

### **Step 2: Deploy Application**
```bash
# Clone repository
git clone <repository-url> /var/www/trektoo_travel_booking
cd /var/www/trektoo_travel_booking

# Set permissions
sudo chown -R www-data:www-data /var/www/trektoo_travel_booking
sudo chmod -R 755 /var/www/trektoo_travel_booking

# Install dependencies
composer install --optimize-autoloader --no-dev
cd frontend && npm install && npm run build && cd ..

# Configure environment
cp .env.example .env
nano .env
# Set: APP_ENV=production, APP_DEBUG=false, database credentials
```

### **Step 3: Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE trektoo_travel_booking;
CREATE USER 'trektoo_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON trektoo_travel_booking.* TO 'trektoo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
php artisan migrate --force
php artisan key:generate
```

### **Step 4: Configure Web Server**

#### **Nginx Configuration:**
```bash
sudo nano /etc/nginx/sites-available/trektoo
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/trektoo_travel_booking/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/trektoo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 5: Set Up Automated Systems**

#### **Queue Worker (Supervisor):**
```bash
# Install Supervisor
sudo apt install supervisor -y

# Create configuration
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/trektoo_travel_booking/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/trektoo_travel_booking/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Start Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

#### **Data Refresh (Crontab):**
```bash
# Set up crontab
crontab -e

# Add this line:
* * * * * cd /var/www/trektoo_travel_booking && php artisan schedule:run >> /dev/null 2>&1
```

### **Step 6: SSL Certificate (Optional)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Data Management

### **Activities Data (Klook Integration)**

#### **Manual Data Dump:**
```bash
# Small test dump
php artisan klook:dump-activities --limit=100

# Medium dump
php artisan klook:dump-activities --limit=1000

# Large dump (production)
php artisan klook:dump-activities --limit=50000
```

#### **Automatic Data Refresh:**
- **Local**: Every 2 hours, 5,000 activities
- **Production**: Every 6 hours, 50,000 activities
- **Logs**: `storage/logs/activities-refresh-*.log`

#### **Check Data Status:**
```bash
# Count activities
php artisan tinker
>>> App\Models\Activity::count()

# Check last update
>>> App\Models\Activity::orderBy('updated_at', 'desc')->first()->updated_at

# Check specific activity
>>> App\Models\Activity::where('activity_id', '12345')->first()
```

### **Hotel Data (Ratehawk Integration)**
```bash
# Sync hotel data
php artisan ratehawk:sync-hotels

# Check hotel cache
php artisan tinker
>>> App\Models\HotelCache::count()
```

---

## 🔄 Queue System

### **Queue Commands:**
```bash
# Start queue worker
php artisan queue:start

# Check status
php artisan queue:status

# Stop worker
php artisan queue:stop-worker

# View failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### **Queue Jobs:**
- **Welcome Notifications** - Sent when users register
- **Payment Processing** - Handle Stripe payments
- **Booking Confirmations** - Send booking emails
- **Data Sync** - Sync with external APIs

### **Monitor Queue:**
```bash
# Check queue status
php artisan queue:status

# View logs
tail -f storage/logs/laravel.log

# Check database
php artisan tinker
>>> DB::table('jobs')->count()
```

---

## 📁 File Reference

### **Batch/Shell Files:**

#### **Windows Files:**
- `run-scheduler.bat` - Runs Laravel scheduler
- `run-scheduler.ps1` - PowerShell version
- `start-queue-worker.bat` - Starts queue worker
- `start-queue-worker.ps1` - PowerShell version
- `run-queue-worker.bat` - Background queue worker
- `install-queue-service.bat` - Install Windows service

#### **Linux Files:**
- `config/supervisor.conf` - Supervisor configuration
- `config/laravel-worker.service` - Systemd service

### **Configuration Files:**
- `config/klook.php` - Klook API configuration
- `config/ratehawk.php` - Ratehawk API configuration
- `config/queue.php` - Queue configuration
- `config/mail.php` - Email configuration

### **Documentation Files:**
- `PROJECT_HELPER_DOC.md` - This file
- `QUEUE_WORKER_SETUP.md` - Queue setup guide
- `ACTIVITIES_DATA_REFRESH_GUIDE.md` - Data refresh guide
- `QUICK_REFERENCE.md` - Quick commands
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Production checklist

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Laravel Not Working:**
```bash
# Check PHP version
php --version

# Check Laravel
php artisan --version

# Check permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

#### **2. Database Issues:**
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Run migrations
php artisan migrate

# Check database file (SQLite)
ls -la database/database.sqlite
```

#### **3. Queue Not Working:**
```bash
# Check queue status
php artisan queue:status

# Restart queue
php artisan queue:restart

# Check failed jobs
php artisan queue:failed
```

#### **4. Frontend Not Loading:**
```bash
# Check Node.js
node --version
npm --version

# Install dependencies
cd frontend
npm install

# Build for production
npm run build

# Start development
npm run dev
```

#### **5. API Integration Issues:**
```bash
# Check API keys in .env
grep -E "(KLOOK|RATEHAWK)" .env

# Test API connection
php artisan tinker
>>> app(\App\Services\Klook\KlookApiService::class)->testConnection()
```

### **Log Files:**
- `storage/logs/laravel.log` - General Laravel logs
- `storage/logs/activities-refresh-*.log` - Data refresh logs
- `storage/logs/worker.log` - Queue worker logs

### **Check System Status:**
```bash
# Overall status
php artisan about

# Check scheduled tasks
php artisan schedule:list

# Check queue
php artisan queue:status

# Check database
php artisan tinker
>>> App\Models\Activity::count()
>>> App\Models\User::count()
>>> DB::table('jobs')->count()
```

---

## 🎯 Quick Commands Summary

### **Development:**
```bash
# Start everything
php artisan serve &
cd frontend && npm run dev &
php artisan queue:start

# Check status
php artisan queue:status
php artisan schedule:list

# Stop everything
php artisan queue:stop-worker
```

### **Production:**
```bash
# Deploy
git pull origin main
composer install --optimize-autoloader --no-dev
cd frontend && npm run build && cd ..
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo supervisorctl restart laravel-worker:*
sudo systemctl reload nginx
```

---

## 📞 Support

### **If You Need Help:**
1. Check this documentation first
2. Check the troubleshooting section
3. Check log files for errors
4. Test individual components
5. Contact the development team

### **Useful Resources:**
- [Laravel Documentation](https://laravel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Klook API Documentation](https://developers.klook.com/)

---

**🎉 You're all set! This project should now run smoothly on both local and production environments.**

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Complete Setup Guide
