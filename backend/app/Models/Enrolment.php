<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Enrolment extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id', 'course_id', 'status', 'source',
        'enrolled_at', 'expires_at', 'revoked_at', 'revoked_by',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        return true;
    }
}
