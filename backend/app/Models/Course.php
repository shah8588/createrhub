<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'creator_id', 'title', 'slug', 'description', 'thumbnail_url',
        'category', 'language', 'level', 'status', 'type', 'published_at',
        'pricing_type', 'price_inr', 'price_usd', 'original_price_inr', 'enrolment_open',
        'access_days', 'access_expires_at',
        'certificate_enabled', 'community_enabled',
        'meta_title', 'meta_description', 'og_image_url',
        'cohort_starts_at', 'cohort_ends_at', 'enrolment_opens_at', 'enrolment_closes_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'access_expires_at' => 'datetime',
            'cohort_starts_at' => 'datetime',
            'cohort_ends_at' => 'datetime',
            'enrolment_opens_at' => 'datetime',
            'enrolment_closes_at' => 'datetime',
            'enrolment_open' => 'boolean',
            'certificate_enabled' => 'boolean',
            'community_enabled' => 'boolean',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function enrolments()
    {
        return $this->hasMany(Enrolment::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'enrolments')
            ->withPivot('status', 'enrolled_at', 'expires_at')
            ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function certificateTemplate()
    {
        return $this->hasOne(CertificateTemplate::class);
    }

    public function community()
    {
        return $this->hasOne(Community::class);
    }

    public function page()
    {
        return $this->hasOne(Page::class)->where('type', 'course');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function getPriceInrFormattedAttribute(): string
    {
        return '₹' . number_format($this->price_inr / 100, 0);
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
