<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'activity_external_id',
        'activity_name',
        'activity_date',
        'activity_package_id',
        'activity_schedule',
        'hotel_external_id',
        'hotel_name',
        'check_in_date',
        'check_out_date',
        'rooms',
        'flight_external_id',
        'flight_number',
        'departure_date',
        'return_date',
        'guests',
        'adults',
        'children',
        'total_price',
        'subtotal',
        'tax_amount',
        'service_fee',
        'currency',
        'status',
        'external_booking_id',
        'agent_order_id',
        'customer_info',
        'booking_details',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'activity_schedule' => 'array',
        'customer_info' => 'array',
        'booking_details' => 'array',
        'activity_date' => 'date',
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'departure_date' => 'date',
        'return_date' => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'service_fee' => 'decimal:2',
    ];

    /**
     * Get the user that owns the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payments for the booking.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the latest payment for the booking.
     */
    public function latestPayment(): HasMany
    {
        return $this->hasMany(Payment::class)->latest();
    }

    /**
     * Scope a query to only include bookings of a given type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include bookings with a given status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include confirmed bookings.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope a query to only include pending bookings.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if booking is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if booking is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if booking is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Confirm the booking.
     */
    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Cancel the booking.
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Get the activity name for display.
     */
    public function getActivityDisplayNameAttribute(): string
    {
        return $this->activity_name ?? 'Unknown Activity';
    }

    /**
     * Get the total guests count.
     */
    public function getTotalGuestsAttribute(): int
    {
        return $this->adults + $this->children;
    }
}