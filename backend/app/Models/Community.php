<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Community extends Model
{
    use HasUuids;

    protected $fillable = [
        'creator_id', 'course_id', 'name', 'description', 'type', 'cover_image_url', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function posts()
    {
        return $this->hasMany(CommunityPost::class)->orderByDesc('is_pinned')->orderByDesc('created_at');
    }
}
