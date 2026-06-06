<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, \Spatie\Permission\Traits\HasRoles, HasFactory, HasUuids, Notifiable, SoftDeletes;

    protected $guard_name = 'web';

    protected $fillable = [
        'name', 'email', 'password', 'avatar_url', 'phone', 'whatsapp_number',
        'email_verified_at', 'phone_verified_at',
        'gstin', 'billing_name', 'billing_address', 'billing_state_code',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function enrolments()
    {
        return $this->hasMany(Enrolment::class);
    }

    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'enrolments')
            ->withPivot('status', 'enrolled_at', 'expires_at', 'source')
            ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function progress()
    {
        return $this->hasMany(CourseProgress::class);
    }

    public function completedLessons()
    {
        return $this->hasMany(LessonCompletion::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
