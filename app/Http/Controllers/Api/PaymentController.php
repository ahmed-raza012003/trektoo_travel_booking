<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\Payment;
use App\Models\Booking;
use App\Services\Payment\PaymentManager;
use App\Services\Payment\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends BaseController
{
    protected $paymentManager;
    protected $stripeService;

    public function __construct(PaymentManager $paymentManager, StripeService $stripeService)
    {
        $this->paymentManager = $paymentManager;
        $this->stripeService = $stripeService;
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
}