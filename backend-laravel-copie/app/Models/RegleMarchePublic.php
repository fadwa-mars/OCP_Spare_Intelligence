<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegleMarchePublic extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'libelle', 'nb_min_fournisseurs', 'delai_min_reponse',
        'seuil_appel_offres', 'ponderation_prix', 'ponderation_delai', 'ponderation_qualite'
    ];

    protected $casts = [
        'seuil_appel_offres' => 'decimal:2',
        'ponderation_prix' => 'decimal:2',
        'ponderation_delai' => 'decimal:2',
        'ponderation_qualite' => 'decimal:2',
    ];
}