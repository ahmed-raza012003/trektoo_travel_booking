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
            'original_amount' => 'required|numeric|min:0.01',
            'markup_percentage' => 'required|numeric|min:0',
            'passengers' => 'required|array',
            'passengers.*.type' => 'required|string|in:adult,child',
            'passengers.*.first_name' => 'required|string',
            'passengers.*.last_name' => 'required|string',
            'passengers.*.email' => 'required_if:passengers.*.type,adult|nullable|email',
            'passengers.*.phone' => 'required_if:passengers.*.type,adult|nullable|string',
            'passengers.*.country' => 'required|string',
            'passengers.*.passport_id' => 'required|string',
            'passengers.*.age' => 'required_if:passengers.*.type,child|nullable|integer|min:0|max:17',
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
            $passengers = $request->passengers;

            // Calculate markup amount
            $markupAmount = $request->original_amount * ($request->markup_percentage / 100);

            // Get lead passenger data (first adult passenger)
            $leadPassenger = collect($passengers)->firstWhere('type', 'adult') ?? collect($passengers)->first();
            
            Log::info('Lead Passenger Data for customer_info', [
                'lead_passenger' => $leadPassenger,
                'fallback_email' => $request->customer_email,
                'fallback_name' => $request->customer_name
            ]);

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
                'total_price' => $request->amount, // Final amount including markup
                'original_amount' => $request->original_amount,
                'markup_percentage' => $request->markup_percentage,
                'markup_amount' => $markupAmount,
                'currency' => $request->currency,
                'status' => 'pending',
                'external_booking_id' => $request->order_id,
                'agent_order_id' => $request->agent_order_id,
                'customer_info' => [
                    'email' => $leadPassenger['email'] ?? $request->customer_email,
                    'name' => $leadPassenger ? ($leadPassenger['first_name'] . ' ' . $leadPassenger['last_name']) : $request->customer_name,
                    'phone' => $leadPassenger['phone'] ?? $bookingData['customer_phone'] ?? null,
                    'country' => $leadPassenger['country'] ?? $bookingData['customer_country'] ?? null
                ],
                'booking_details' => $bookingData
            ]);

            // Create passenger records
            $this->createPassengers($booking, $passengers);

            Log::info('Klook Payment Intent - Booking created with external_booking_id', [
                'booking_id' => $booking->id,
                'external_booking_id' => $request->order_id,
                'agent_order_id' => $request->agent_order_id
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

            // $result = $this->stripeService->createCheckoutSession($payment, [
            //     'product_name' => $activityName,
            //     'description' => $description,
            //     'success_url' => config('app.frontend_url', 'http://localhost:3000') . '/thankyou?session_id={CHECKOUT_SESSION_ID}&payment_id=' . $payment->id . '&order_id=' . $request->order_id,
            //     'cancel_url' => config('app.frontend_url', 'http://localhost:3000') . '/payment/cancelled',
            // ]);

            $frontendUrl = config('app.frontend_url'); // Make sure APP_FRONTEND_URL is set in .env

            $result = $this->stripeService->createCheckoutSession($payment, [
                'product_name' => $activityName,
                'description' => $description,
                'success_url' => $frontendUrl
                    . '/thankyou?session_id={CHECKOUT_SESSION_ID}&payment_id=' . $payment->id
                    . '&order_id=' . $request->order_id,
                'cancel_url' => $frontendUrl . '/payment/cancelled',
            ]);


            if (!$result['success']) {
                DB::rollBack();
                return $this->errorResponse('Failed to create checkout session', 400, $result['error']);
            }

            // Automatically trigger balance payment after successful payment storage
            Log::info('Klook Payment Intent - Auto-triggering balance payment', [
                'order_id' => $request->order_id,
                'payment_id' => $payment->id,
                'booking_id' => $booking->id
            ]);

            // Call balance payment API immediately
            $balancePayment = $this->klookService->payWithBalance($request->order_id);

            if (isset($balancePayment['error'])) {
                Log::warning('Klook Payment Intent - Balance payment failed, but payment was stored', [
                    'order_id' => $request->order_id,
                    'error' => $balancePayment['error'],
                    'payment_id' => $payment->id
                ]);
                // Don't fail the entire process, just log the warning
            } else {
                Log::info('Klook Payment Intent - Balance payment successful', [
                    'order_id' => $request->order_id,
                    'balance_payment' => $balancePayment,
                    'payment_id' => $payment->id
                ]);

                // Update booking status to confirmed
                $booking->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now(),
                    'external_booking_data' => array_merge(
                        $booking->external_booking_data ?? [],
                        [
                            'balance_payment_result' => $balancePayment,
                            'auto_confirmed_at' => now()->toISOString()
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
                            'auto_completion' => true
                        ]
                    )
                ]);
            }

            DB::commit();

            return $this->successResponse([
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'checkout_url' => $result['checkout_url'],
                'session_id' => $result['session_id'],
                'order_id' => $request->order_id,
                'balance_payment' => $balancePayment,
                'booking_status' => $booking->fresh()->status
            ], 'Checkout session created and balance payment processed successfully');
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
            } else {
                Log::info('Klook balance payment successful', [
                    'order_id' => $request->order_id,
                    'payment_result' => $klookPayment
                ]);
            }

            // Update booking status
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'external_booking_data' => array_merge(
                    $booking->external_booking_data ?? [],
                    [
                        'balance_payment_result' => $klookPayment,
                        'confirmed_at' => now()->toISOString()
                    ]
                )
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
                'klook_order' => $updatedOrder['data'] ?? null,
                'balance_payment' => $klookPayment
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
            // First try to retrieve as payment intent ID, if that fails, try as session ID
            $stripePayment = $this->stripeService->retrievePaymentIntent($request->stripe_payment_intent_id);

            if (!$stripePayment['success']) {
                // If payment intent retrieval failed, try as session ID
                $stripePayment = $this->stripeService->retrievePaymentIntentFromSession($request->stripe_payment_intent_id);
            }

            if (!$stripePayment['success'] || $stripePayment['status'] !== 'succeeded') {
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
            } else {
                Log::info('Klook balance payment successful', [
                    'order_id' => $request->order_id,
                    'payment_result' => $balancePayment,
                    'payment_id' => $payment->id
                ]);
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
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => array_merge(
                    $payment->provider_response ?? [],
                    [
                        'klook_balance_payment' => $balancePayment,
                        'klook_order_details' => $orderDetails['data'] ?? null
                    ]
                )
            ]);

            // Step 4: Get updated order details after balance payment
            $updatedOrderDetails = $this->klookService->getOrderDetails($request->order_id);

            if (isset($updatedOrderDetails['error'])) {
                Log::warning('Failed to get updated order details', [
                    'order_id' => $request->order_id,
                    'error' => $updatedOrderDetails['error']
                ]);
            } else {
                // Update booking with latest order details
                $booking->update([
                    'external_booking_data' => array_merge(
                        $booking->external_booking_data ?? [],
                        [
                            'updated_order_details' => $updatedOrderDetails['data'] ?? null,
                            'updated_at' => now()->toISOString()
                        ]
                    )
                ]);
            }

            // Step 5: Resend voucher (only if order is confirmed)
            $voucherResult = null;
            if (
                isset($updatedOrderDetails['data']['confirm_status']) &&
                $updatedOrderDetails['data']['confirm_status'] === 'confirmed'
            ) {
                $voucherResult = $this->klookService->resendVoucher($request->order_id);

                if (isset($voucherResult['error'])) {
                    Log::warning('Voucher resend failed', [
                        'order_id' => $request->order_id,
                        'error' => $voucherResult['error']
                    ]);
                }
            } else {
                Log::info('Order not yet confirmed, skipping voucher resend', [
                    'order_id' => $request->order_id,
                    'status' => $updatedOrderDetails['data']['confirm_status'] ?? 'unknown'
                ]);
            }

            // Step 6: Generate PDF voucher (only if order details are available)
            $voucherPdfPath = null;
            $orderDataForVoucher = $updatedOrderDetails['data'] ?? $orderDetails['data'] ?? null;
            if (!empty($orderDataForVoucher)) {
                $voucherPdfPath = $this->generateVoucherPdf($booking, $orderDataForVoucher);
            }

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
            $logoPath = public_path('images/trektoo-logo.png');
            $voucherData = [
                'booking' => $booking,
                'order_details' => $orderDetails,
                'company_name' => 'TrekToo',
                'company_logo' => file_exists($logoPath) ? $logoPath : null,
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

    /**
     * Test endpoint to verify balance payment integration
     * This is for testing purposes only
     */
    public function testBalancePayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|exists:payments,id'
        ]);

        try {
            $user = Auth::user();
            $payment = Payment::findOrFail($request->payment_id);
            $booking = $payment->booking;

            // Verify the payment belongs to the user
            if ($booking->user_id !== $user->id) {
                return $this->errorResponse('Unauthorized access to payment', 403);
            }

            Log::info('Test Balance Payment - Starting test', [
                'order_id' => $request->order_id,
                'payment_id' => $payment->id,
                'booking_id' => $booking->id
            ]);

            // Call balance payment API
            $balancePayment = $this->klookService->payWithBalance($request->order_id);

            if (isset($balancePayment['error'])) {
                Log::error('Test Balance Payment - Balance payment failed', [
                    'order_id' => $request->order_id,
                    'error' => $balancePayment['error']
                ]);

                return $this->errorResponse('Balance payment failed', 400, $balancePayment['error']);
            }

            // Update booking status
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'external_booking_data' => array_merge(
                    $booking->external_booking_data ?? [],
                    [
                        'balance_payment_result' => $balancePayment,
                        'test_confirmed_at' => now()->toISOString()
                    ]
                )
            ]);

            Log::info('Test Balance Payment - Success', [
                'order_id' => $request->order_id,
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'balance_payment' => $balancePayment
            ]);

            return $this->successResponse([
                'booking' => $booking->fresh(),
                'payment' => $payment->fresh(),
                'balance_payment' => $balancePayment
            ], 'Balance payment test completed successfully');
        } catch (\Exception $e) {
            Log::error('Test Balance Payment - Exception', [
                'order_id' => $request->order_id,
                'payment_id' => $request->payment_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Balance payment test failed', 500, $e->getMessage());
        }
    }

    /**
     * Manual trigger to complete payment flow for existing orders
     * This simulates the webhook flow for orders that weren't automatically processed
     */
    public function manualCompletePayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string'
        ]);

        try {
            $user = Auth::user();

            // Find booking by external_booking_id
            $booking = Booking::where('external_booking_id', $request->order_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$booking) {
                return $this->errorResponse('Booking not found for this order', 404);
            }

            $payment = $booking->payment;
            if (!$payment) {
                return $this->errorResponse('Payment not found for this booking', 404);
            }

            Log::info('Manual Complete Payment - Starting', [
                'order_id' => $request->order_id,
                'booking_id' => $booking->id,
                'payment_id' => $payment->id
            ]);

            DB::beginTransaction();

            // Step 1: Pay with Klook balance
            $balancePayment = $this->klookService->payWithBalance($request->order_id);

            if (isset($balancePayment['error'])) {
                Log::error('Manual Complete Payment - Balance payment failed', [
                    'order_id' => $request->order_id,
                    'error' => $balancePayment['error']
                ]);

                DB::rollBack();
                return $this->errorResponse('Balance payment failed', 400, $balancePayment['error']);
            }

            Log::info('Manual Complete Payment - Balance payment successful', [
                'order_id' => $request->order_id,
                'balance_payment' => $balancePayment
            ]);

            // Step 2: Get updated order details
            $orderDetails = $this->klookService->getOrderDetail($request->order_id);

            if (isset($orderDetails['error'])) {
                Log::warning('Manual Complete Payment - Failed to get order details', [
                    'order_id' => $request->order_id,
                    'error' => $orderDetails['error']
                ]);
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
                        'manual_confirmed_at' => now()->toISOString()
                    ]
                )
            ]);

            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => array_merge(
                    $payment->provider_response ?? [],
                    [
                        'klook_balance_payment' => $balancePayment,
                        'klook_order_details' => $orderDetails['data'] ?? null,
                        'manual_completion' => true
                    ]
                )
            ]);

            DB::commit();

            Log::info('Manual Complete Payment - Success', [
                'order_id' => $request->order_id,
                'booking_id' => $booking->id,
                'payment_id' => $payment->id
            ]);

            return $this->successResponse([
                'booking' => $booking->fresh(),
                'payment' => $payment->fresh(),
                'balance_payment' => $balancePayment,
                'order_details' => $orderDetails['data'] ?? null
            ], 'Payment flow completed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Manual Complete Payment - Exception', [
                'order_id' => $request->order_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to complete payment flow', 500, $e->getMessage());
        }
    }

    /**
     * Create passenger records for a booking
     */
    private function createPassengers(Booking $booking, array $passengers): void
    {
        $passengerNumber = 1;
        $leadPassengerSet = false;

        foreach ($passengers as $passengerData) {
            // Determine if this is the lead passenger (first adult)
            $isLeadPassenger = false;
            if ($passengerData['type'] === 'adult' && !$leadPassengerSet) {
                $isLeadPassenger = true;
                $leadPassengerSet = true;
            }

            \App\Models\Passenger::create([
                'booking_id' => $booking->id,
                'type' => $passengerData['type'],
                'passenger_number' => $passengerNumber,
                'is_lead_passenger' => $isLeadPassenger,
                'first_name' => $passengerData['first_name'],
                'last_name' => $passengerData['last_name'],
                'email' => $passengerData['email'] ?? null,
                'phone' => $passengerData['phone'] ?? null,
                'country' => $passengerData['country'],
                'passport_id' => $passengerData['passport_id'],
                'age' => $passengerData['age'] ?? null,
            ]);

            $passengerNumber++;
        }

        Log::info('Passengers created for booking', [
            'booking_id' => $booking->id,
            'passenger_count' => count($passengers)
        ]);
    }
}
