<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id', 'user_id', 'commande_id', 'type_mouvement',
        'quantite', 'reference_externe', 'commentaire', 'date_mouvement'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
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

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}