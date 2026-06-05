<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasUuids;

    protected $fillable = [
        'lesson_id', 'passing_score', 'max_attempts', 'randomise_questions',
        'show_answers_after', 'time_limit_minutes',
    ];

    protected function casts(): array
    {
        return [
            'randomise_questions' => 'boolean',
            'show_answers_after' => 'boolean',
        ];
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
