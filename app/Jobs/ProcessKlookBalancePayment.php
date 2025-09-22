<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Klook\KlookApiService;

class ProcessKlookBalancePayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;
    protected $paymentId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $orderId, int $paymentId)
    {
        $this->orderId = $orderId;
        $this->paymentId = $paymentId;
    }

    /**
     * Execute the job.
     */
    public function handle(KlookApiService $klookService): void
    {
        try {
            Log::info('ProcessKlookBalancePayment - Starting job', [
                'order_id' => $this->orderId,
                'payment_id' => $this->paymentId
            ]);

            // Find the payment and booking
            $payment = Payment::find($this->paymentId);
            if (!$payment) {
                Log::error('ProcessKlookBalancePayment - Payment not found', [
                    'payment_id' => $this->paymentId
                ]);
                return;
            }

            $booking = $payment->booking;
            if (!$booking) {
                Log::error('ProcessKlookBalancePayment - Booking not found', [
                    'payment_id' => $this->paymentId,
                    'booking_id' => $payment->booking_id
                ]);
                return;
            }

            // Check if already processed
            if ($booking->status === 'confirmed') {
                Log::info('ProcessKlookBalancePayment - Booking already confirmed', [
                    'booking_id' => $booking->id,
                    'status' => $booking->status
                ]);
                return;
            }

            DB::beginTransaction();

            // Call balance payment API
            $balancePayment = $klookService->payWithBalance($this->orderId);

            if (isset($balancePayment['error'])) {
                Log::error('ProcessKlookBalancePayment - Balance payment failed', [
                    'order_id' => $this->orderId,
                    'error' => $balancePayment['error'],
                    'payment_id' => $this->paymentId
                ]);

                // Mark payment as failed due to balance payment error
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => 'Klook balance payment failed: ' . $balancePayment['error']
                ]);

                DB::rollBack();
                return;
            }

            Log::info('ProcessKlookBalancePayment - Balance payment successful', [
                'order_id' => $this->orderId,
                'balance_payment' => $balancePayment,
                'payment_id' => $this->paymentId
            ]);

            // Get updated order details
            $orderDetails = $klookService->getOrderDetail($this->orderId);

            // Update booking status
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'external_booking_data' => array_merge(
                    $booking->external_booking_data ?? [],
                    [
                        'balance_payment_result' => $balancePayment,
                        'order_details' => $orderDetails['data'] ?? null,
                        'job_confirmed_at' => now()->toISOString()
                    ]
                )
            ]);

            // Update payment status
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => array_merge(
                    $payment->provider_response ?? [],
                    [
                        'klook_balance_payment' => $balancePayment,
                        'klook_order_details' => $orderDetails['data'] ?? null,
                        'job_completion' => true
                    ]
                )
            ]);

            DB::commit();

            Log::info('ProcessKlookBalancePayment - Job completed successfully', [
                'order_id' => $this->orderId,
                'payment_id' => $this->paymentId,
                'booking_id' => $booking->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ProcessKlookBalancePayment - Job failed', [
                'order_id' => $this->orderId,
                'payment_id' => $this->paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Mark payment as failed
            if (isset($payment)) {
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => 'Job processing failed: ' . $e->getMessage()
                ]);
            }
        }
    }
}
