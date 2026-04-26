<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeuilHistorique extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id', 'ancien_seuil_min', 'nouveau_seuil_min',
        'ancien_seuil_securite', 'nouveau_seuil_securite',
        'raison_modification', 'modifie_par'
    ];

    protected $casts = [
        'ancien_seuil_min' => 'decimal:2',
        'nouveau_seuil_min' => 'decimal:2',
        'ancien_seuil_securite' => 'decimal:2',
        'nouveau_seuil_securite' => 'decimal:2',
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function modifiePar()
    {
        return $this->belongsTo(User::class, 'modifie_par');
    }
}