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
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'adult' or 'child'
            $table->integer('passenger_number'); // 1, 2, 3, etc.
            $table->boolean('is_lead_passenger')->default(false);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable(); // Only for adults
            $table->string('phone')->nullable(); // Only for adults
            $table->string('country');
            $table->string('passport_id');
            $table->integer('age')->nullable(); // Only for children
            $table->timestamps();
            
            $table->index(['booking_id', 'passenger_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
