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
        Schema::table('payments', function (Blueprint $table) {
            // Add hotel-specific payment fields
            $table->string('ratehawk_order_id')->nullable()->after('booking_id');
            $table->string('partner_order_id')->nullable()->after('ratehawk_order_id');
            $table->json('hotel_payment_data')->nullable()->after('partner_order_id');
            
            // Add indexes for hotel payments
            $table->index(['ratehawk_order_id']);
            $table->index(['partner_order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['ratehawk_order_id']);
            $table->dropIndex(['partner_order_id']);
            
            $table->dropColumn([
                'ratehawk_order_id',
                'partner_order_id',
                'hotel_payment_data'
            ]);
        });
    }
};
