<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\Payment;
use App\Models\Booking;
use App\Services\Payment\PaymentManager;
use App\Services\Payment\StripeService;
use App\Services\Klook\KlookApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentController extends BaseController
{
    protected $paymentManager;
    protected $stripeService;
    protected $klookService;

    public function __construct(
        PaymentManager $paymentManager,
        StripeService $stripeService,
        KlookApiService $klookService
    ) {
        $this->paymentManager = $paymentManager;
        $this->stripeService = $stripeService;
        $this->klookService = $klookService;
    }

    /**
     * Get user's payments
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = $user->payments()->with(['booking']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by provider
        if ($request->has('provider')) {
            $query->where('provider', $request->provider);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        return $this->successResponse($payments);
    }

    /**
     * Get specific payment details
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        $payment = $user->payments()->with(['booking'])->findOrFail($id);

        return $this->successResponse($payment);
    }

    /**
     * Create payment intent for Stripe
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'customer_email' => 'required|email',
            'customer_name' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $booking = $user->bookings()->findOrFail($request->booking_id);

            // Create payment record
            $payment = $this->paymentManager->createPayment($booking, [
                'amount' => $request->amount,
                'currency' => strtoupper($request->currency),
                'method' => 'stripe',
                'provider' => 'stripe',
                'customer_email' => $request->customer_email,
                'customer_name' => $request->customer_name,
                'billing_address' => $request->billing_address ?? null,
            ]);

            // Create Stripe payment intent
            $result = $this->stripeService->createPaymentIntent($payment);

            if (!$result['success']) {
                return $this->errorResponse('Failed to create payment intent', 400, $result['error']);
            }

            return $this->successResponse([
                'payment' => $payment,
                'client_secret' => $result['client_secret'],
                'payment_intent_id' => $result['payment_intent_id'],
            ], 'Payment intent created successfully');
        } catch (\Exception $e) {
            Log::error('Payment Intent Creation Failed:', [
                'user_id' => Auth::id(),
                'booking_id' => $request->booking_id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to create payment intent', 500, $e->getMessage());
        }
    }

    /**
     * Confirm payment
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $payment = $user->payments()
                ->where('payment_intent_id', $request->payment_intent_id)
                ->firstOrFail();

            $result = $this->paymentManager->confirmPayment($payment, $request->payment_intent_id);

            if (!$result['success']) {
                return $this->errorResponse('Payment confirmation failed', 400, $result['error']);
            }

            return $this->successResponse([
                'payment' => $payment->fresh(),
                'booking' => $payment->booking->fresh(),
            ], 'Payment confirmed successfully');
        } catch (\Exception $e) {
            Log::error('Payment Confirmation Failed:', [
                'user_id' => Auth::id(),
                'payment_intent_id' => $request->payment_intent_id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to confirm payment', 500, $e->getMessage());
        }
    }

    /**
     * Create refund
     */
    public function createRefund(Request $request, $id): JsonResponse
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0.01',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $user = Auth::user();
            $payment = $user->payments()->findOrFail($id);

            if (!$payment->isPaid()) {
                return $this->errorResponse('Payment is not paid', 400);
            }

            if ($payment->isRefunded()) {
                return $this->errorResponse('Payment is already refunded', 400);
            }

            $refundAmount = $request->amount ?? $payment->refundable_amount;

            if ($refundAmount > $payment->refundable_amount) {
                return $this->errorResponse('Refund amount exceeds refundable amount', 400);
            }

            $result = $this->paymentManager->createRefund($payment, $refundAmount);

            if (!$result['success']) {
                return $this->errorResponse('Refund creation failed', 400, $result['error']);
            }

            return $this->successResponse([
                'payment' => $payment->fresh(),
                'refund' => $result,
            ], 'Refund created successfully');
        } catch (\Exception $e) {
            Log::error('Refund Creation Failed:', [
                'user_id' => Auth::id(),
                'payment_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to create refund', 500, $e->getMessage());
        }
    }

    /**
     * Get payment methods
     */
    public function getPaymentMethods(): JsonResponse
    {
        $methods = [
            [
                'id' => 'stripe',
                'name' => 'Credit/Debit Card',
                'provider' => 'stripe',
                'icon' => 'credit-card',
                'enabled' => true,
            ],
            [
                'id' => 'klook_balance',
                'name' => 'Klook Balance',
                'provider' => 'klook',
                'icon' => 'wallet',
                'enabled' => true,
            ],
        ];

        return $this->successResponse($methods);
    }

    /**
     * Get Stripe publishable key
     */
    public function getStripeKey(): JsonResponse
    {
        return $this->successResponse([
            'publishable_key' => $this->stripeService->getPublishableKey(),
        ]);
    }

    /**
     * Handle Stripe webhook
     */
    public function stripeWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Stripe-Signature');

            $result = $this->paymentManager->handleWebhook('stripe', $payload, $signature);

            if ($result['success']) {
                return response()->json(['status' => 'success'], 200);
            }

            return response()->json(['status' => 'error', 'message' => $result['error']], 400);
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Failed:', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get payment statistics
     */
    public function statistics(): JsonResponse
    {
        $user = Auth::user();

        $stats = [
            'total_payments' => $user->payments()->count(),
            'paid_payments' => $user->payments()->paid()->count(),
            'pending_payments' => $user->payments()->pending()->count(),
            'failed_payments' => $user->payments()->failed()->count(),
            'refunded_payments' => $user->payments()->whereIn('status', ['refunded', 'partially_refunded'])->count(),
            'total_amount_paid' => $user->payments()->paid()->sum('amount'),
            'total_amount_refunded' => $user->payments()->sum('refund_amount'),
            'recent_payments' => $user->payments()
                ->with(['booking'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return $this->successResponse($stats);
    }


    //Klook Balance Payment

    /**
     * Create payment intent for Klook booking
     */
    public function createKlookPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'agent_order_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'customer_email' => 'required|email',
            'customer_name' => 'required|string',
            'booking_data' => 'required|array',
            'booking_data.activity_id' => 'sometimes|nullable|string',
            'booking_data.activity_name' => 'sometimes|nullable|string',
            'booking_data.package_id' => 'required|string',
            'booking_data.start_time' => 'required|string',
            'booking_data.adult_quantity' => 'required|integer|min:1',
            'booking_data.child_quantity' => 'sometimes|integer|min:0',
            'booking_data.customer_phone' => 'sometimes|nullable|string',
            'booking_data.customer_country' => 'sometimes|nullable|string',
        ]);

        try {
            // Add debug logging
            Log::info('Klook Payment Intent Request:', [
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
                'booking_data' => $request->booking_data
            ]);

            DB::beginTransaction();

            $user = Auth::user();
            $bookingData = $request->booking_data;

            // Create booking record from Klook data
            $booking = Booking::create([
                'user_id' => $user->id,
                'type' => 'activity',
                'activity_external_id' => $bookingData['activity_id'] ?? null,
                'activity_name' => $bookingData['activity_name'] ?? 'Klook Activity',
                'activity_package_id' => $bookingData['package_id'] ?? null,
                'activity_date' => $bookingData['start_time'] ?? now(),
                'adults' => $bookingData['adult_quantity'] ?? 1,
                'children' => $bookingData['child_quantity'] ?? 0,
                'guests' => ($bookingData['adult_quantity'] ?? 1) + ($bookingData['child_quantity'] ?? 0),
                'total_price' => $request->amount,
                'currency' => $request->currency,
                'status' => 'pending',
                'external_booking_id' => $request->order_id,
                'agent_order_id' => $request->agent_order_id,
                'customer_info' => [
                    'email' => $request->customer_email,
                    'name' => $request->customer_name,
                    'phone' => $bookingData['customer_phone'] ?? null,
                    'country' => $bookingData['customer_country'] ?? null
                ],
                'booking_details' => $bookingData
            ]);

            // Create payment record
            $payment = $this->paymentManager->createPayment($booking, [
                'amount' => $request->amount,
                'currency' => strtoupper($request->currency),
                'method' => 'stripe',
                'provider' => 'stripe',
                'customer_email' => $request->customer_email,
                'customer_name' => $request->customer_name,
            ]);

            // Create Stripe payment intent
            $result = $this->stripeService->createPaymentIntent($payment);

            if (!$result['success']) {
                DB::rollBack();
                return $this->errorResponse('Failed to create payment intent', 400, $result['error']);
            }

            DB::commit();

            return $this->successResponse([
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'client_secret' => $result['client_secret'],
                'payment_intent_id' => $result['payment_intent_id'],
                'order_id' => $request->order_id
            ], 'Payment intent created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Klook Payment Intent Creation Failed:', [
                'user_id' => Auth::id(),
                'order_id' => $request->order_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to create payment intent', 500, $e->getMessage());
        }
    }

    /**
     * Confirm Klook payment and complete booking
     */
    public function confirmKlookPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'order_id' => 'required|string'
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Find payment and booking
            $payment = $user->payments()
                ->where('payment_intent_id', $request->payment_intent_id)
                ->firstOrFail();

            $booking = $payment->booking;

            // Confirm payment with Stripe
            $result = $this->paymentManager->confirmPayment($payment, $request->payment_intent_id);

            if (!$result['success']) {
                DB::rollBack();
                return $this->errorResponse('Payment confirmation failed', 400, $result['error']);
            }

            // Pay Klook order with balance (this completes the booking)
            $klookPayment = $this->klookService->payWithBalance($request->order_id);

            if (isset($klookPayment['error'])) {
                Log::warning('Klook balance payment failed, but Stripe payment succeeded', [
                    'order_id' => $request->order_id,
                    'error' => $klookPayment['error']
                ]);

                // We still mark as paid since customer payment succeeded
                // Klook might need manual intervention
            }

            // Update booking status
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now()
            ]);

            // Get updated order details from Klook
            $updatedOrder = $this->klookService->getOrderDetail($request->order_id);

            if (!isset($updatedOrder['error'])) {
                $booking->update([
                    'booking_details' => array_merge(
                        $booking->booking_details ?? [],
                        ['confirmed_details' => $updatedOrder['data']]
                    )
                ]);
            }

            DB::commit();

            return $this->successResponse([
                'payment' => $payment->fresh(),
                'booking' => $booking->fresh(),
                'klook_order' => $updatedOrder['data'] ?? null
            ], 'Payment and booking confirmed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Klook Payment Confirmation Failed:', [
                'user_id' => Auth::id(),
                'payment_intent_id' => $request->payment_intent_id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to confirm payment', 500, $e->getMessage());
        }
    }

    /**
     * Get Klook order status
     */
    public function getKlookOrderStatus($orderId): JsonResponse
    {
        try {
            $result = $this->klookService->getOrderDetail($orderId);

            if (isset($result['error'])) {
                return $this->errorResponse('Failed to fetch order status', 400, $result['error']);
            }

            return $this->successResponse($result['data'], 'Order status retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Klook Order Status Check Failed:', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to fetch order status', 500, $e->getMessage());
        }
    }
}
