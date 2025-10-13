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
        Schema::create('ratehawk_hotels', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_id')->unique(); // Ratehawk hotel ID
            $table->string('name');
            $table->string('country_code', 2)->nullable();
            $table->string('country_name')->nullable();
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('star_rating')->nullable();
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->json('facilities')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('review_count')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('raw_data')->nullable(); // Store complete API response
            $table->timestamp('last_updated')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('country_code');
            $table->index('city');
            $table->index('star_rating');
            $table->index('is_active');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratehawk_hotels');
    }
};