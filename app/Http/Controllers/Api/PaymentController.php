<?php


namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use App\Services\Payment\StripeService;
use App\Services\Klook\KlookApiService;
use Barryvdh\DomPDF\Facade\Pdf;


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

            // Create Stripe checkout session
            $activityName = $bookingData['activity_name'] ?? 'Klook Activity';
            $adultQuantity = $bookingData['adult_quantity'] ?? 1;
            $childQuantity = $bookingData['child_quantity'] ?? 0;
            $description = "Payment for {$activityName} - {$adultQuantity} Adults";
            if ($childQuantity > 0) {
                $description .= ", {$childQuantity} Children";
            }
            
            $result = $this->stripeService->createCheckoutSession($payment, [
                'product_name' => $activityName,
                'description' => $description,
                'success_url' => config('app.frontend_url', 'http://localhost:3000') . '/thankyou?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url', 'http://localhost:3000') . '/payment/cancelled',
            ]);

            if (!$result['success']) {
                DB::rollBack();
                return $this->errorResponse('Failed to create checkout session', 400, $result['error']);
            }

            DB::commit();

            return $this->successResponse([
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'checkout_url' => $result['checkout_url'],
                'session_id' => $result['session_id'],
                'order_id' => $request->order_id
            ], 'Checkout session created successfully');
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


    
    /**
     * Complete Klook payment flow after successful Stripe payment
     */
    public function completeKlookPaymentFlow(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|exists:payments,id',
            'stripe_payment_intent_id' => 'required|string'
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $payment = Payment::findOrFail($request->payment_id);
            $booking = $payment->booking;

            // Verify the payment belongs to the user
            if ($booking->user_id !== $user->id) {
                return $this->errorResponse('Unauthorized access to payment', 403);
            }

            // Verify Stripe payment is successful
            $stripePayment = $this->stripeService->retrievePaymentIntent($request->stripe_payment_intent_id);
            
            if ($stripePayment['status'] !== 'succeeded') {
                return $this->errorResponse('Stripe payment not completed', 400);
            }

            // Step 1: Pay Klook order with balance
            $balancePayment = $this->klookService->payWithBalance($request->order_id);

            if (isset($balancePayment['error'])) {
                Log::error('Klook balance payment failed', [
                    'order_id' => $request->order_id,
                    'error' => $balancePayment['error'],
                    'payment_id' => $payment->id
                ]);

                // Update payment status to reflect the issue
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => 'Klook balance payment failed: ' . $balancePayment['error']
                ]);

                DB::rollBack();
                return $this->errorResponse('Klook balance payment failed', 400, $balancePayment['error']);
            }

            // Step 2: Get updated order details
            $orderDetails = $this->klookService->getOrderDetail($request->order_id);

            if (isset($orderDetails['error'])) {
                Log::warning('Failed to fetch order details after balance payment', [
                    'order_id' => $request->order_id,
                    'error' => $orderDetails['error']
                ]);
                // Continue anyway since balance payment succeeded
            }

            // Step 3: Update booking and payment status
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'external_booking_data' => array_merge(
                    $booking->external_booking_data ?? [],
                    [
                        'balance_payment_result' => $balancePayment,
                        'order_details' => $orderDetails['data'] ?? null,
                        'confirmed_at' => now()->toISOString()
                    ]
                )
            ]);

            $payment->update([
                'status' => 'completed',
                'completed_at' => now(),
                'metadata' => array_merge(
                    $payment->metadata ?? [],
                    [
                        'klook_balance_payment' => $balancePayment,
                        'klook_order_details' => $orderDetails['data'] ?? null
                    ]
                )
            ]);

            // Step 4: Resend voucher
            $voucherResult = $this->klookService->resendVoucher($request->order_id);
            
            if (isset($voucherResult['error'])) {
                Log::warning('Voucher resend failed', [
                    'order_id' => $request->order_id,
                    'error' => $voucherResult['error']
                ]);
            }

            // Step 5: Generate PDF voucher
            $voucherPdfPath = $this->generateVoucherPdf($booking, $orderDetails['data'] ?? []);

            DB::commit();

            return $this->successResponse([
                'booking' => $booking->fresh(),
                'payment' => $payment->fresh(),
                'balance_payment' => $balancePayment,
                'order_details' => $orderDetails['data'] ?? null,
                'voucher_resend' => $voucherResult['success'] ?? false,
                'voucher_pdf_url' => $voucherPdfPath ? Storage::url($voucherPdfPath) : null
            ], 'Klook payment flow completed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Klook payment flow failed', [
                'order_id' => $request->order_id,
                'payment_id' => $request->payment_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to complete Klook payment flow', 500, $e->getMessage());
        }
    }

    /**
     * Generate PDF voucher for the booking
     */
    private function generateVoucherPdf(Booking $booking, array $orderDetails): ?string
    {
        try {
            $voucherData = [
                'booking' => $booking,
                'order_details' => $orderDetails,
                'company_name' => 'TrekToo',
                'company_logo' => public_path('images/trektoo-logo.png'), // Ensure you have this logo
                'issue_date' => now()->format('F j, Y'),
                'voucher_number' => 'TT-' . $booking->id . '-' . time()
            ];

            $pdf = Pdf::loadView('vouchers.klook', $voucherData);
            
            $filename = 'vouchers/klook-voucher-' . $booking->id . '.pdf';
            Storage::put($filename, $pdf->output());
            
            // Update booking with voucher path
            $booking->update([
                'voucher_path' => $filename
            ]);

            return $filename;
        } catch (\Exception $e) {
            Log::error('Voucher PDF generation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Download voucher PDF
     */
    /**
 * Download voucher PDF
 */
public function downloadVoucher($bookingId): \Symfony\Component\HttpFoundation\BinaryFileResponse
{
    $booking = Booking::where('id', $bookingId)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    if (!$booking->voucher_path || !Storage::exists($booking->voucher_path)) {
        abort(404, 'Voucher not found');
    }

    return response()->download(
        Storage::path($booking->voucher_path),
        'trektoo-voucher-' . $booking->id . '.pdf',
        ['Content-Type' => 'application/pdf']
    );
}

    /**
     * Get Klook order cancellation status
     */
    public function getCancellationStatus($orderId): JsonResponse
    {
        try {
            $result = $this->klookService->getOrderCancellationStatus($orderId);

            if (isset($result['error'])) {
                return $this->errorResponse('Failed to fetch cancellation status', 400, $result['error']);
            }

            return $this->successResponse($result['data'], 'Cancellation status retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Klook cancellation status check failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to fetch cancellation status', 500, $e->getMessage());
        }
    }

    /**
     * Apply for order cancellation
     */
    public function applyCancellation(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'reason' => 'required|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            
            // Find the booking
            $booking = Booking::where('external_booking_id', $request->order_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Apply cancellation with Klook
            $cancellationResult = $this->klookService->applyOrderCancellation($request->order_id, $this->getRefundReasonId($request->reason));

            if (isset($cancellationResult['error'])) {
                DB::rollBack();
                return $this->errorResponse('Cancellation application failed', 400, $cancellationResult['error']);
            }

            // Update booking status
            $booking->update([
                'status' => 'cancellation_requested',
                'cancellation_reason' => $request->reason,
                'cancellation_requested_at' => now(),
                'external_booking_data' => array_merge(
                    $booking->external_booking_data ?? [],
                    [
                        'cancellation_application' => $cancellationResult,
                        'cancellation_requested_at' => now()->toISOString()
                    ]
                )
            ]);

            DB::commit();

            return $this->successResponse([
                'booking' => $booking->fresh(),
                'cancellation_result' => $cancellationResult
            ], 'Cancellation applied successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cancellation application failed', [
                'order_id' => $request->order_id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to apply for cancellation', 500, $e->getMessage());
        }
    }

    /**
     * Map cancellation reason to Klook's refund reason IDs
     */
    private function getRefundReasonId(string $reason): int
    {
        $reasonMap = [
            'change of plans' => 1,
            'schedule conflict' => 2,
            'found better option' => 3,
            'personal emergency' => 4,
            'weather conditions' => 5,
            'travel restrictions' => 6,
            'health issues' => 7,
            'financial reasons' => 8,
            'dissatisfied with service' => 9,
            'other' => 99
        ];

        $lowerReason = strtolower($reason);
        
        foreach ($reasonMap as $key => $id) {
            if (str_contains($lowerReason, $key)) {
                return $id;
            }
        }

        return 99; // Default to "other"
    }
}
