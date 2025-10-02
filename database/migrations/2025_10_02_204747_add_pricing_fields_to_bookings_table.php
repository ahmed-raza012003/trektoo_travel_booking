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
        Schema::table('bookings', function (Blueprint $table) {
            // Add new pricing fields
            $table->decimal('original_amount', 10, 2)->nullable()->after('subtotal');
            $table->decimal('markup_percentage', 5, 2)->nullable()->after('original_amount');
            $table->decimal('markup_amount', 10, 2)->nullable()->after('markup_percentage');
            
            // Add external booking data field for storing Klook order details
            $table->json('external_booking_data')->nullable()->after('booking_details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['original_amount', 'markup_percentage', 'markup_amount', 'external_booking_data']);
        });
    }
};
