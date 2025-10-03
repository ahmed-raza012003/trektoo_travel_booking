<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Queue Management Commands
Artisan::command('queue:start', function () {
    $this->info('🚀 Starting queue worker...');
    $this->call('queue:start-worker', ['--daemon' => true]);
})->purpose('Start the queue worker in background');

Artisan::command('queue:status', function () {
    $pidFile = storage_path('queue-worker.pid');
    
    if (file_exists($pidFile)) {
        $pid = trim(file_get_contents($pidFile));
        $this->info("✅ Queue worker is running (PID: {$pid})");
        
        // Check if process is actually running
        if (PHP_OS_FAMILY === 'Windows') {
            $result = \Illuminate\Support\Facades\Process::run("tasklist /FI \"PID eq {$pid}\"");
            if (strpos($result->output(), $pid) !== false) {
                $this->info('🟢 Worker process is active');
            } else {
                $this->warn('🟡 Worker process not found - may need restart');
            }
        } else {
            if (posix_kill($pid, 0)) {
                $this->info('🟢 Worker process is active');
            } else {
                $this->warn('🟡 Worker process not found - may need restart');
            }
        }
    } else {
        $this->warn('❌ Queue worker is not running');
        $this->info('💡 Start it with: php artisan queue:start');
    }
})->purpose('Check queue worker status');

// Environment-based activities data refresh
if (app()->environment('local', 'development')) {
    // Local/Development Environment - 5,000 activities every 2 hours
    Schedule::command('klook:dump-activities --limit=5000')
        ->everyTwoHours()
        ->withoutOverlapping()
        ->runInBackground()
        ->appendOutputTo(storage_path('logs/activities-refresh-dev.log'));
        
    Artisan::command('activities:refresh-dev', function () {
        $this->info('🔄 Refreshing activities for development environment...');
        $this->call('klook:dump-activities', ['--limit' => 5000]);
    })->purpose('Manually refresh activities for development');
    
} elseif (app()->environment('production')) {
    // Production Environment - 50,000 activities every 6 hours
    Schedule::command('klook:dump-activities --limit=50000')
        ->everySixHours()
        ->withoutOverlapping()
        ->runInBackground()
        ->appendOutputTo(storage_path('logs/activities-refresh-prod.log'));
        
    Artisan::command('activities:refresh-prod', function () {
        $this->info('🚀 Refreshing activities for production environment...');
        $this->call('klook:dump-activities', ['--limit' => 50000]);
    })->purpose('Manually refresh activities for production');
    
} else {
    // Staging/Testing Environment - 10,000 activities every 4 hours
    Schedule::command('klook:dump-activities --limit=10000')
        ->everyFourHours()
        ->withoutOverlapping()
        ->runInBackground()
        ->appendOutputTo(storage_path('logs/activities-refresh-staging.log'));
}
