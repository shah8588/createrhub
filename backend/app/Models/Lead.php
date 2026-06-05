<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'creator_id', 'email', 'name', 'phone', 'source',
        'tags', 'custom_fields', 'subscribed_at', 'unsubscribed_at', 'unsubscribe_reason',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'custom_fields' => 'array',
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function isSubscribed(): bool
    {
        return $this->subscribed_at !== null && $this->unsubscribed_at === null;
    }
}
