<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

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
