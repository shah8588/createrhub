<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();
            $table->uuid('course_id')->nullable(); // null = standalone community
            $table->foreign('course_id')->references('id')->on('courses')->nullOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['public', 'private', 'course_only'])->default('course_only');
            $table->string('cover_image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('community_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('community_id');
            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();

            // Author â€” either a creator or a student
            $table->uuid('author_id');
            $table->string('author_type');  // App\Models\Creator | App\Models\Student

            $table->text('content');
            $table->json('media_urls')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_announcement')->default(false);
            $table->unsignedInteger('reply_count')->default(0);
            $table->unsignedInteger('reaction_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['community_id', 'created_at']);
            $table->index(['community_id', 'is_pinned']);
        });

        Schema::create('community_replies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('post_id');
            $table->foreign('post_id')->references('id')->on('community_posts')->cascadeOnDelete();
            $table->uuid('author_id');
            $table->string('author_type');
            $table->text('content');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('community_reactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('post_id');
            $table->foreign('post_id')->references('id')->on('community_posts')->cascadeOnDelete();
            $table->uuid('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->string('emoji', 10)->default('ðŸ‘');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['post_id', 'student_id']); // one reaction per student per post
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_reactions');
        Schema::dropIfExists('community_replies');
        Schema::dropIfExists('community_posts');
        Schema::dropIfExists('communities');
    }
};
