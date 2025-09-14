<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeService
{
    protected $stripe;
    protected $currency;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret'));
        $this->currency = config('stripe.currency', 'usd');
    }

    /**
     * Create a payment intent for a booking
     */
    public function createPaymentIntent(Payment $payment): array
    {
        try {
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $this->convertToCents($payment->amount),
                'currency' => $payment->currency,
                'metadata' => [
                    'booking_id' => $payment->booking_id,
                    'user_id' => $payment->user_id,
                    'payment_id' => $payment->id,
                ],
                'description' => "Payment for booking #{$payment->booking_id}",
                'receipt_email' => $payment->customer_email,
            ]);

            // Update payment with payment intent ID
            $payment->update([
                'payment_intent_id' => $paymentIntent->id,
                'transaction_id' => $paymentIntent->id,
                'provider_response' => $paymentIntent->toArray(),
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Creation Failed:', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Confirm a payment intent
     */
    public function confirmPaymentIntent(string $paymentIntentId): array
    {
        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);
            
            if ($paymentIntent->status === 'succeeded') {
                return [
                    'success' => true,
                    'status' => 'paid',
                    'charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                ];
            }

            return [
                'success' => false,
                'status' => $paymentIntent->status,
                'error' => 'Payment not completed',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Confirmation Failed:', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a refund for a payment
     */
    public function createRefund(Payment $payment, float $amount = null): array
    {
        try {
            $refundAmount = $amount ? $this->convertToCents($amount) : null;
            
            $refund = $this->stripe->refunds->create([
                'payment_intent' => $payment->payment_intent_id,
                'amount' => $refundAmount,
                'metadata' => [
                    'booking_id' => $payment->booking_id,
                    'payment_id' => $payment->id,
                ],
            ]);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'amount' => $refund->amount / 100, // Convert back from cents
                'status' => $refund->status,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Refund Creation Failed:', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment intent details
     */
    public function getPaymentIntent(string $paymentIntentId): array
    {
        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);
            
            return [
                'success' => true,
                'data' => $paymentIntent->toArray(),
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent Retrieval Failed:', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get charge details
     */
    public function getCharge(string $chargeId): array
    {
        try {
            $charge = $this->stripe->charges->retrieve($chargeId);
            
            return [
                'success' => true,
                'data' => $charge->toArray(),
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Charge Retrieval Failed:', [
                'charge_id' => $chargeId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get refund details
     */
    public function getRefund(string $refundId): array
    {
        try {
            $refund = $this->stripe->refunds->retrieve($refundId);
            
            return [
                'success' => true,
                'data' => $refund->toArray(),
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Refund Retrieval Failed:', [
                'refund_id' => $refundId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Handle webhook events
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                config('stripe.webhook_secret')
            );

            switch ($event->type) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSucceeded($event->data->object);
                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailed($event->data->object);
                case 'charge.dispute.created':
                    return $this->handleChargeDispute($event->data->object);
                default:
                    return [
                        'success' => true,
                        'message' => 'Event type not handled',
                    ];
            }
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Handling Failed:', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Handle successful payment
     */
    protected function handlePaymentSucceeded($paymentIntent): array
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->markAsPaid();
            $payment->booking->confirm();
            
            return [
                'success' => true,
                'message' => 'Payment confirmed and booking updated',
            ];
        }

        return [
            'success' => false,
            'message' => 'Payment not found',
        ];
    }

    /**
     * Handle failed payment
     */
    protected function handlePaymentFailed($paymentIntent): array
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->markAsFailed($paymentIntent->last_payment_error->message ?? 'Payment failed');
            
            return [
                'success' => true,
                'message' => 'Payment marked as failed',
            ];
        }

        return [
            'success' => false,
            'message' => 'Payment not found',
        ];
    }

    /**
     * Handle charge dispute
     */
    protected function handleChargeDispute($charge): array
    {
        // Handle dispute logic here
        Log::warning('Stripe Charge Dispute:', [
            'charge_id' => $charge->id,
            'dispute_id' => $charge->dispute,
        ]);

        return [
            'success' => true,
            'message' => 'Dispute logged',
        ];
    }

    /**
     * Convert amount to cents for Stripe
     */
    protected function convertToCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    /**
     * Get Stripe publishable key
     */
    public function getPublishableKey(): string
    {
        return config('stripe.key');
    }
}
