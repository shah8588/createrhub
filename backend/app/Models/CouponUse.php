<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponUse extends Model
{
    protected $fillable = ['coupon_id', 'student_id', 'payment_id', 'used_at'];

    protected function casts(): array
    {
        return ['used_at' => 'datetime'];
    }
}
