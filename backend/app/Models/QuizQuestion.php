<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    use HasUuids;

    protected $fillable = [
        'quiz_id', 'question', 'type', 'options', 'correct_answer',
        'explanation', 'points', 'order',
    ];

    protected function casts(): array
    {
        return ['options' => 'array'];
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
