<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use App\Services\Klook\KlookApiService;
use App\Services\Payment\StripeService;
use App\Jobs\ProcessKlookBalancePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected $klookService;
    protected $stripeService;

    public function __construct(KlookApiService $klookService, StripeService $stripeService)
    {
        $this->klookService = $klookService;
        $this->stripeService = $stripeService;
        
        // Set Stripe API key
        Stripe::setApiKey(config('stripe.secret'));
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe Webhook - Invalid payload: ' . $e->getMessage());
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe Webhook - Invalid signature: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        Log::info('Stripe Webhook - Received event: ' . $event->type);

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            default:
                Log::info('Stripe Webhook - Unhandled event type: ' . $event->type);
        }

        return response('OK', 200);
    }

    /**
     * Handle successful checkout session completion
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        Log::info('Stripe Webhook - Checkout session completed:', [
            'session_id' => $session->id,
            'payment_intent_id' => $session->payment_intent,
            'metadata' => $session->metadata
        ]);

        try {
            DB::beginTransaction();

            // Find the payment record
            $payment = Payment::where('checkout_session_id', $session->id)->first();
            
            if (!$payment) {
                Log::error('Stripe Webhook - Payment not found for session: ' . $session->id);
                DB::rollBack();
                return;
            }

            // Find the associated booking
            $booking = Booking::find($payment->booking_id);
            
            if (!$booking) {
                Log::error('Stripe Webhook - Booking not found for payment: ' . $payment->id);
                DB::rollBack();
                return;
            }

            // Update payment status first
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => array_merge(
                    $payment->provider_response ?? [],
                    ['stripe_session' => $session->toArray()]
                ),
            ]);

            // Dispatch job to process Klook balance payment
            if ($booking->external_booking_id) {
                Log::info('Stripe Webhook - Dispatching balance payment job', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'external_booking_id' => $booking->external_booking_id
                ]);

                ProcessKlookBalancePayment::dispatch($booking->external_booking_id, $payment->id);
            } else {
                Log::warning('Stripe Webhook - No external booking ID found, cannot process balance payment', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stripe Webhook - Exception in checkout session completed: ' . $e->getMessage());
        }
    }

    /**
     * Handle successful payment intent
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Stripe Webhook - Payment intent succeeded:', [
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $paymentIntent->amount,
            'currency' => $paymentIntent->currency
        ]);

        // Find the payment record
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => $paymentIntent->toArray(),
            ]);

            Log::info('Stripe Webhook - Updated payment status to paid', [
                'payment_id' => $payment->id
            ]);

            // Dispatch job to process Klook balance payment
            $booking = $payment->booking;
            if ($booking && $booking->external_booking_id) {
                Log::info('Stripe Webhook - Dispatching balance payment job', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'external_booking_id' => $booking->external_booking_id
                ]);

                ProcessKlookBalancePayment::dispatch($booking->external_booking_id, $payment->id);
            }
        }
    }

    /**
     * Process the complete Klook order flow
     */
    protected function processKlookOrderFlow(Booking $booking, Payment $payment)
    {
        try {
            Log::info('Stripe Webhook - Starting Klook order flow', [
                'booking_id' => $booking->id,
                'payment_id' => $payment->id
            ]);

            // Check if we already have an external booking ID (order was created in frontend)
            $orderNo = $booking->external_booking_id;
            
            if (!$orderNo) {
                Log::error('Stripe Webhook - No external booking ID found, cannot proceed with balance payment', [
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id
                ]);
                return [
                    'success' => false,
                    'error' => 'No external booking ID found. Order must be created first.',
                ];
            }

            Log::info('Stripe Webhook - Using existing order for balance payment', [
                'order_no' => $orderNo
            ]);

            // Step 1: Pay with Klook balance using existing order
            Log::info('Stripe Webhook - Paying with Klook balance', [
                'order_no' => $orderNo
            ]);

            $payResult = $this->klookService->payWithBalance($orderNo);

            if (isset($payResult['error'])) {
                Log::error('Stripe Webhook - Klook balance payment failed', [
                    'error' => $payResult['error'],
                    'order_no' => $orderNo
                ]);
                return [
                    'success' => false,
                    'error' => 'Klook balance payment failed: ' . $payResult['error'],
                ];
            }

            Log::info('Stripe Webhook - Klook balance payment successful', [
                'order_no' => $orderNo,
                'pay_result' => $payResult
            ]);

            // Step 2: Get updated order info
            Log::info('Stripe Webhook - Getting updated order info', [
                'order_no' => $orderNo
            ]);

            $orderInfo = $this->klookService->getOrderDetail($orderNo);

            if (isset($orderInfo['error'])) {
                Log::warning('Stripe Webhook - Failed to get order info, but payment was successful', [
                    'error' => $orderInfo['error'],
                    'order_no' => $orderNo
                ]);
                // Don't fail the entire process if we can't get order info
            } else {
                Log::info('Stripe Webhook - Retrieved order info successfully', [
                    'order_no' => $orderNo,
                    'order_info' => $orderInfo
                ]);
            }

            // Step 3: Update booking and payment in database
            $booking->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'external_booking_data' => array_merge($booking->external_booking_data ?? [], [
                    'balance_payment_result' => $payResult,
                    'confirmed_at' => now()->toISOString(),
                    'order_info' => $orderInfo
                ]),
            ]);

            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => array_merge($payment->provider_response ?? [], [
                    'stripe_session' => $payment->provider_response ?? [],
                    'klook_payment_result' => $payResult,
                    'klook_order_info' => $orderInfo,
                ]),
            ]);

            Log::info('Stripe Webhook - Updated booking and payment in database', [
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'order_no' => $orderNo
            ]);

            return [
                'success' => true,
                'order_no' => $orderNo,
                'booking_status' => 'confirmed',
                'payment_status' => 'paid',
            ];

        } catch (\Exception $e) {
            Log::error('Stripe Webhook - Exception in Klook order flow: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test endpoint to simulate the complete flow
     * This is for testing purposes only
     */
    public function testCompleteFlow(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
        ]);

        try {
            DB::beginTransaction();

            $payment = Payment::find($request->payment_id);
            $booking = Booking::find($payment->booking_id);

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found for payment'
                ], 404);
            }

            Log::info('Test Complete Flow - Starting', [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id
            ]);

            // Process the complete Klook order flow
            $result = $this->processKlookOrderFlow($booking, $payment);

            if ($result['success']) {
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Complete flow processed successfully',
                    'data' => [
                        'payment_id' => $payment->id,
                        'booking_id' => $booking->id,
                        'order_no' => $result['order_no'],
                        'booking_status' => $result['booking_status'],
                        'payment_status' => $result['payment_status'],
                    ]
                ]);
            } else {
                DB::rollBack();
                
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Test Complete Flow - Exception: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SKU ID for a package ID
     */
    protected function getSkuIdForPackage($packageId)
    {
        // Map package IDs to their corresponding SKU IDs
        $packageToSkuMap = [
            '102044' => 822428089872, // Asahiyama Zoo
            '102191' => 822428094543, // Another package
            '102032' => 822428089873, // Another package
            '102034' => 822428089874, // Another package
            '102043' => 822428089875, // Another package
        ];

        return $packageToSkuMap[$packageId] ?? 822428089872; // Default SKU ID
    }

    /**
     * Get booking extra info for Klook API
     */
    protected function getBookingExtraInfo($bookingDetails)
    {
        $extraInfo = [];

        // Add required otherinfo field for package 102044
        if (($bookingDetails['package_id'] ?? '') === '102044') {
            $extraInfo[] = [
                'key' => '996849',
                'content' => 'Default Location', // Default value for required field
                'selected' => null,
                'input_type' => 'text'
            ];
        }

        // Add default pickup location for specific packages
        if (in_array($bookingDetails['package_id'] ?? '', ['102191', '102044'])) {
            $extraInfo[] = [
                'key' => 'pick_up_location_scope',
                'content' => '1000536614', // Default pickup location
                'selected' => [['key' => '1000536614']],
                'input_type' => 'single_select'
            ];
        }

        // Add any other extra info from booking details
        if (isset($bookingDetails['extra_info']) && is_array($bookingDetails['extra_info'])) {
            foreach ($bookingDetails['extra_info'] as $key => $value) {
                if ($value) {
                    $extraInfo[] = [
                        'key' => $key,
                        'content' => $value,
                        'selected' => null,
                        'input_type' => 'text'
                    ];
                }
            }
        }

        return $extraInfo;
    }

    /**
     * Simulate Stripe webhook for development/testing
     * This endpoint simulates what Stripe would send to our webhook
     */
    public function simulateWebhook(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
        ]);

        try {
            $payment = Payment::find($request->payment_id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment not found'
                ], 404);
            }

            Log::info('Simulating Stripe webhook for payment:', [
                'payment_id' => $payment->id,
                'checkout_session_id' => $payment->checkout_session_id
            ]);

            // Simulate the checkout.session.completed event
            $sessionData = (object) [
                'id' => $payment->checkout_session_id,
                'payment_intent' => $payment->payment_intent_id,
                'metadata' => [
                    'booking_id' => $payment->booking_id,
                    'user_id' => $payment->user_id,
                    'payment_id' => $payment->id,
                ]
            ];

            // Process the webhook
            $this->handleCheckoutSessionCompleted($sessionData);

            return response()->json([
                'success' => true,
                'message' => 'Webhook simulation completed successfully',
                'payment_id' => $payment->id
            ]);

        } catch (\Exception $e) {
            Log::error('Webhook simulation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Quick fix endpoint to complete payment for specific order
     * This bypasses webhook and directly processes the balance payment
     */
    public function quickCompletePayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
        ]);

        try {
            // Find booking by external_booking_id
            $booking = Booking::where('external_booking_id', $request->order_id)->first();
            
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found for this order ID'
                ], 404);
            }

            $payment = $booking->payment;
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment not found for this booking'
                ], 404);
            }

            Log::info('Quick Complete Payment - Starting', [
                'order_id' => $request->order_id,
                'booking_id' => $booking->id,
                'payment_id' => $payment->id
            ]);

            DB::beginTransaction();

            // Process the complete Klook order flow
            $result = $this->processKlookOrderFlow($booking, $payment);

            if ($result['success']) {
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Payment completed successfully',
                    'data' => [
                        'booking_id' => $booking->id,
                        'payment_id' => $payment->id,
                        'order_no' => $result['order_no'],
                        'booking_status' => $result['booking_status'],
                        'payment_status' => $result['payment_status'],
                    ]
                ]);
            } else {
                DB::rollBack();
                
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Quick Complete Payment - Exception: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
