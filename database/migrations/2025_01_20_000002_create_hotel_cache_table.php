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
        Schema::create('hotel_cache', function (Blueprint $table) {
            $table->id();
            
            // Cache key and type
            $table->string('cache_key')->unique();
            $table->enum('cache_type', ['hotel_info', 'search_results', 'hotel_page', 'reviews'])->index();
            
            // Hotel identification
            $table->string('hotel_id')->nullable()->index();
            $table->string('search_hash')->nullable()->index(); // For search result caching
            
            // Cache data
            $table->json('data');
            $table->json('metadata')->nullable(); // Additional cache metadata
            
            // Cache management
            $table->timestamp('expires_at');
            $table->integer('access_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['cache_type', 'hotel_id']);
            $table->index(['expires_at']);
            $table->index(['last_accessed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_cache');
    }
};
