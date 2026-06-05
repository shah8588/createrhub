<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('code')->index();
            $table->enum('type', ['percent', 'fixed'])->default('percent');
            $table->unsignedInteger('value');   // percent: 0-100, fixed: amount in paise
            $table->unsignedInteger('max_uses')->nullable(); // null = unlimited
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('min_order_amount')->nullable(); // paise
            $table->json('applicable_course_ids')->nullable(); // null = all courses
            $table->boolean('is_active')->default(true);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();

            $table->unique(['creator_id', 'code']);
        });

        Schema::create('coupon_uses', function (Blueprint $table) {
            $table->id();
            $table->uuid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons');
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students');
            $table->uuid('payment_id')->nullable();
            $table->foreign('payment_id')->references('id')->on('payments');
            $table->timestamp('used_at')->useCurrent();

            $table->unique(['coupon_id', 'student_id']); // one use per student per coupon
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_uses');
        Schema::dropIfExists('coupons');
    }
};
