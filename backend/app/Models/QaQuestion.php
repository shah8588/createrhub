<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class QaQuestion extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'lesson_id', 'student_id', 'assigned_to',
        'question', 'upvote_count', 'is_resolved', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function answers()
    {
        return $this->hasMany(QaAnswer::class, 'question_id');
    }
}
