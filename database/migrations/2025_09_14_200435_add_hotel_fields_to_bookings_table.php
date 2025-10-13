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
            // Add additional hotel-specific fields
            $table->json('ratehawk_booking_data')->nullable()->after('booking_details');
            $table->string('ratehawk_order_id')->nullable()->after('ratehawk_booking_data');
            $table->json('hotel_images')->nullable()->after('ratehawk_order_id');
            $table->string('hotel_rating')->nullable()->after('hotel_images');
            $table->json('hotel_amenities')->nullable()->after('hotel_rating');
            $table->json('room_details')->nullable()->after('hotel_amenities');
            
            // Add indexes for hotel bookings
            $table->index(['type', 'hotel_external_id']);
            $table->index(['ratehawk_order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['type', 'hotel_external_id']);
            $table->dropIndex(['ratehawk_order_id']);
            
            $table->dropColumn([
                'ratehawk_booking_data',
                'ratehawk_order_id',
                'hotel_images',
                'hotel_rating',
                'hotel_amenities',
                'room_details'
            ]);
        });
    }
};
