<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creators', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('name');
            $table->string('slug')->unique();          // rahul → rahul.createrhub.in
            $table->string('email')->unique();
            $table->string('password')->nullable();    // null for Google OAuth users
            $table->string('avatar_url')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('google_id')->nullable()->index();
            $table->timestamp('email_verified_at')->nullable();

            // Business info
            $table->string('gstin', 15)->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_address')->nullable();
            $table->string('state_code', 2)->nullable();    // for GST CGST vs IGST

            // Payment gateways (creator connects their own)
            $table->string('razorpay_account_id')->nullable();
            $table->string('razorpay_access_token')->nullable();  // encrypted
            $table->string('stripe_account_id')->nullable();

            // Platform subscription
            $table->enum('plan', ['free', 'starter', 'pro'])->default('free');
            $table->timestamp('plan_expires_at')->nullable();
            $table->string('razorpay_subscription_id')->nullable(); // creator's sub to platform

            // Social links
            $table->string('youtube_url')->nullable();
            $table->string('instagram_handle')->nullable();
            $table->string('twitter_handle')->nullable();
            $table->string('website_url')->nullable();

            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('email');
            $table->index('slug');
        });

        Schema::create('creator_settings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('creator_id')->unique();
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            // Theme
            $table->string('primary_color', 7)->default('#c84b31');
            $table->string('secondary_color', 7)->default('#2d6a4f');
            $table->string('font_family')->default('DM Sans');
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();

            // Domain
            $table->string('custom_domain')->nullable()->unique();
            $table->enum('domain_status', ['pending', 'active', 'failed'])->nullable();
            $table->timestamp('domain_verified_at')->nullable();

            // Notifications (JSON: { new_enrolment: { email: true, whatsapp: false } })
            $table->json('notification_prefs')->nullable();

            // Invoicing
            $table->string('invoice_prefix')->default('INV');
            $table->unsignedInteger('invoice_sequence')->default(0);
            $table->string('invoice_logo_url')->nullable();

            $table->timestamps();
        });

        Schema::create('creator_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creator_password_reset_tokens');
        Schema::dropIfExists('creator_settings');
        Schema::dropIfExists('creators');
    }
};
