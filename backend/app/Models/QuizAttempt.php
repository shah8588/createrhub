<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id', 'quiz_id', 'attempt_number', 'answers',
        'score', 'total_points', 'passed', 'time_taken_seconds', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'passed' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
