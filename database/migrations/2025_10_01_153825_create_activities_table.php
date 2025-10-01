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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('activity_id')->unique()->index();
            $table->string('title');
            $table->string('sub_title')->nullable();
            $table->unsignedBigInteger('city_id')->index();
            $table->unsignedBigInteger('country_id')->index();
            $table->unsignedBigInteger('category_id')->index();
            $table->text('supported_languages')->nullable(); // JSON array
            $table->string('price')->nullable();
            $table->string('currency')->nullable();
            $table->string('vat_price')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['category_id', 'city_id']);
            $table->index(['country_id', 'city_id']);
            $table->index('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
