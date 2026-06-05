<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseProgress extends Model
{
    protected $fillable = [
        'student_id', 'course_id', 'percent_complete', 'last_lesson_id',
        'last_accessed_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
