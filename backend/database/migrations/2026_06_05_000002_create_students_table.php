<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('phone', 20)->nullable()->index();
            $table->string('whatsapp_number', 20)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();

            // For GST invoice (B2B purchases)
            $table->string('gstin', 15)->nullable();
            $table->string('billing_name')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('billing_state_code', 2)->nullable();

            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('email');
        });

        Schema::create('student_otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('identifier');   // email or phone number
            $table->string('type');         // email_otp | whatsapp_otp
            $table->string('code', 6);
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['identifier', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_otp_codes');
        Schema::dropIfExists('students');
    }
};
