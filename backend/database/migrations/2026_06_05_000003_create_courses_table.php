<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('category')->nullable();
            $table->string('language', 10)->default('hi');  // hi, en, te, ta, etc.
            $table->string('level')->nullable();             // beginner, intermediate, advanced

            // Status
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('type', ['self_paced', 'cohort', 'live'])->default('self_paced');
            $table->timestamp('published_at')->nullable();

            // Pricing
            $table->enum('pricing_type', ['free', 'one_time', 'subscription', 'payment_plan'])->default('free');
            $table->unsignedInteger('price_inr')->default(0);   // in paise (₹999 = 99900)
            $table->unsignedInteger('price_usd')->default(0);   // in cents
            $table->unsignedInteger('original_price_inr')->nullable(); // for strikethrough
            $table->boolean('enrolment_open')->default(true);

            // Access
            $table->unsignedInteger('access_days')->nullable();  // null = lifetime
            $table->timestamp('access_expires_at')->nullable();  // fixed expiry

            // Features
            $table->boolean('certificate_enabled')->default(false);
            $table->boolean('community_enabled')->default(false);

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('og_image_url')->nullable();

            // Cohort fields
            $table->timestamp('cohort_starts_at')->nullable();
            $table->timestamp('cohort_ends_at')->nullable();
            $table->timestamp('enrolment_opens_at')->nullable();
            $table->timestamp('enrolment_closes_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['creator_id', 'slug']);
            $table->index(['creator_id', 'status']);
        });

        Schema::create('modules', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();

            $table->index(['course_id', 'order']);
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('module_id');
            $table->foreign('module_id')->references('id')->on('modules')->cascadeOnDelete();
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();

            $table->string('title');
            $table->enum('content_type', ['video', 'text', 'file', 'quiz', 'assignment'])->default('video');

            // Video
            $table->string('mux_asset_id')->nullable();
            $table->string('mux_playback_id')->nullable();
            $table->string('youtube_url')->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->enum('video_status', ['idle', 'uploading', 'processing', 'ready', 'error'])->default('idle');

            // Text
            $table->longText('content')->nullable();  // HTML from TipTap

            // File
            $table->string('file_url')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_mime_type')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();

            // Access control
            $table->boolean('is_free_preview')->default(false);
            $table->boolean('is_downloadable')->default(false);
            $table->unsignedSmallInteger('drip_days')->nullable();  // null = available immediately
            $table->uuid('prerequisite_lesson_id')->nullable();

            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['module_id', 'order']);
            $table->index(['course_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('courses');
    }
};
