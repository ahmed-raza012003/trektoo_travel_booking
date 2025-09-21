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
        Schema::create('ratehawk_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            
            // Ratehawk specific fields
            $table->string('partner_order_id')->unique();
            $table->string('book_hash')->nullable();
            $table->string('ratehawk_order_id')->nullable();
            
            // Booking details
            $table->enum('payment_type', ['deposit', 'prepaid', 'pay_at_property'])->default('deposit');
            $table->json('booking_data')->nullable(); // Room selection, pricing, etc.
            $table->json('guest_info')->nullable(); // Guest details
            $table->json('hotel_info')->nullable(); // Hotel details snapshot
            $table->json('rate_info')->nullable(); // Rate details snapshot
            
            // Status tracking
            $table->string('status')->default('pending');
            $table->string('ratehawk_status')->nullable();
            $table->text('status_message')->nullable();
            
            // Timestamps and expiry
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['partner_order_id', 'status']);
            $table->index(['booking_id', 'status']);
            $table->index(['ratehawk_order_id']);
            $table->index(['status', 'created_at']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratehawk_orders');
    }
};
