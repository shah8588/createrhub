<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lesson_id')->unique();
            $table->foreign('lesson_id')->references('id')->on('lessons')->cascadeOnDelete();

            $table->unsignedTinyInteger('passing_score')->default(70);  // percentage
            $table->unsignedTinyInteger('max_attempts')->default(3);    // 0 = unlimited
            $table->boolean('randomise_questions')->default(false);
            $table->boolean('show_answers_after')->default(true);
            $table->unsignedSmallInteger('time_limit_minutes')->nullable(); // null = no limit
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quiz_id');
            $table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();

            $table->text('question');
            $table->enum('type', ['mcq', 'true_false', 'fill_blank'])->default('mcq');
            $table->json('options')->nullable();        // [{ text: '...', is_correct: true }]
            $table->text('correct_answer')->nullable(); // for fill_blank
            $table->text('explanation')->nullable();
            $table->unsignedSmallInteger('points')->default(1);
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->uuid('quiz_id');
            $table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();

            $table->unsignedTinyInteger('attempt_number')->default(1);
            $table->json('answers');              // { question_id: selected_option }
            $table->unsignedSmallInteger('score');
            $table->unsignedSmallInteger('total_points');
            $table->boolean('passed')->default(false);
            $table->unsignedSmallInteger('time_taken_seconds')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->index(['student_id', 'quiz_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
