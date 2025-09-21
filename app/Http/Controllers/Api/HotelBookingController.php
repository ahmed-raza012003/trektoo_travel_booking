<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RatehawkService;
use App\Services\Payment\StripeService;
use App\Models\Booking;
use App\Models\RatehawkOrder;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Hotel Booking Controller
 * 
 * Handles hotel booking process, payments, and order management
 * Based on Ratehawk API documentation: https://docs.emergingtravel.com/docs/overview/
 */
class HotelBookingController extends Controller
{
    public function __construct(
        private RatehawkService $ratehawkService,
        private StripeService $stripeService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | BOOKING CREATION
    |--------------------------------------------------------------------------
    */

    /**
     * Create booking form
     * POST /api/hotels/bookings/create-form
     */
    public function createBookingForm(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'book_hash' => 'required|string|min:10',
            'user_info' => 'required|array',
            'user_info.email' => 'required|email',
            'user_info.phone' => 'nullable|string',
            'user_info.first_name' => 'required|string|max:100',
            'user_info.last_name' => 'required|string|max:100',
            'payment_type' => 'required|array',
            'payment_type.type' => 'required|in:deposit,prepaid,pay_at_property',
            'payment_type.amount' => 'required|numeric|min:0',
            'payment_type.currency_code' => 'required|string|size:3',
            'language' => 'nullable|string|size:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate unique partner order ID
            $partnerOrderId = 'THB-' . strtoupper(Str::random(8)) . '-' . time();

            // Create booking form with Ratehawk
            $formData = [
                'partner_order_id' => $partnerOrderId,
                'book_hash' => $request->book_hash,
                'language' => $request->language ?? config('ratehawk.default_language'),
                'user_ip' => $request->ip()
            ];

            $result = $this->ratehawkService->createBookingForm($formData);

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create booking form',
                    'error' => $result['error']
                ], 400);
            }

            // Create booking record
            $booking = Booking::create([
                'user_id' => auth()->id(),
                'type' => 'hotel',
                'hotel_external_id' => $result['data']['hotel_id'] ?? null,
                'hotel_name' => $result['data']['hotel_name'] ?? null,
                'check_in_date' => $result['data']['checkin'] ?? null,
                'check_out_date' => $result['data']['checkout'] ?? null,
                'adults' => $result['data']['adults'] ?? 1,
                'children' => $result['data']['children'] ?? 0,
                'total_price' => $request->payment_type['amount'],
                'currency' => $request->payment_type['currency_code'],
                'status' => 'pending',
                'customer_info' => $request->user_info,
                'booking_details' => $result['data'],
                'ratehawk_booking_data' => $result['data']
            ]);

            // Create Ratehawk order
            $ratehawkOrder = RatehawkOrder::create([
                'booking_id' => $booking->id,
                'partner_order_id' => $partnerOrderId,
                'book_hash' => $request->book_hash,
                'payment_type' => $request->payment_type['type'],
                'booking_data' => $result['data'],
                'guest_info' => $request->user_info,
                'status' => 'pending'
            ]);

            // Set expiry time
            $ratehawkOrder->setExpiry();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'booking_id' => $booking->id,
                    'partner_order_id' => $partnerOrderId,
                    'expires_at' => $ratehawkOrder->expires_at->toISOString(),
                    'remaining_time' => $ratehawkOrder->getRemainingTime(),
                    'booking_form' => $result['data']
                ],
                'message' => 'Booking form created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Create booking form error', [
                'request' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while creating booking form'
            ], 500);
        }
    }

    /**
     * Finish booking with payment
     * POST /api/hotels/bookings/finish
     */
    public function finishBooking(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'partner_order_id' => 'required|string',
            'payment_method_id' => 'required|string',
            'rooms' => 'required|array|min:1',
            'rooms.*.guests' => 'required|array',
            'rooms.*.guests.*.first_name' => 'required|string|max:100',
            'rooms.*.guests.*.last_name' => 'required|string|max:100',
            'rooms.*.guests.*.is_child' => 'boolean',
            'rooms.*.guests.*.age' => 'nullable|integer|min:0|max:17',
            'upsell_data' => 'nullable|array',
            'user_comment' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Find the Ratehawk order
            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($request->partner_order_id);
            
            if (!$ratehawkOrder || $ratehawkOrder->is_expired) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Booking expired or not found',
                    'error' => 'The booking has expired or does not exist'
                ], 404);
            }

            if (!$ratehawkOrder->isPending()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already processed',
                    'error' => 'This booking has already been processed'
                ], 400);
            }

            // Mark as processing
            $ratehawkOrder->markAsProcessing('Processing payment and booking confirmation');

            // Create payment intent with Stripe
            $paymentIntent = $this->stripeService->createPaymentIntent([
                'amount' => $ratehawkOrder->total_amount * 100, // Convert to cents
                'currency' => $ratehawkOrder->currency,
                'payment_method' => $request->payment_method_id,
                'customer_email' => $ratehawkOrder->booking->customer_info['email'] ?? null,
                'metadata' => [
                    'booking_id' => $ratehawkOrder->booking_id,
                    'partner_order_id' => $request->partner_order_id,
                    'type' => 'hotel_booking'
                ]
            ]);

            if (!$paymentIntent['success']) {
                $ratehawkOrder->markAsFailed('Payment creation failed');
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed',
                    'error' => $paymentIntent['error']
                ], 400);
            }

            // Create payment record
            $payment = Payment::create([
                'booking_id' => $ratehawkOrder->booking_id,
                'user_id' => auth()->id(),
                'amount' => $ratehawkOrder->total_amount,
                'currency' => $ratehawkOrder->currency,
                'method' => 'stripe',
                'status' => 'pending',
                'payment_intent_id' => $paymentIntent['data']['id'],
                'provider' => 'stripe',
                'customer_email' => $ratehawkOrder->booking->customer_info['email'] ?? null,
                'customer_name' => $ratehawkOrder->booking->customer_info['first_name'] . ' ' . $ratehawkOrder->booking->customer_info['last_name'],
                'ratehawk_order_id' => $ratehawkOrder->id,
                'partner_order_id' => $request->partner_order_id,
                'hotel_payment_data' => [
                    'rooms' => $request->rooms,
                    'upsell_data' => $request->upsell_data,
                    'user_comment' => $request->user_comment
                ]
            ]);

            // Confirm payment
            $confirmResult = $this->stripeService->confirmPaymentIntent(
                $paymentIntent['data']['id']
            );

            if (!$confirmResult['success']) {
                $payment->markAsFailed($confirmResult['error']);
                $ratehawkOrder->markAsFailed('Payment confirmation failed');
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Payment confirmation failed',
                    'error' => $confirmResult['error']
                ], 400);
            }

            // Update payment status
            $payment->markAsPaid($confirmResult['data']['charge_id']);

            // Finish booking with Ratehawk
            $finishData = [
                'user' => [
                    'email' => $ratehawkOrder->booking->customer_info['email'],
                    'phone' => $ratehawkOrder->booking->customer_info['phone'] ?? null,
                    'comment' => $request->user_comment
                ],
                'partner' => [
                    'partner_order_id' => $request->partner_order_id
                ],
                'rooms' => $request->rooms,
                'payment_type' => [
                    'type' => $ratehawkOrder->payment_type,
                    'amount' => $ratehawkOrder->total_amount,
                    'currency_code' => $ratehawkOrder->currency
                ],
                'upsell_data' => $request->upsell_data ?? []
            ];

            $finishResult = $this->ratehawkService->finishBooking($finishData);

            if ($finishResult['success']) {
                // Mark booking as confirmed
                $ratehawkOrder->markAsConfirmed(
                    $finishResult['data']['order_id'] ?? null,
                    'Booking confirmed successfully'
                );

                $ratehawkOrder->booking->update([
                    'status' => 'confirmed',
                    'external_booking_id' => $finishResult['data']['order_id'] ?? null,
                    'confirmed_at' => now()
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'booking_id' => $ratehawkOrder->booking_id,
                        'ratehawk_order_id' => $finishResult['data']['order_id'] ?? null,
                        'status' => 'confirmed',
                        'payment_status' => 'paid'
                    ],
                    'message' => 'Booking completed successfully'
                ]);
            } else {
                // Payment succeeded but booking failed - initiate refund
                $this->stripeService->refundPayment($payment->charge_id, $payment->amount);
                $payment->markAsRefunded();
                
                $ratehawkOrder->markAsFailed('Booking confirmation failed');
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Booking confirmation failed',
                    'error' => $finishResult['error'],
                    'refund_initiated' => true
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Finish booking error', [
                'request' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while completing the booking'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | BOOKING STATUS & MANAGEMENT
    |--------------------------------------------------------------------------
    */

    /**
     * Get booking status
     * GET /api/hotels/bookings/{partnerOrderId}/status
     */
    public function getBookingStatus(Request $request, string $partnerOrderId): JsonResponse
    {
        try {
            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($partnerOrderId);

            if (!$ratehawkOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                    'error' => 'No booking found with the provided order ID'
                ], 404);
            }

            // Check with Ratehawk for latest status
            $statusResult = $this->ratehawkService->getBookingStatus($partnerOrderId);

            if ($statusResult['success']) {
                // Update local status if different
                $ratehawkStatus = $statusResult['data']['status'] ?? null;
                if ($ratehawkStatus && $ratehawkStatus !== $ratehawkOrder->ratehawk_status) {
                    $ratehawkOrder->update([
                        'ratehawk_status' => $ratehawkStatus,
                        'status_message' => $statusResult['data']['message'] ?? null
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'booking_id' => $ratehawkOrder->booking_id,
                    'partner_order_id' => $ratehawkOrder->partner_order_id,
                    'ratehawk_order_id' => $ratehawkOrder->ratehawk_order_id,
                    'status' => $ratehawkOrder->status,
                    'ratehawk_status' => $ratehawkOrder->ratehawk_status,
                    'status_message' => $ratehawkOrder->status_message,
                    'expires_at' => $ratehawkOrder->expires_at?->toISOString(),
                    'remaining_time' => $ratehawkOrder->getRemainingTime(),
                    'hotel_name' => $ratehawkOrder->hotel_name,
                    'total_amount' => $ratehawkOrder->total_amount,
                    'currency' => $ratehawkOrder->currency,
                    'created_at' => $ratehawkOrder->created_at->toISOString(),
                    'confirmed_at' => $ratehawkOrder->confirmed_at?->toISOString()
                ],
                'message' => 'Booking status retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Get booking status error', [
                'partner_order_id' => $partnerOrderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving booking status'
            ], 500);
        }
    }

    /**
     * Cancel booking
     * POST /api/hotels/bookings/{partnerOrderId}/cancel
     */
    public function cancelBooking(Request $request, string $partnerOrderId): JsonResponse
    {
        try {
            DB::beginTransaction();

            $ratehawkOrder = RatehawkOrder::findByPartnerOrderId($partnerOrderId);

            if (!$ratehawkOrder) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                    'error' => 'No booking found with the provided order ID'
                ], 404);
            }

            if ($ratehawkOrder->isCancelled()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already cancelled',
                    'error' => 'This booking has already been cancelled'
                ], 400);
            }

            // Cancel with Ratehawk
            $cancelResult = $this->ratehawkService->cancelOrder($partnerOrderId);

            if ($cancelResult['success']) {
                // Mark as cancelled locally
                $ratehawkOrder->markAsCancelled('Booking cancelled by user');
                $ratehawkOrder->booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now()
                ]);

                // Process refund if payment was made
                $payment = Payment::where('partner_order_id', $partnerOrderId)
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

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'booking_id' => $ratehawkOrder->booking_id,
                        'status' => 'cancelled',
                        'cancelled_at' => $ratehawkOrder->cancelled_at->toISOString(),
                        'refund_initiated' => $payment ? true : false
                    ],
                    'message' => 'Booking cancelled successfully'
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to cancel booking',
                    'error' => $cancelResult['error']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Cancel booking error', [
                'partner_order_id' => $partnerOrderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while cancelling the booking'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | USER BOOKINGS
    |--------------------------------------------------------------------------
    */

    /**
     * Get user's hotel bookings
     * GET /api/hotels/bookings
     */
    public function getUserBookings(Request $request): JsonResponse
    {
        try {
            $bookings = Booking::with(['ratehawkOrder', 'payments'])
                ->where('user_id', auth()->id())
                ->hotelBookings()
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $bookings->items(),
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total()
                ],
                'message' => 'Hotel bookings retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Get user bookings error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving bookings'
            ], 500);
        }
    }
}
