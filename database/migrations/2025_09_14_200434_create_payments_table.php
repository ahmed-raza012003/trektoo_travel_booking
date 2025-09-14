<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Payment details
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default(config('stripe.currency', 'usd'));
            $table->enum('method', ['credit_card', 'debit_card', 'paypal', 'stripe', 'wallet', 'bank_transfer', 'klook_balance'])->default('stripe');
            $table->enum('status', ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'])->default('pending');
            
            // External payment references
            $table->string('transaction_id')->nullable();           // Stripe payment intent ID
            $table->string('payment_intent_id')->nullable();        // Stripe payment intent ID
            $table->string('charge_id')->nullable();                // Stripe charge ID
            $table->string('refund_id')->nullable();                // Stripe refund ID
            
            // Payment provider details
            $table->string('provider')->default('stripe');          // stripe, paypal, etc.
            $table->json('provider_response')->nullable();          // Store full provider response
            $table->json('payment_method_details')->nullable();     // Store payment method details
            
            // Customer information
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('billing_address')->nullable();
            
            // Fees and charges
            $table->decimal('processing_fee', 10, 2)->default(0);
            $table->decimal('refund_amount', 10, 2)->default(0);
            $table->text('failure_reason')->nullable();
            
            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['booking_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('transaction_id');
            $table->index('payment_intent_id');
            $table->index('provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};