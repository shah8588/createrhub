<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'module_id', 'course_id', 'title', 'content_type',
        'mux_asset_id', 'mux_playback_id', 'youtube_url', 'duration_seconds', 'video_status',
        'content', 'file_url', 'file_name', 'file_mime_type', 'file_size_bytes',
        'is_free_preview', 'is_downloadable', 'drip_days', 'prerequisite_lesson_id', 'order',
    ];

    protected function casts(): array
    {
        return [
            'is_free_preview' => 'boolean',
            'is_downloadable' => 'boolean',
        ];
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }

    public function completions()
    {
        return $this->hasMany(LessonCompletion::class);
    }

    public function qaQuestions()
    {
        return $this->hasMany(QaQuestion::class);
    }
}
