<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CreatorSetting extends Model
{
    use HasUuids;

    protected $fillable = [
        'creator_id', 'primary_color', 'secondary_color', 'font_family',
        'logo_url', 'favicon_url', 'custom_domain', 'domain_status',
        'domain_verified_at', 'notification_prefs', 'invoice_prefix',
        'invoice_sequence', 'invoice_logo_url',
    ];

    protected function casts(): array
    {
        return [
            'notification_prefs' => 'array',
            'domain_verified_at' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
}
