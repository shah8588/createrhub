<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasUuids;

    protected $fillable = [
        'creator_id', 'code', 'type', 'value', 'max_uses', 'used_count',
        'min_order_amount', 'applicable_course_ids', 'is_active', 'valid_from', 'valid_until',
    ];

    protected function casts(): array
    {
        return [
            'applicable_course_ids' => 'array',
            'is_active' => 'boolean',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function uses()
    {
        return $this->hasMany(CouponUse::class);
    }

    public function isValid(int $orderAmount): bool
    {
        if (!$this->is_active) return false;
        if ($this->valid_from && $this->valid_from->isFuture()) return false;
        if ($this->valid_until && $this->valid_until->isPast()) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($this->min_order_amount && $orderAmount < $this->min_order_amount) return false;
        return true;
    }

    public function calculateDiscount(int $amount): int
    {
        if ($this->type === 'percent') {
            return (int) round($amount * $this->value / 100);
        }
        return min($this->value, $amount); // fixed, can't exceed order amount
    }
}
