<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('father_surname')->nullable();
            $table->string('mother_surname')->nullable();
            $table->string('sex', 1)->nullable();
            $table->string('education_level', 1)->nullable();
            $table->string('address_2')->nullable();
            $table->string('country_code', 10)->nullable();
            $table->string('document_issue_date', 20)->nullable();
            $table->string('document_expiry_date', 20)->nullable();
            $table->string('issuing_country_code', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['father_surname', 'mother_surname', 'sex', 'education_level', 'address_2', 'country_code', 'document_issue_date', 'document_expiry_date', 'issuing_country_code']);
        });
    }
};
