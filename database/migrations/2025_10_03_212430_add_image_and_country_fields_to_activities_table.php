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
        Schema::table('activities', function (Blueprint $table) {
            // Image fields
            $table->text('primary_image_url')->nullable();
            $table->string('image_alt_text')->nullable();
            $table->json('all_images')->nullable();
            
            // Country and location fields
            $table->string('country_name')->nullable();
            $table->string('city_name')->nullable();
            $table->string('location_display')->nullable();
            
            // Indexes for better performance
            $table->index('country_name');
            $table->index('city_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex(['country_name']);
            $table->dropIndex(['city_name']);
            
            $table->dropColumn([
                'primary_image_url',
                'image_alt_text',
                'all_images',
                'country_name',
                'city_name',
                'location_display'
            ]);
        });
    }
};
