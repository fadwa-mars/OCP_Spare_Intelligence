<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriqueStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id', 'stock_avant', 'stock_apres', 'quantite_change',
        'type_mouvement', 'reference', 'date_mouvement', 'user_id'
    ];

    protected $casts = [
        'stock_avant' => 'decimal:2',
        'stock_apres' => 'decimal:2',
        'quantite_change' => 'decimal:2',
        'date_mouvement' => 'datetime',
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}