<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    use HasUuids;

    protected $fillable = ['course_id', 'template_data'];

    protected function casts(): array
    {
        return ['template_data' => 'array'];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
