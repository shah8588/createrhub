<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrolments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();

            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->enum('source', ['purchase', 'manual', 'bulk', 'coupon', 'free'])->default('purchase');

            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();   // null = lifetime
            $table->timestamp('revoked_at')->nullable();
            $table->uuid('revoked_by')->nullable();         // creator_id who revoked

            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
            $table->index(['course_id', 'status']);
            $table->index(['student_id', 'status']);
        });

        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->uuid('lesson_id');
            $table->foreign('lesson_id')->references('id')->on('lessons')->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();
            $table->unsignedInteger('watch_seconds')->default(0);
            $table->unsignedInteger('last_position_seconds')->default(0);

            $table->unique(['student_id', 'lesson_id']);
        });

        Schema::create('course_progress', function (Blueprint $table) {
            $table->id();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->unsignedTinyInteger('percent_complete')->default(0);
            $table->uuid('last_lesson_id')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_progress');
        Schema::dropIfExists('lesson_completions');
        Schema::dropIfExists('enrolments');
    }
};
