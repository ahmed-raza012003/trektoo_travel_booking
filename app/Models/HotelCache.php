<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class HotelCache extends Model
{
    use HasFactory;

    protected $table = 'hotel_cache';

    protected $fillable = [
        'cache_key',
        'cache_type',
        'hotel_id',
        'search_hash',
        'data',
        'metadata',
        'expires_at',
        'access_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeByType($query, string $type)
    {
        return $query->where('cache_type', $type);
    }

    public function scopeByHotelId($query, string $hotelId)
    {
        return $query->where('hotel_id', $hotelId);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getIsValidAttribute(): bool
    {
        return $this->expires_at->isFuture();
    }

    /*
    |--------------------------------------------------------------------------
    | STATIC METHODS
    |--------------------------------------------------------------------------
    */

    public static function get(string $cacheKey): ?array
    {
        $cache = static::where('cache_key', $cacheKey)
            ->where('expires_at', '>', now())
            ->first();

        if ($cache) {
            $cache->incrementAccess();
            return $cache->data;
        }

        return null;
    }

    public static function put(string $cacheKey, array $data, int $ttl = null): void
    {
        $ttl = $ttl ?? config('ratehawk.cache_ttl', 3600);
        
        static::updateOrCreate(
            ['cache_key' => $cacheKey],
            [
                'data' => $data,
                'expires_at' => now()->addSeconds($ttl),
                'access_count' => 0,
                'last_accessed_at' => null,
            ]
        );
    }

    public static function forget(string $cacheKey): bool
    {
        return static::where('cache_key', $cacheKey)->delete() > 0;
    }

    public static function cleanupExpired(): int
    {
        return static::expired()->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | INSTANCE METHODS
    |--------------------------------------------------------------------------
    */

    public function incrementAccess(): void
    {
        $this->update([
            'access_count' => $this->access_count + 1,
            'last_accessed_at' => now(),
        ]);
    }

    public function extendTtl(int $seconds): void
    {
        $this->update([
            'expires_at' => $this->expires_at->addSeconds($seconds)
        ]);
    }
}
