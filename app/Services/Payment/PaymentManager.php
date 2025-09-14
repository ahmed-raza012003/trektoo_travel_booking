<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\Booking;
use App\Services\Payment\StripeService;
use Illuminate\Support\Facades\Log;

class PaymentManager
{
    protected $services = [];

    public function __construct()
    {
        $this->services = [
            'stripe' => new StripeService(),
            // Add other payment services here
        ];
    }

    /**
     * Create a payment for a booking
     */
    public function createPayment(Booking $booking, array $paymentData): Payment
    {
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'] ?? config('stripe.currency', 'usd'),
            'method' => $paymentData['method'] ?? 'stripe',
            'provider' => $paymentData['provider'] ?? 'stripe',
            'customer_email' => $paymentData['customer_email'] ?? $booking->user->email,
            'customer_name' => $paymentData['customer_name'] ?? $booking->user->name,
            'billing_address' => $paymentData['billing_address'] ?? null,
            'status' => 'pending',
        ]);

        return $payment;
    }

    /**
     * Process payment with the specified provider
     */
    public function processPayment(Payment $payment): array
    {
        $provider = $payment->provider;
        
        if (!isset($this->services[$provider])) {
            return [
                'success' => false,
                'error' => "Payment provider '{$provider}' not supported",
            ];
        }

        try {
            $service = $this->services[$provider];
            $result = $service->createPaymentIntent($payment);

            if ($result['success']) {
                $payment->update([
                    'status' => 'processing',
                    'provider_response' => array_merge(
                        $payment->provider_response ?? [],
                        ['payment_intent_created' => $result]
                    ),
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Payment Processing Failed:', [
                'payment_id' => $payment->id,
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            $payment->markAsFailed($e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Confirm payment
     */
    public function confirmPayment(Payment $payment, string $paymentIntentId): array
    {
        $provider = $payment->provider;
        
        if (!isset($this->services[$provider])) {
            return [
                'success' => false,
                'error' => "Payment provider '{$provider}' not supported",
            ];
        }

        try {
            $service = $this->services[$provider];
            $result = $service->confirmPaymentIntent($paymentIntentId);

            if ($result['success'] && $result['status'] === 'paid') {
                $payment->markAsPaid();
                $payment->booking->confirm();
                
                if (isset($result['charge_id'])) {
                    $payment->update(['charge_id' => $result['charge_id']]);
                }
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Payment Confirmation Failed:', [
                'payment_id' => $payment->id,
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
     * Create refund
     */
    public function createRefund(Payment $payment, float $amount = null): array
    {
        $provider = $payment->provider;
        
        if (!isset($this->services[$provider])) {
            return [
                'success' => false,
                'error' => "Payment provider '{$provider}' not supported",
            ];
        }

        try {
            $service = $this->services[$provider];
            $result = $service->createRefund($payment, $amount);

            if ($result['success']) {
                $payment->markAsRefunded($result['amount']);
                
                if (isset($result['refund_id'])) {
                    $payment->update(['refund_id' => $result['refund_id']]);
                }
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Refund Creation Failed:', [
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
     * Get payment service by provider
     */
    public function getService(string $provider): ?PaymentServiceInterface
    {
        return $this->services[$provider] ?? null;
    }

    /**
     * Get supported providers
     */
    public function getSupportedProviders(): array
    {
        return array_keys($this->services);
    }

    /**
     * Handle webhook from payment provider
     */
    public function handleWebhook(string $provider, string $payload, string $signature): array
    {
        if (!isset($this->services[$provider])) {
            return [
                'success' => false,
                'error' => "Payment provider '{$provider}' not supported",
            ];
        }

        try {
            $service = $this->services[$provider];
            return $service->handleWebhook($payload, $signature);
        } catch (\Exception $e) {
            Log::error('Webhook Handling Failed:', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
