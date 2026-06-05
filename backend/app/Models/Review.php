<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasUuids;

    protected $fillable = [
        'course_id', 'student_id', 'rating', 'review_text',
        'creator_reply', 'replied_at', 'is_featured', 'is_hidden',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
