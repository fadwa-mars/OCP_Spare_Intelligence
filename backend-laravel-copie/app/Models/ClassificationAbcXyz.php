<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassificationAbcXyz extends Model
{
    use HasFactory;

    // Spécifier le nom exact de la table
    protected $table = 'classification_abcxyz';

    protected $fillable = [
        'article_id', 'classe_abc', 'classe_xyz',
        'valeur_consommation', 'valeur_stock', 'date_calcul'
    ];

    // Relation avec Article
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}