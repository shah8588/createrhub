<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators');
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students');
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses');
            $table->uuid('coupon_id')->nullable();

            // Amounts in paise/cents (integer to avoid float issues)
            $table->string('currency', 3)->default('INR');
            $table->unsignedInteger('base_amount');         // before GST
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('gst_amount')->default(0);
            $table->unsignedInteger('total_amount');        // base - discount + gst

            // GST breakdown
            $table->decimal('cgst_rate', 5, 2)->default(0);
            $table->unsignedInteger('cgst_amount')->default(0);
            $table->decimal('sgst_rate', 5, 2)->default(0);
            $table->unsignedInteger('sgst_amount')->default(0);
            $table->decimal('igst_rate', 5, 2)->default(0);
            $table->unsignedInteger('igst_amount')->default(0);

            // Gateway details
            $table->enum('gateway', ['razorpay', 'stripe', 'manual'])->default('razorpay');
            $table->string('gateway_order_id')->nullable()->index();
            $table->string('gateway_payment_id')->nullable()->unique(); // idempotency
            $table->string('gateway_signature')->nullable();
            $table->string('payment_method')->nullable();   // upi, card, netbanking, emi

            $table->enum('status', ['pending', 'captured', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->unsignedInteger('refunded_amount')->default(0);
            $table->timestamp('refunded_at')->nullable();
            $table->string('refund_id')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['creator_id', 'status']);
            $table->index(['student_id', 'status']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('payment_id');
            $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();

            $table->string('invoice_number')->unique();  // INV-2026-0001
            $table->date('invoice_date');

            // Seller (creator)
            $table->string('seller_name');
            $table->string('seller_gstin', 15)->nullable();
            $table->text('seller_address')->nullable();

            // Buyer (student)
            $table->string('buyer_name');
            $table->string('buyer_gstin', 15)->nullable();
            $table->text('buyer_address')->nullable();

            $table->string('item_description');
            $table->unsignedInteger('base_amount');
            $table->decimal('gst_rate', 5, 2);
            $table->unsignedInteger('cgst_amount')->default(0);
            $table->unsignedInteger('sgst_amount')->default(0);
            $table->unsignedInteger('igst_amount')->default(0);
            $table->unsignedInteger('total_amount');

            $table->string('pdf_url')->nullable();
            $table->timestamp('pdf_generated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payments');
    }
};
