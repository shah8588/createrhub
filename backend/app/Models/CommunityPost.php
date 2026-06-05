<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class CommunityPost extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'community_id', 'author_id', 'author_type', 'content',
        'media_urls', 'is_pinned', 'is_announcement', 'reply_count', 'reaction_count',
    ];

    protected function casts(): array
    {
        return [
            'media_urls' => 'array',
            'is_pinned' => 'boolean',
            'is_announcement' => 'boolean',
        ];
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function author()
    {
        return $this->morphTo();
    }

    public function replies()
    {
        return $this->hasMany(CommunityReply::class, 'post_id');
    }
}
