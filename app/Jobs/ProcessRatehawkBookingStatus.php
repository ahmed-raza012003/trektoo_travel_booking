<?php

namespace App\Jobs;

use App\Models\RatehawkOrder;
use App\Services\RatehawkService;
use App\Services\Payment\StripeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Process Ratehawk Booking Status Job
 * 
 * Background job to check and update booking status with Ratehawk API
 */
class ProcessRatehawkBookingStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $partnerOrderId,
        public int $maxAttempts = 3
    ) {}

    /**
     * Execute the job.
     */
    public function handle(RatehawkService $ratehawkService, StripeService $stripeService): void
    {
        try {
            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($this->partnerOrderId);

            if (!$ratehawkOrder) {
                Log::warning('Ratehawk order not found for status check', [
                    'partner_order_id' => $this->partnerOrderId
                ]);
                return;
            }

            // Skip if already in final state
            if (in_array($ratehawkOrder->status, ['confirmed', 'cancelled', 'failed'])) {
                return;
            }

            // Check status with Ratehawk
            $statusResult = $ratehawkService->getBookingStatus($this->partnerOrderId);

            if (!$statusResult['success']) {
                Log::error('Failed to get booking status from Ratehawk', [
                    'partner_order_id' => $this->partnerOrderId,
                    'error' => $statusResult['error']
                ]);
                
                // Retry if we haven't exceeded max attempts
                if ($this->attempts() < $this->maxAttempts) {
                    $this->release(60); // Retry in 1 minute
                }
                return;
            }

            $ratehawkStatus = $statusResult['data']['status'] ?? null;
            $message = $statusResult['data']['message'] ?? null;

            // Update local status
            $ratehawkOrder->update([
                'ratehawk_status' => $ratehawkStatus,
                'status_message' => $message
            ]);

            // Handle different statuses
            switch ($ratehawkStatus) {
                case 'confirmed':
                    $this->handleConfirmedStatus($ratehawkOrder, $statusResult['data']);
                    break;

                case 'cancelled':
                    $this->handleCancelledStatus($ratehawkOrder, $statusResult['data'], $stripeService);
                    break;

                case 'failed':
                case 'no_availability':
                    $this->handleFailedStatus($ratehawkOrder, $statusResult['data'], $stripeService);
                    break;

                case 'processing':
                    $ratehawkOrder->markAsProcessing($message);
                    break;

                default:
                    Log::info('Unknown Ratehawk status received', [
                        'partner_order_id' => $this->partnerOrderId,
                        'status' => $ratehawkStatus
                    ]);
            }

        } catch (\Exception $e) {
            Log::error('Error processing Ratehawk booking status', [
                'partner_order_id' => $this->partnerOrderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Retry if we haven't exceeded max attempts
            if ($this->attempts() < $this->maxAttempts) {
                $this->release(120); // Retry in 2 minutes
            }
        }
    }

    /**
     * Handle confirmed booking status
     */
    private function handleConfirmedStatus(RatehawkOrder $ratehawkOrder, array $data): void
    {
        DB::transaction(function () use ($ratehawkOrder, $data) {
            $ratehawkOrder->markAsConfirmed(
                $data['order_id'] ?? null,
                'Booking confirmed by Ratehawk'
            );

            $ratehawkOrder->booking->update([
                'status' => 'confirmed',
                'external_booking_id' => $data['order_id'] ?? null,
                'confirmed_at' => now()
            ]);

            Log::info('Hotel booking confirmed', [
                'booking_id' => $ratehawkOrder->booking_id,
                'partner_order_id' => $ratehawkOrder->partner_order_id,
                'ratehawk_order_id' => $data['order_id'] ?? null
            ]);
        });
    }

    /**
     * Handle cancelled booking status
     */
    private function handleCancelledStatus(RatehawkOrder $ratehawkOrder, array $data, StripeService $stripeService): void
    {
        DB::transaction(function () use ($ratehawkOrder, $data, $stripeService) {
            $ratehawkOrder->markAsCancelled(
                $data['message'] ?? 'Booking cancelled by Ratehawk'
            );

            $ratehawkOrder->booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

            // Process refund if payment was made
            $payment = $ratehawkOrder->booking->payments()
                ->where('status', 'paid')
                ->first();

            if ($payment) {
                $refundResult = $stripeService->refundPayment(
                    $payment->charge_id,
                    $payment->amount
                );

                if ($refundResult['success']) {
                    $payment->markAsRefunded();
                    Log::info('Refund processed for cancelled booking', [
                        'booking_id' => $ratehawkOrder->booking_id,
                        'payment_id' => $payment->id,
                        'refund_amount' => $payment->amount
                    ]);
                }
            }

            Log::info('Hotel booking cancelled', [
                'booking_id' => $ratehawkOrder->booking_id,
                'partner_order_id' => $ratehawkOrder->partner_order_id,
                'reason' => $data['message'] ?? 'No reason provided'
            ]);
        });
    }

    /**
     * Handle failed booking status
     */
    private function handleFailedStatus(RatehawkOrder $ratehawkOrder, array $data, StripeService $stripeService): void
    {
        DB::transaction(function () use ($ratehawkOrder, $data, $stripeService) {
            $ratehawkOrder->markAsFailed(
                $data['message'] ?? 'Booking failed'
            );

            $ratehawkOrder->booking->update([
                'status' => 'failed'
            ]);

            // Process refund if payment was made
            $payment = $ratehawkOrder->booking->payments()
                ->where('status', 'paid')
                ->first();

            if ($payment) {
                $refundResult = $stripeService->refundPayment(
                    $payment->charge_id,
                    $payment->amount
                );

                if ($refundResult['success']) {
                    $payment->markAsRefunded();
                    Log::info('Refund processed for failed booking', [
                        'booking_id' => $ratehawkOrder->booking_id,
                        'payment_id' => $payment->id,
                        'refund_amount' => $payment->amount
                    ]);
                }
            }

            Log::error('Hotel booking failed', [
                'booking_id' => $ratehawkOrder->booking_id,
                'partner_order_id' => $ratehawkOrder->partner_order_id,
                'reason' => $data['message'] ?? 'No reason provided'
            ]);
        });
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessRatehawkBookingStatus job failed permanently', [
            'partner_order_id' => $this->partnerOrderId,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Mark order as failed if we can't determine status
        $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($this->partnerOrderId);
        if ($ratehawkOrder && $ratehawkOrder->status === 'processing') {
            $ratehawkOrder->markAsFailed('Unable to determine booking status after multiple attempts');
        }
    }
}
