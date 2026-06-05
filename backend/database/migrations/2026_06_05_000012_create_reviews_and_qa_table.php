<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();

            $table->unsignedTinyInteger('rating');  // 1-5
            $table->text('review_text');
            $table->text('creator_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->unique(['course_id', 'student_id']);
            $table->index(['course_id', 'is_featured']);
        });

        Schema::create('qa_questions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('lesson_id');
            $table->foreign('lesson_id')->references('id')->on('lessons')->cascadeOnDelete();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->uuid('assigned_to')->nullable(); // TA uuid (creator_id)

            $table->text('question');
            $table->unsignedSmallInteger('upvote_count')->default(0);
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lesson_id', 'is_resolved']);
        });

        Schema::create('qa_answers', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('question_id');
            $table->foreign('question_id')->references('id')->on('qa_questions')->cascadeOnDelete();
            $table->uuid('author_id');
            $table->string('author_type'); // Creator | Student
            $table->text('answer');
            $table->boolean('is_accepted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_answers');
        Schema::dropIfExists('qa_questions');
        Schema::dropIfExists('reviews');
    }
};
