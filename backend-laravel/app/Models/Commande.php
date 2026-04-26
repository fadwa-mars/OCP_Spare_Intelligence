<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'appel_offre_id', 'fournisseur_id', 'user_id', 'numero_bc',
        'date_commande', 'date_livraison_prevue', 'date_livraison_reelle',
        'statut', 'montant_total', 'conditions_paiement', 'demande_achat_id'
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison_prevue' => 'date',
        'date_livraison_reelle' => 'date',
        'montant_total' => 'decimal:2',
    ];

    // Relations
    public function appelOffre()
    {
        return $this->belongsTo(AppelOffre::class);
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function alertes()
    {
        return $this->hasMany(Alerte::class);
    }

    public function relances()
    {
        return $this->hasMany(Relance::class);
    }

    public function ligneCommandes()
    {
        return $this->hasMany(LigneCommande::class);
    }

    // Relation avec l'offre gagnante (AJOUTÉ)
    public function offre()
    {
        return $this->belongsTo(Offre::class);
    }
}