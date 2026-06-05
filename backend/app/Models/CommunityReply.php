<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class CommunityReply extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'community_replies';

    protected $fillable = ['post_id', 'author_id', 'author_type', 'content'];

    public function post()
    {
        return $this->belongsTo(CommunityPost::class, 'post_id');
    }

    public function author()
    {
        return $this->morphTo();
    }
}
