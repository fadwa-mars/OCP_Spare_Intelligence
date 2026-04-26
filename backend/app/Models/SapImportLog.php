<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SapImportLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename', 'status', 'total_records', 'processed_records',
        'failed_records', 'error_message', 'details', 'user_id'
    ];

    protected $casts = [
        'details' => 'array',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}