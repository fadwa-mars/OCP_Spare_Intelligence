<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offre extends Model
{
    use HasFactory;

    protected $fillable = [
        'appel_offre_id', 'fournisseur_id', 'prix_unitaire', 'delai_livraison',
        'garantie', 'frais_livraison', 'montant_total', 'date_soumission',
        'score_calcule', 'rang', 'est_laureat'
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'frais_livraison' => 'decimal:2',
        'montant_total' => 'decimal:2',
        'score_calcule' => 'decimal:2',
        'date_soumission' => 'datetime',
        'est_laureat' => 'boolean',
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

    public function ligneCommandes()
    {
        return $this->hasMany(LigneCommande::class);
    }
}