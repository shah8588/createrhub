<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_otp_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('identifier');        // email or phone
            $table->string('type');              // email_otp | whatsapp_otp
            $table->string('code');              // bcrypt hashed
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['identifier', 'used_at', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_otp_codes');
    }
};
