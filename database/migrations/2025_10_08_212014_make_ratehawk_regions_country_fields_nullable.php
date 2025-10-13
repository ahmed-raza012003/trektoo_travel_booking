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
        Schema::table('ratehawk_regions', function (Blueprint $table) {
            $table->string('country_code', 2)->nullable()->change();
            $table->string('country_name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ratehawk_regions', function (Blueprint $table) {
            $table->string('country_code', 2)->nullable(false)->change();
            $table->string('country_name')->nullable(false)->change();
        });
    }
};
