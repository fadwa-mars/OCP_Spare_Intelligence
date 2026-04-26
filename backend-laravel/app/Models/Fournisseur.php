<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'email_contact', 'telephone', 'adresse',
        'score_global', 'nb_commandes', 'nb_livraisons_retard',
        'delai_moyen_livraison', 'taux_conformite', 'est_actif', 'date_derniere_evaluation'
    ];

    protected $casts = [
        'score_global' => 'decimal:2',
        'taux_conformite' => 'decimal:2',
        'est_actif' => 'boolean',
        'date_derniere_evaluation' => 'date',
    ];

    // Relations
    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function offres()
    {
        return $this->hasMany(Offre::class);
    }
}