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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['activity', 'hotel', 'flight'])->default('activity');
            
            // Activity booking fields (Klook)
            $table->string('activity_external_id')->nullable();   // Klook activity ID
            $table->string('activity_name')->nullable();          // Store name from API at booking time
            $table->date('activity_date')->nullable();
            $table->string('activity_package_id')->nullable();    // Klook package ID
            $table->json('activity_schedule')->nullable();        // Store schedule details
            
            // Hotel booking fields (for future)
            $table->string('hotel_external_id')->nullable();
            $table->string('hotel_name')->nullable();
            $table->date('check_in_date')->nullable();
            $table->date('check_out_date')->nullable();
            $table->integer('rooms')->nullable();
            
            // Flight booking fields (for future)
            $table->string('flight_external_id')->nullable();
            $table->string('flight_number')->nullable();
            $table->date('departure_date')->nullable();
            $table->date('return_date')->nullable();
            
            // Common fields
            $table->integer('guests')->default(1);
            $table->integer('adults')->default(1);
            $table->integer('children')->default(0);
            $table->decimal('total_price', 10, 2);
            $table->decimal('subtotal', 10, 2)->nullable();
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->string('currency', 10)->default(config('stripe.currency', 'usd'));
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'])->default('pending');
            
            // External booking references
            $table->string('external_booking_id')->nullable(); // from Klook API
            $table->string('agent_order_id')->nullable();     // Our internal order ID
            
            // Customer information
            $table->json('customer_info')->nullable();         // Store customer details
            $table->json('booking_details')->nullable();       // Store booking-specific details
            
            // Timestamps
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('external_booking_id');
            $table->index('agent_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};