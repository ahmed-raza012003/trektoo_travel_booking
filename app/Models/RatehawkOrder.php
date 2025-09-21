<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class RatehawkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'partner_order_id',
        'book_hash',
        'ratehawk_order_id',
        'payment_type',
        'booking_data',
        'guest_info',
        'hotel_info',
        'rate_info',
        'status',
        'ratehawk_status',
        'status_message',
        'expires_at',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_data' => 'array',
        'guest_info' => 'array',
        'hotel_info' => 'array',
        'rate_info' => 'array',
        'expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
                    ->whereIn('status', ['pending', 'processing']);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getIsActiveAttribute(): bool
    {
        return !$this->is_expired && in_array($this->status, ['pending', 'processing']);
    }

    public function getHotelNameAttribute(): ?string
    {
        return $this->hotel_info['name'] ?? null;
    }

    public function getTotalAmountAttribute(): ?float
    {
        return $this->rate_info['total_amount'] ?? null;
    }

    public function getCurrencyAttribute(): ?string
    {
        return $this->rate_info['currency'] ?? null;
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS METHODS
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /*
    |--------------------------------------------------------------------------
    | ACTION METHODS
    |--------------------------------------------------------------------------
    */

    public function markAsProcessing(string $message = null): void
    {
        $this->update([
            'status' => 'processing',
            'status_message' => $message,
            'ratehawk_status' => 'processing'
        ]);
    }

    public function markAsConfirmed(string $ratehawkOrderId = null, string $message = null): void
    {
        $this->update([
            'status' => 'confirmed',
            'ratehawk_order_id' => $ratehawkOrderId,
            'confirmed_at' => now(),
            'status_message' => $message,
            'ratehawk_status' => 'confirmed'
        ]);
    }

    public function markAsCancelled(string $message = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'status_message' => $message,
            'ratehawk_status' => 'cancelled'
        ]);
    }

    public function markAsFailed(string $message = null): void
    {
        $this->update([
            'status' => 'failed',
            'status_message' => $message,
            'ratehawk_status' => 'failed'
        ]);
    }

    public function setExpiry(int $minutes = null): void
    {
        $expiryMinutes = $minutes ?? config('ratehawk.booking_expiry_minutes', 30);
        
        $this->update([
            'expires_at' => now()->addMinutes($expiryMinutes)
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER METHODS
    |--------------------------------------------------------------------------
    */

    public function getRemainingTime(): ?int
    {
        if (!$this->expires_at) {
            return null;
        }

        return max(0, now()->diffInSeconds($this->expires_at, false));
    }

    public function getGuestCount(): int
    {
        if (!$this->guest_info || !is_array($this->guest_info)) {
            return 0;
        }

        return count($this->guest_info);
    }

    public function getAdultsCount(): int
    {
        if (!$this->guest_info || !is_array($this->guest_info)) {
            return 0;
        }

        return collect($this->guest_info)->where('is_child', false)->count();
    }

    public function getChildrenCount(): int
    {
        if (!$this->guest_info || !is_array($this->guest_info)) {
            return 0;
        }

        return collect($this->guest_info)->where('is_child', true)->count();
    }

    public function getCheckinDate(): ?Carbon
    {
        return $this->booking_data['checkin'] ? Carbon::parse($this->booking_data['checkin']) : null;
    }

    public function getCheckoutDate(): ?Carbon
    {
        return $this->booking_data['checkout'] ? Carbon::parse($this->booking_data['checkout']) : null;
    }

    public function getNightsCount(): ?int
    {
        $checkin = $this->getCheckinDate();
        $checkout = $this->getCheckoutDate();

        if (!$checkin || !$checkout) {
            return null;
        }

        return $checkin->diffInDays($checkout);
    }

    /*
    |--------------------------------------------------------------------------
    | STATIC METHODS
    |--------------------------------------------------------------------------
    */

    public static function findByPartnerOrderId(string $partnerOrderId): ?self
    {
        return static::where('partner_order_id', $partnerOrderId)->first();
    }

    public static function findByRatehawkOrderId(string $ratehawkOrderId): ?self
    {
        return static::where('ratehawk_order_id', $ratehawkOrderId)->first();
    }

    public static function cleanupExpired(): int
    {
        return static::expired()
            ->whereIn('status', ['pending', 'processing'])
            ->update([
                'status' => 'expired',
                'status_message' => 'Order expired'
            ]);
    }
}
