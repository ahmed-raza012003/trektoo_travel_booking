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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->unique()->index(); // Klook category ID
            $table->string('name');
            $table->enum('level', ['main', 'sub', 'leaf']); // Category level
            $table->unsignedBigInteger('parent_id')->nullable()->index(); // Parent category ID
            $table->unsignedBigInteger('main_category_id')->nullable()->index(); // Top-level category ID
            $table->text('full_path')->nullable(); // Full category path for easy searching
            $table->integer('sort_order')->default(0); // For ordering categories
            $table->boolean('is_active')->default(true);
            $table->json('raw_data')->nullable(); // Store complete API response
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['level', 'parent_id']);
            $table->index(['main_category_id', 'level']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
