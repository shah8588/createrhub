<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'creator_id', 'student_id', 'course_id', 'coupon_id',
        'currency', 'base_amount', 'discount_amount', 'gst_amount', 'total_amount',
        'cgst_rate', 'cgst_amount', 'sgst_rate', 'sgst_amount', 'igst_rate', 'igst_amount',
        'gateway', 'gateway_order_id', 'gateway_payment_id', 'gateway_signature', 'payment_method',
        'status', 'paid_at', 'refunded_amount', 'refunded_at', 'refund_id', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function getTotalAmountFormattedAttribute(): string
    {
        return '₹' . number_format($this->total_amount / 100, 2);
    }
}
