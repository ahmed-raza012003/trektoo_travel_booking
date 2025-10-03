# 🚀 Quick Reference - Activities Data Refresh

## 📋 Current Status
- **Local (Windows)**: ✅ COMPLETE
- **Production (Linux)**: ❌ PENDING

## 🖥️ Local Environment (Windows)
- **Status**: ✅ Working
- **Frequency**: Every 2 hours
- **Limit**: 5,000 activities
- **Task Scheduler**: Set up and running
- **Log File**: `storage/logs/activities-refresh-prod.log`

## 🐧 Production Environment (Linux)
- **Status**: ❌ Not set up
- **Frequency**: Every 6 hours
- **Limit**: 50,000 activities
- **Crontab**: Needs to be set up
- **Log File**: `storage/logs/activities-refresh-prod.log`

## 🔧 Quick Commands

### **Manual Refresh:**
```bash
php artisan activities:refresh-prod    # Production (50k)
php artisan activities:refresh-dev     # Development (5k)
php artisan klook:dump-activities --limit=1000  # Custom
```

### **Check Status:**
```bash
php artisan schedule:list              # List scheduled tasks
php artisan schedule:run               # Run scheduler manually
php artisan tinker --execute="echo app()->environment();"  # Check environment
```

### **Check Database:**
```bash
php artisan tinker
>>> App\Models\Activity::count()       # Count activities
>>> App\Models\Activity::orderBy('updated_at', 'desc')->first()->updated_at  # Last update
```

### **Check Logs:**
```bash
# Windows
dir storage\logs\activities-refresh-prod.log
type storage\logs\activities-refresh-prod.log

# Linux
ls -la storage/logs/activities-refresh-prod.log
tail -f storage/logs/activities-refresh-prod.log
```

## 🚀 Production Setup (To Do)

### **1. SSH to Server:**
```bash
ssh your-username@your-server-ip
```

### **2. Navigate to Project:**
```bash
cd /path/to/your/trektoo_travel_booking
```

### **3. Set Up Crontab:**
```bash
crontab -e
# Add this line:
* * * * * cd /path/to/your/trektoo_travel_booking && php artisan schedule:run >> /dev/null 2>&1
```

### **4. Test:**
```bash
php artisan schedule:run
php artisan activities:refresh-prod
```

## 📊 Environment Detection

| Environment | Limit | Frequency | Delay | Log File |
|-------------|-------|-----------|-------|----------|
| **Local** | 5,000 | 2 hours | 1s | `activities-refresh-dev.log` |
| **Production** | 50,000 | 6 hours | 2s | `activities-refresh-prod.log` |

## 🚨 Troubleshooting

### **Local Issues:**
- Check Task Scheduler → Laravel Activities Scheduler
- Verify "Last Run Result" is "0x0"
- Test: `php artisan schedule:run`

### **Production Issues:**
- Check crontab: `crontab -l`
- Check cron service: `systemctl status cron`
- Test: `php artisan schedule:run`

## 📁 Files Created
- `ACTIVITIES_DATA_REFRESH_GUIDE.md` - Complete documentation
- `QUICK_REFERENCE.md` - This file
- `run-scheduler.bat` - Windows batch script
- `run-scheduler.ps1` - PowerShell script

---
**Last Updated**: October 4, 2025
