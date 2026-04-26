<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeAchat extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id', 'user_id', 'quantite', 
        'date_demande', 'date_besoin', 'urgence', 'statut'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'date_demande' => 'date',
        'date_besoin' => 'date',
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

    public function appelOffre()
    {
        return $this->hasOne(AppelOffre::class);
    }

    // Ajouter cette relation
    public function commande()
    {
        return $this->hasOne(Commande::class);
    }
}