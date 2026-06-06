<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('email');
            $table->string('name')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('source')->nullable();   // landing_page, form, import, etc.
            $table->json('tags')->nullable();        // ["beginner", "trading"]
            $table->json('custom_fields')->nullable();

            // Email subscription
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('unsubscribe_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['creator_id', 'email']);
            $table->index(['creator_id', 'subscribed_at']);
        });

        Schema::create('email_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_id');
            $table->foreign('creator_id')->references('id')->on('creators')->cascadeOnDelete();

            $table->string('name');
            $table->string('subject');
            $table->string('preview_text')->nullable();
            $table->longText('html_content');
            $table->json('segment_filters')->nullable(); // who receives it
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('recipients_count')->default(0);
            $table->timestamps();
        });

        Schema::create('email_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('lead_id');
            $table->foreign('lead_id')->references('id')->on('leads')->cascadeOnDelete();
            $table->uuid('campaign_id')->nullable();
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->nullOnDelete();
            $table->enum('event', ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed']);
            $table->string('link_url')->nullable();  // for click events
            $table->timestamp('occurred_at')->useCurrent();

            $table->index(['lead_id', 'event']);
            $table->index(['campaign_id', 'event']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_events');
        Schema::dropIfExists('email_campaigns');
        Schema::dropIfExists('leads');
    }
};
