<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Creator extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, HasRoles, SoftDeletes;

    // Use 'web' guard for Spatie roles so roles are shared across guards
    protected $guard_name = 'web';

    protected $fillable = [
        'name', 'slug', 'email', 'password', 'avatar_url', 'bio', 'phone',
        'google_id', 'email_verified_at', 'onboarding_completed_at',
        'gstin', 'business_name', 'business_address', 'state_code',
        'razorpay_account_id', 'razorpay_access_token', 'stripe_account_id',
        'plan', 'plan_expires_at', 'razorpay_subscription_id',
        'youtube_url', 'instagram_handle', 'twitter_handle', 'website_url',
    ];

    protected $hidden = ['password', 'remember_token', 'razorpay_access_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at'        => 'datetime',
            'onboarding_completed_at'  => 'datetime',
            'plan_expires_at'          => 'datetime',
            'password' => 'hashed',
            'razorpay_access_token' => 'encrypted',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function settings()
    {
        return $this->hasOne(CreatorSetting::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function students()
    {
        return $this->hasManyThrough(Student::class, Enrolment::class, 'course_id', 'id', 'id', 'student_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function pages()
    {
        return $this->hasMany(Page::class);
    }

    public function communities()
    {
        return $this->hasMany(Community::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function getStorefrontUrlAttribute(): string
    {
        $setting = $this->settings;
        if ($setting?->custom_domain && $setting->domain_status === 'active') {
            return 'https://' . $setting->custom_domain;
        }
        return 'https://' . $this->slug . '.' . config('platform.domain');
    }

    public function isOnPlan(string $plan): bool
    {
        return $this->plan === $plan && (
            $this->plan_expires_at === null || $this->plan_expires_at->isFuture()
        );
    }
}
