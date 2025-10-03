# 🚀 Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### **1. Code Verification**
- [ ] All code changes committed to git
- [ ] Environment detection working locally
- [ ] Manual commands tested
- [ ] Scheduler configuration verified
- [ ] Logging system working

### **2. Server Requirements**
- [ ] PHP 8.1+ installed
- [ ] Composer installed
- [ ] Laravel dependencies installed
- [ ] Database configured
- [ ] Storage permissions set correctly

### **3. Environment Configuration**
- [ ] `.env` file configured for production
- [ ] `APP_ENV=production` set
- [ ] Database credentials updated
- [ ] API keys configured
- [ ] Logging configured

---

## 🚀 Deployment Steps

### **Step 1: Deploy Code**
```bash
# On production server
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Step 2: Set Up Database**
```bash
# Run migrations
php artisan migrate --force

# Check database connection
php artisan tinker --execute="echo 'DB Connected: ' . (DB::connection()->getPdo() ? 'Yes' : 'No');"
```

### **Step 3: Set Up Crontab**
```bash
# Edit crontab
crontab -e

# Add this line (replace with actual path):
* * * * * cd /path/to/your/trektoo_travel_booking && php artisan schedule:run >> /dev/null 2>&1

# Verify crontab
crontab -l
```

### **Step 4: Test the Setup**
```bash
# Test environment detection
php artisan tinker --execute="echo 'Environment: ' . app()->environment();"

# Test scheduler
php artisan schedule:list

# Test manual refresh
php artisan activities:refresh-prod

# Check logs
ls -la storage/logs/
```

### **Step 5: Verify Automatic Execution**
```bash
# Wait a few minutes, then check
tail -f storage/logs/activities-refresh-prod.log

# Check database
php artisan tinker
>>> App\Models\Activity::count()
```

---

## 🔍 Post-Deployment Verification

### **1. Environment Check**
```bash
php artisan tinker --execute="echo 'Environment: ' . app()->environment();"
# Should output: Environment: production
```

### **2. Scheduler Check**
```bash
php artisan schedule:list
# Should show: 0 */6 * * * php artisan klook:dump-activities --limit=50000
```

### **3. Manual Test**
```bash
php artisan activities:refresh-prod
# Should start fetching activities and show progress
```

### **4. Log Check**
```bash
ls -la storage/logs/activities-refresh-prod.log
# File should exist and have content
```

### **5. Database Check**
```bash
php artisan tinker
>>> App\Models\Activity::count()
# Should show number of activities in database
```

---

## 📊 Monitoring Setup

### **1. Log Monitoring**
```bash
# Monitor activities refresh log
tail -f storage/logs/activities-refresh-prod.log

# Monitor general Laravel log
tail -f storage/logs/laravel.log
```

### **2. Cron Monitoring**
```bash
# Check if cron is running
systemctl status cron

# Check cron logs
tail -f /var/log/cron
# or
tail -f /var/log/syslog | grep CRON
```

### **3. Database Monitoring**
```bash
# Check activity count
php artisan tinker
>>> App\Models\Activity::count()

# Check last update time
php artisan tinker
>>> App\Models\Activity::orderBy('updated_at', 'desc')->first()->updated_at
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Crontab Not Working**
```bash
# Check if cron service is running
sudo systemctl start cron
sudo systemctl enable cron

# Check cron logs
sudo tail -f /var/log/cron

# Use full path in crontab
* * * * * /usr/bin/php /path/to/your/project/artisan schedule:run
```

#### **2. Laravel Commands Not Working**
```bash
# Check PHP path
which php

# Check Laravel installation
php artisan --version

# Check permissions
chmod -R 775 storage/
chown -R www-data:www-data storage/
```

#### **3. No Log Files Created**
```bash
# Check if scheduled tasks are running
php artisan schedule:list

# Check if tasks are due
php artisan schedule:run

# Check Laravel logs
tail -f storage/logs/laravel.log
```

#### **4. Database Connection Issues**
```bash
# Check database connection
php artisan tinker --execute="echo 'DB Connected: ' . (DB::connection()->getPdo() ? 'Yes' : 'No');"

# Check .env file
cat .env | grep DB_
```

---

## 📈 Performance Monitoring

### **1. Execution Time**
- Monitor how long each refresh takes
- Check logs for any performance issues
- Adjust limits if needed

### **2. Memory Usage**
- Monitor memory usage during refresh
- Check for memory leaks
- Optimize if necessary

### **3. API Rate Limits**
- Monitor API response times
- Check for rate limit errors
- Adjust delays if needed

---

## 🔄 Maintenance Schedule

### **Daily:**
- Check logs for errors
- Verify data is being refreshed
- Monitor system performance

### **Weekly:**
- Check database size
- Review log files
- Test manual commands

### **Monthly:**
- Review performance metrics
- Check for any issues
- Update documentation if needed

---

## 📞 Support Contacts

- **Technical Issues**: Check troubleshooting section
- **Laravel Issues**: Laravel documentation
- **Server Issues**: Server administrator
- **API Issues**: Klook support

---

## ✅ Final Checklist

- [ ] Code deployed successfully
- [ ] Database migrations run
- [ ] Crontab configured
- [ ] Environment set to production
- [ ] Scheduler working
- [ ] Manual commands working
- [ ] Logs being created
- [ ] Data being refreshed automatically
- [ ] Monitoring set up
- [ ] Documentation updated

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Status**: ___________

---
**Last Updated**: October 4, 2025
