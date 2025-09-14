<?php

namespace App\Services\Payment;

use App\Models\Payment;

interface PaymentServiceInterface
{
    /**
     * Create a payment intent
     */
    public function createPaymentIntent(Payment $payment): array;

    /**
     * Confirm a payment
     */
    public function confirmPayment(string $paymentId): array;

    /**
     * Create a refund
     */
    public function createRefund(Payment $payment, float $amount = null): array;

    /**
     * Get payment details
     */
    public function getPaymentDetails(string $paymentId): array;

    /**
     * Handle webhook events
     */
    public function handleWebhook(string $payload, string $signature): array;
}
