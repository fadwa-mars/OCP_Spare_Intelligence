<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id', 'stock_actuel', 'stock_reserve', 
        'stock_disponible', 'emplacement', 'date_dernier_mouvement'
    ];

    protected $casts = [
        'stock_actuel' => 'decimal:2',
        'stock_reserve' => 'decimal:2',
        'stock_disponible' => 'decimal:2',
        'date_dernier_mouvement' => 'date',
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}