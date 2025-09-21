<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ratehawk API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Ratehawk (Emerging Travel Group) API integration
    | Based on official documentation: https://docs.emergingtravel.com/docs/overview/
    |
    */

    'api_key' => env('RATEHAWK_API_KEY'),
    'api_user' => env('RATEHAWK_API_USER'),
    'base_url' => env('RATEHAWK_BASE_URL', 'https://api.worldota.net/api/b2b/v3'),
    
    // Commission and pricing
    'commission_rate' => env('RATEHAWK_COMMISSION_RATE', 0.10), // 10% commission
    'default_currency' => env('RATEHAWK_DEFAULT_CURRENCY', 'USD'),
    'default_language' => env('RATEHAWK_DEFAULT_LANGUAGE', 'en'),
    
    // API settings
    'timeout' => env('RATEHAWK_TIMEOUT', 30),
    'retry_attempts' => env('RATEHAWK_RETRY_ATTEMPTS', 3),
    'retry_delay' => env('RATEHAWK_RETRY_DELAY', 1000), // milliseconds
    
    // Rate limits and caching
    'cache_ttl' => env('RATEHAWK_CACHE_TTL', 3600), // 1 hour
    'hotel_details_cache_ttl' => env('RATEHAWK_HOTEL_CACHE_TTL', 7200), // 2 hours
    
    // Booking settings
    'max_booking_days' => env('RATEHAWK_MAX_BOOKING_DAYS', 30),
    'max_guests_per_room' => env('RATEHAWK_MAX_GUESTS', 6),
    'max_children_per_room' => env('RATEHAWK_MAX_CHILDREN', 4),
    
    // Payment settings
    'payment_timeout' => env('RATEHAWK_PAYMENT_TIMEOUT', 3600), // 1 hour
    'booking_expiry_minutes' => env('RATEHAWK_BOOKING_EXPIRY', 30), // 30 minutes
    
    // Webhook settings
    'webhook_secret' => env('RATEHAWK_WEBHOOK_SECRET'),
    'webhook_url' => env('RATEHAWK_WEBHOOK_URL'),
    
    // Feature flags
    'enable_caching' => env('RATEHAWK_ENABLE_CACHING', true),
    'enable_logging' => env('RATEHAWK_ENABLE_LOGGING', true),
    'enable_webhooks' => env('RATEHAWK_ENABLE_WEBHOOKS', true),
];
