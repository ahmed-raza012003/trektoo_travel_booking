# 🚀 Activities Data Refresh System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [What We've Implemented](#what-weve-implemented)
3. [Local Environment Setup](#local-environment-setup)
4. [Production Environment Setup](#production-environment-setup)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Commands Reference](#commands-reference)

---

## 🎯 Overview

This system automatically refreshes activities data from Klook API at regular intervals, ensuring your database always has the latest activity information without manual intervention.

### **Key Features:**
- ✅ **Environment Detection** - Automatically detects local vs production
- ✅ **Smart Scheduling** - Different limits and frequencies per environment
- ✅ **Automatic Execution** - Runs without manual intervention
- ✅ **Comprehensive Logging** - Tracks all operations
- ✅ **Error Handling** - Robust error management
- ✅ **API Rate Limiting** - Respects Klook API limits

---

## 🛠️ What We've Implemented

### **1. Environment Detection System**
- **Automatic detection** of local vs production environments
- **Different configurations** for each environment
- **Smart limits** based on environment type

### **2. Laravel Scheduler Configuration**
- **Console routes** with environment-based scheduling
- **Production**: 50,000 activities every 6 hours
- **Local/Development**: 5,000 activities every 2 hours
- **Staging**: 10,000 activities every 4 hours

### **3. Enhanced Dump Command**
- **Environment-specific limits** and delays
- **Progress tracking** with progress bars
- **Detailed logging** for each environment
- **Error handling** and API rate limiting

### **4. Manual Commands**
- `php artisan activities:refresh-prod` - Production refresh
- `php artisan activities:refresh-dev` - Development refresh
- `php artisan klook:dump-activities --limit=X` - Custom limit

### **5. Logging System**
- **Separate log files** for each environment
- **Production**: `storage/logs/activities-refresh-prod.log`
- **Development**: `storage/logs/activities-refresh-dev.log`
- **Staging**: `storage/logs/activities-refresh-staging.log`

---

## 🖥️ Local Environment Setup

### **Current Status: ✅ COMPLETE**

#### **What's Working:**
- ✅ **Environment Detection** - Working perfectly
- ✅ **Scheduled Commands** - Configured correctly
- ✅ **Manual Commands** - Working (`php artisan activities:refresh-prod`)
- ✅ **Different Limits** - 5k for local, 50k for production
- ✅ **Windows Task Scheduler** - Set up and ready

#### **Windows Task Scheduler Configuration:**
- **Task Name**: `Laravel Activities Scheduler`
- **Trigger**: Daily, repeat every 1 minute
- **Action**: Run `C:\laragon\www\TREKTOO\trektoo_travel_booking\run-scheduler.bat`
- **Settings**: Run with highest privileges, allow on demand

#### **Files Created:**
- `run-scheduler.bat` - Windows batch script
- `run-scheduler.ps1` - PowerShell script (alternative)

#### **How to Verify Local Setup:**
```bash
# Check if task is running
# Go to Task Scheduler → Task Scheduler Library → Laravel Activities Scheduler
# Check "Last Run Result" - should show "0x0" (success)

# Check logs
dir storage\logs\activities-refresh-prod.log

# Check database count
php artisan tinker
>>> App\Models\Activity::count()
```

---

## 🐧 Production Environment Setup

### **Current Status: ❌ NOT IMPLEMENTED**

#### **What You Need to Do on Live Server:**

### **Step 1: Access Production Server**
```bash
# SSH into your production server
ssh your-username@your-server-ip
# or
ssh your-username@your-domain.com
```

### **Step 2: Navigate to Project Directory**
```bash
# Navigate to your Laravel project directory
cd /path/to/your/trektoo_travel_booking

# Verify you're in the right directory
pwd
ls -la
```

### **Step 3: Verify Laravel is Working**
```bash
# Check if Laravel is working
php artisan --version

# Check current environment
php artisan tinker --execute="echo app()->environment();"

# Should show "production"
```

### **Step 4: Set Up Crontab**
```bash
# Edit the crontab
crontab -e

# Add this line (replace /path/to/your/project with actual path):
* * * * * cd /path/to/your/trektoo_travel_booking && php artisan schedule:run >> /dev/null 2>&1

# Save and exit (in nano: Ctrl+X, then Y, then Enter)
# Save and exit (in vim: :wq)
```

### **Step 5: Verify Crontab is Set Up**
```bash
# Check if crontab was added
crontab -l

# You should see:
# * * * * * cd /path/to/your/trektoo_travel_booking && php artisan schedule:run >> /dev/null 2>&1
```

### **Step 6: Test the Setup**
```bash
# Test the scheduler manually
php artisan schedule:run

# Test the production command
php artisan activities:refresh-prod

# Check if it's working
php artisan schedule:list
```

### **Step 7: Monitor the Logs**
```bash
# Check if log file is created
ls -la storage/logs/

# Monitor the log file in real-time
tail -f storage/logs/activities-refresh-prod.log

# Check database count
php artisan tinker
>>> App\Models\Activity::count()
```

---

## 📊 Environment Configurations

| Environment | Limit | Frequency | Delay | Log File | Description |
|-------------|-------|-----------|-------|----------|-------------|
| **Local/Development** | 5,000 | Every 2 hours | 1 second | `activities-refresh-dev.log` | Fast testing |
| **Staging** | 10,000 | Every 4 hours | 1 second | `activities-refresh-staging.log` | Medium testing |
| **Production** | 50,000 | Every 6 hours | 2 seconds | `activities-refresh-prod.log` | Full dataset |

---

## 🔍 Monitoring & Maintenance

### **Check if System is Working:**

#### **Local (Windows):**
```bash
# Check Task Scheduler
# Go to Task Scheduler → Laravel Activities Scheduler
# Check "Last Run Result" and "Last Run Time"

# Check logs
dir storage\logs\activities-refresh-prod.log

# Check database
php artisan tinker
>>> App\Models\Activity::count()
```

#### **Production (Linux):**
```bash
# Check crontab
crontab -l

# Check cron service
systemctl status cron

# Check logs
tail -f storage/logs/activities-refresh-prod.log

# Check database
php artisan tinker
>>> App\Models\Activity::count()
```

### **Log Files to Monitor:**
- `storage/logs/activities-refresh-prod.log` - Production activities refresh
- `storage/logs/activities-refresh-dev.log` - Development activities refresh
- `storage/logs/activities-refresh-staging.log` - Staging activities refresh
- `storage/logs/scheduler.log` - General scheduler logs (if using shell script)

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Task Scheduler Not Running (Local)**
```bash
# Check if task exists
# Go to Task Scheduler → Task Scheduler Library
# Look for "Laravel Activities Scheduler"

# Check task status
# Right-click task → Properties → Check settings

# Test manually
php artisan schedule:run
```

#### **2. Crontab Not Working (Production)**
```bash
# Check if cron service is running
sudo systemctl start cron
sudo systemctl enable cron

# Check cron logs
sudo tail -f /var/log/cron
# or
sudo tail -f /var/log/syslog | grep CRON

# Use full path in crontab
* * * * * /usr/bin/php /path/to/your/project/artisan schedule:run
```

#### **3. Laravel Commands Not Working**
```bash
# Check PHP path
which php

# Check Laravel installation
php artisan --version

# Check permissions
chmod -R 775 storage/
chown -R www-data:www-data storage/
```

#### **4. No Log Files Created**
```bash
# Check if scheduled tasks are running
php artisan schedule:list

# Check if tasks are due
php artisan schedule:run

# Check Laravel logs
tail -f storage/logs/laravel.log
```

---

## 📚 Commands Reference

### **Manual Commands:**
```bash
# Refresh activities manually
php artisan activities:refresh-prod    # Production (50k activities)
php artisan activities:refresh-dev     # Development (5k activities)

# Custom limit
php artisan klook:dump-activities --limit=1000

# Check scheduler
php artisan schedule:list
php artisan schedule:run

# Check environment
php artisan tinker --execute="echo app()->environment();"
```

### **Database Commands:**
```bash
# Check activity count
php artisan tinker
>>> App\Models\Activity::count()

# Check last updated activity
php artisan tinker
>>> App\Models\Activity::orderBy('updated_at', 'desc')->first()->updated_at

# Check specific activity
php artisan tinker
>>> App\Models\Activity::where('activity_id', '12345')->first()
```

### **Log Commands:**
```bash
# View logs
tail -f storage/logs/activities-refresh-prod.log
tail -f storage/logs/activities-refresh-dev.log

# Check log file size
ls -la storage/logs/activities-refresh-*.log
```

---

## 🎯 Expected Results

### **After Complete Setup:**

#### **Local Environment:**
- **Every 2 hours**: 5,000 activities refreshed
- **Logs**: `storage/logs/activities-refresh-dev.log`
- **Database**: Always fresh data
- **No manual work**: Fully automated

#### **Production Environment:**
- **Every 6 hours**: 50,000 activities refreshed
- **Logs**: `storage/logs/activities-refresh-prod.log`
- **Database**: Always fresh data
- **No manual work**: Fully automated

---

## 📝 Quick Setup Checklist

### **Local (Windows) - ✅ COMPLETE**
- [x] Environment detection working
- [x] Scheduler configured
- [x] Windows Task Scheduler set up
- [x] Manual commands working
- [x] Logging system ready

### **Production (Linux) - ❌ TODO**
- [ ] SSH access to production server
- [ ] Navigate to project directory
- [ ] Verify Laravel is working
- [ ] Set up crontab
- [ ] Test scheduler
- [ ] Monitor logs
- [ ] Verify database updates

---

## 🚀 Next Steps

1. **Deploy to production** with this guide
2. **Set up crontab** on live server
3. **Monitor logs** for first few days
4. **Verify data freshness** regularly
5. **Adjust limits** if needed based on usage

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all steps were followed correctly
3. Check logs for error messages
4. Test manual commands first
5. Contact support if needed

---

**Last Updated**: October 4, 2025
**Version**: 1.0
**Status**: Local Complete, Production Pending
