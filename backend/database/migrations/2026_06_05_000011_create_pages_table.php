<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('slug');
            $table->string('title');
            $table->enum('type', ['home', 'course', 'landing', 'about', 'contact', 'blog_index'])->default('landing');
            $table->enum('status', ['draft', 'published'])->default('draft');

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('og_image_url')->nullable();

            // Page content as JSONB (array of blocks)
            $table->json('blocks')->nullable();

            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['creator_id', 'slug']);
            $table->index(['creator_id', 'type', 'status']);
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('title');
            $table->string('slug');
            $table->string('excerpt', 500)->nullable();
            $table->longText('content');             // HTML from TipTap
            $table->string('featured_image_url')->nullable();
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->unsignedInteger('reading_time_minutes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['creator_id', 'slug']);
            $table->index(['creator_id', 'status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('pages');
    }
};
