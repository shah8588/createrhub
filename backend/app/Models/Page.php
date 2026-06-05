<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'creator_id', 'slug', 'title', 'type', 'status',
        'meta_title', 'meta_description', 'og_image_url',
        'blocks', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
}
