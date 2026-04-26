<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppelOffre extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_achat_id', 'acheteur_id', 'date_lancement', 
        'date_cloture', 'objet', 'statut'
    ];

    protected $casts = [
        'date_lancement' => 'datetime',
        'date_cloture' => 'datetime',
    ];

    // Relations
    public function demandeAchat()
    {
        return $this->belongsTo(DemandeAchat::class);
    }

    public function acheteur()
    {
        return $this->belongsTo(User::class, 'acheteur_id');
    }

    public function offres()
    {
        return $this->hasMany(Offre::class);
    }

    public function commande()
    {
        return $this->hasOne(Commande::class);
    }
}