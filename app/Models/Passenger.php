<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'type',
        'passenger_number',
        'is_lead_passenger',
        'first_name',
        'last_name',
        'email',
        'phone',
        'country',
        'passport_id',
        'age',
    ];

    protected $casts = [
        'is_lead_passenger' => 'boolean',
        'age' => 'integer',
    ];

    /**
     * Get the booking that owns the passenger.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Check if this is an adult passenger.
     */
    public function isAdult(): bool
    {
        return $this->type === 'adult';
    }

    /**
     * Check if this is a child passenger.
     */
    public function isChild(): bool
    {
        return $this->type === 'child';
    }

    /**
     * Get the full name of the passenger.
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Scope for adult passengers.
     */
    public function scopeAdults($query)
    {
        return $query->where('type', 'adult');
    }

    /**
     * Scope for child passengers.
     */
    public function scopeChildren($query)
    {
        return $query->where('type', 'child');
    }

    /**
     * Scope for lead passenger.
     */
    public function scopeLeadPassenger($query)
    {
        return $query->where('is_lead_passenger', true);
    }
}
