<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');          // App\Models\Course etc.
            $table->uuid('entity_id');
            $table->string('action');               // created, updated, deleted, published
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->uuid('actor_id')->nullable();   // who did this
            $table->string('actor_type')->nullable(); // Creator | Student
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index('actor_id');
            $table->index('created_at');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('notifiable_id');
            $table->string('notifiable_type');      // Creator | Student
            $table->string('type');                  // App\Notifications\...
            $table->json('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
    }
};
