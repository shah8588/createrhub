<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id', 'course_id', 'verify_code', 'pdf_url', 'issued_at',
    ];

    protected function casts(): array
    {
        return ['issued_at' => 'datetime'];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn ($model) => $model->verify_code ??= Str::upper(Str::random(12)));
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getVerifyUrlAttribute(): string
    {
        return url('/verify/' . $this->verify_code);
    }
}
