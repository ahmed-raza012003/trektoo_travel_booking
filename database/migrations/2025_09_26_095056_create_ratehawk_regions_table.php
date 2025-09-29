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
        Schema::create('ratehawk_regions', function (Blueprint $table) {
            $table->string('id')->primary(); // Use string ID for Ratehawk region IDs
            $table->string('name');
            $table->string('country_code', 2);
            $table->string('country_name');
            $table->string('region_type')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
            
            $table->index(['country_code', 'region_type']);
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratehawk_regions');
    }
};