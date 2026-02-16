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
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('document_type')->nullable();
            $table->string('document_number')->nullable();
            $table->date('document_expiry')->nullable();
            $table->string('issuing_country')->nullable();
            $table->string('postal_code')->nullable();
            $table->date('residence_start_date')->nullable();
            $table->string('alternative_email')->nullable();
            $table->date('entry_date_portugal')->nullable();
            $table->string('professional_group')->nullable();
            $table->string('occupation_detail')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            //
        });
    }
};
