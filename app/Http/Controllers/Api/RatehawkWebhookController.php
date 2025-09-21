<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RatehawkOrder;
use App\Models\Payment;
use App\Services\Payment\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Ratehawk Webhook Controller
 * 
 * Handles webhook notifications from Ratehawk for booking status updates
 * Based on Ratehawk API documentation: https://docs.emergingtravel.com/docs/overview/
 */
class RatehawkWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * Handle Ratehawk booking status webhook
     * POST /api/webhooks/ratehawk/booking-status
     */
    public function handleBookingStatus(Request $request): JsonResponse
    {
        try {
            // Verify webhook signature if configured
            if (config('ratehawk.webhook_secret')) {
                if (!$this->verifyWebhookSignature($request)) {
                    Log::warning('Invalid Ratehawk webhook signature', [
                        'headers' => $request->headers->all(),
                        'body' => $request->all()
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid signature'
                    ], 401);
                }
            }

            $data = $request->all();
            
            Log::info('Ratehawk webhook received', [
                'event_type' => 'booking_status',
                'data' => $data
            ]);

            // Validate required fields
            if (!isset($data['partner_order_id']) || !isset($data['status'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing required fields: partner_order_id or status'
                ], 400);
            }

            DB::beginTransaction();

            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($data['partner_order_id']);

            if (!$ratehawkOrder) {
                Log::warning('Ratehawk order not found for webhook', [
                    'partner_order_id' => $data['partner_order_id']
                ]);
                
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $status = $data['status'];
            $message = $data['message'] ?? null;

            // Handle different status updates
            switch ($status) {
                case 'confirmed':
                    $this->handleConfirmedStatus($ratehawkOrder, $data);
                    break;

                case 'cancelled':
                    $this->handleCancelledStatus($ratehawkOrder, $data);
                    break;

                case 'failed':
                    $this->handleFailedStatus($ratehawkOrder, $data);
                    break;

                case 'no_availability':
                    $this->handleNoAvailabilityStatus($ratehawkOrder, $data);
                    break;

                default:
                    // Update status but don't change booking status
                    $ratehawkOrder->update([
                        'ratehawk_status' => $status,
                        'status_message' => $message
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Ratehawk webhook processing error', [
                'request' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Handle booking changes webhook
     * POST /api/webhooks/ratehawk/booking-changes
     */
    public function handleBookingChanges(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            Log::info('Ratehawk booking changes webhook received', [
                'data' => $data
            ]);

            if (!isset($data['partner_order_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing required field: partner_order_id'
                ], 400);
            }

            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($data['partner_order_id']);

            if (!$ratehawkOrder) {
                Log::warning('Ratehawk order not found for booking changes webhook', [
                    'partner_order_id' => $data['partner_order_id']
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Update booking data if provided
            if (isset($data['booking_data'])) {
                $ratehawkOrder->update([
                    'booking_data' => array_merge($ratehawkOrder->booking_data ?? [], $data['booking_data'])
                ]);
            }

            // Update rate info if provided
            if (isset($data['rate_info'])) {
                $ratehawkOrder->update([
                    'rate_info' => array_merge($ratehawkOrder->rate_info ?? [], $data['rate_info'])
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking changes processed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Ratehawk booking changes webhook error', [
                'request' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PRIVATE METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Handle confirmed booking status
     */
    private function handleConfirmedStatus(RatehawkOrder $ratehawkOrder, array $data): void
    {
        $ratehawkOrder->markAsConfirmed(
            $data['ratehawk_order_id'] ?? null,
            $data['message'] ?? 'Booking confirmed by Ratehawk'
        );

        $ratehawkOrder->booking->update([
            'status' => 'confirmed',
            'external_booking_id' => $data['ratehawk_order_id'] ?? null,
            'confirmed_at' => now()
        ]);

        // Send confirmation notification to user
        // TODO: Implement notification system
        Log::info('Hotel booking confirmed', [
            'booking_id' => $ratehawkOrder->booking_id,
            'partner_order_id' => $ratehawkOrder->partner_order_id,
            'ratehawk_order_id' => $data['ratehawk_order_id'] ?? null
        ]);
    }

    /**
     * Handle cancelled booking status
     */
    private function handleCancelledStatus(RatehawkOrder $ratehawkOrder, array $data): void
    {
        $ratehawkOrder->markAsCancelled(
            $data['message'] ?? 'Booking cancelled by Ratehawk'
        );

        $ratehawkOrder->booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now()
        ]);

        // Process refund if payment was made
        $payment = Payment::where('partner_order_id', $ratehawkOrder->partner_order_id)
            ->where('status', 'paid')
            ->first();

        if ($payment) {
            $refundResult = $this->stripeService->refundPayment(
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
            } else {
                Log::error('Failed to process refund for cancelled booking', [
                    'booking_id' => $ratehawkOrder->booking_id,
                    'payment_id' => $payment->id,
                    'error' => $refundResult['error']
                ]);
            }
        }

        // Send cancellation notification to user
        Log::info('Hotel booking cancelled', [
            'booking_id' => $ratehawkOrder->booking_id,
            'partner_order_id' => $ratehawkOrder->partner_order_id,
            'reason' => $data['message'] ?? 'No reason provided'
        ]);
    }

    /**
     * Handle failed booking status
     */
    private function handleFailedStatus(RatehawkOrder $ratehawkOrder, array $data): void
    {
        $ratehawkOrder->markAsFailed(
            $data['message'] ?? 'Booking failed'
        );

        $ratehawkOrder->booking->update([
            'status' => 'failed'
        ]);

        // Process refund if payment was made
        $payment = Payment::where('partner_order_id', $ratehawkOrder->partner_order_id)
            ->where('status', 'paid')
            ->first();

        if ($payment) {
            $refundResult = $this->stripeService->refundPayment(
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

        // Send failure notification to user
        Log::error('Hotel booking failed', [
            'booking_id' => $ratehawkOrder->booking_id,
            'partner_order_id' => $ratehawkOrder->partner_order_id,
            'reason' => $data['message'] ?? 'No reason provided'
        ]);
    }

    /**
     * Handle no availability status
     */
    private function handleNoAvailabilityStatus(RatehawkOrder $ratehawkOrder, array $data): void
    {
        $ratehawkOrder->markAsFailed(
            $data['message'] ?? 'No availability for selected dates'
        );

        $ratehawkOrder->booking->update([
            'status' => 'failed'
        ]);

        // Process refund if payment was made
        $payment = Payment::where('partner_order_id', $ratehawkOrder->partner_order_id)
            ->where('status', 'paid')
            ->first();

        if ($payment) {
            $refundResult = $this->stripeService->refundPayment(
                $payment->charge_id,
                $payment->amount
            );

            if ($refundResult['success']) {
                $payment->markAsRefunded();
            }
        }

        Log::info('Hotel booking failed - no availability', [
            'booking_id' => $ratehawkOrder->booking_id,
            'partner_order_id' => $ratehawkOrder->partner_order_id,
            'reason' => $data['message'] ?? 'No availability'
        ]);
    }

    /**
     * Verify webhook signature
     */
    private function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Ratehawk-Signature');
        $webhookSecret = config('ratehawk.webhook_secret');

        if (!$signature || !$webhookSecret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $request->getContent(), $webhookSecret);
        
        return hash_equals($expectedSignature, $signature);
    }
}
