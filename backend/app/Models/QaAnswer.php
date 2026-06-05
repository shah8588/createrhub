<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QaAnswer extends Model
{
    use HasUuids;

    protected $fillable = ['question_id', 'author_id', 'author_type', 'answer', 'is_accepted'];

    protected function casts(): array
    {
        return ['is_accepted' => 'boolean'];
    }

    public function question()
    {
        return $this->belongsTo(QaQuestion::class, 'question_id');
    }

    public function author()
    {
        return $this->morphTo();
    }
}
