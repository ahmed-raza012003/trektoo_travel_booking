<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'amount',
        'currency',
        'method',
        'status',
        'transaction_id',
        'payment_intent_id',
        'charge_id',
        'refund_id',
        'provider',
        'provider_response',
        'payment_method_details',
        'customer_email',
        'customer_name',
        'billing_address',
        'processing_fee',
        'refund_amount',
        'failure_reason',
        'paid_at',
        'failed_at',
        'refunded_at',
    ];

    protected $casts = [
        'provider_response' => 'array',
        'payment_method_details' => 'array',
        'amount' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Get the booking that owns the payment.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user that owns the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include payments with a given status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include paid payments.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include failed payments.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include payments by provider.
     */
    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Check if payment is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if payment is refunded.
     */
    public function isRefunded(): bool
    {
        return in_array($this->status, ['refunded', 'partially_refunded']);
    }

    /**
     * Mark payment as paid.
     */
    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason,
        ]);
    }

    /**
     * Mark payment as refunded.
     */
    public function markAsRefunded(float $amount = null): void
    {
        $refundAmount = $amount ?? $this->amount;
        $status = $refundAmount < $this->amount ? 'partially_refunded' : 'refunded';
        
        $this->update([
            'status' => $status,
            'refund_amount' => $refundAmount,
            'refunded_at' => now(),
        ]);
    }

    /**
     * Get the net amount after fees.
     */
    public function getNetAmountAttribute(): float
    {
        return $this->amount - $this->processing_fee;
    }

    /**
     * Get the remaining refundable amount.
     */
    public function getRefundableAmountAttribute(): float
    {
        return $this->amount - $this->refund_amount;
    }
}