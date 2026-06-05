<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'payment_id', 'invoice_number', 'invoice_date',
        'seller_name', 'seller_gstin', 'seller_address',
        'buyer_name', 'buyer_gstin', 'buyer_address',
        'item_description', 'base_amount', 'gst_rate',
        'cgst_amount', 'sgst_amount', 'igst_amount', 'total_amount',
        'pdf_url', 'pdf_generated_at',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'pdf_generated_at' => 'datetime',
        ];
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
