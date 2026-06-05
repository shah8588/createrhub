<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonCompletion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'lesson_id', 'completed_at', 'watch_seconds', 'last_position_seconds',
    ];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
