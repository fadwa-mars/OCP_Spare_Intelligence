<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SimulationWhatIf extends Model
{
    use HasFactory;

    // Spécifier le nom exact de la table
    protected $table = 'simulations_whatif';

    protected $fillable = [
        'nom_simulation', 'description', 'parametres', 'resultats',
        'statut', 'article_id', 'cree_par', 'date_execution'
    ];

    protected $casts = [
        'parametres' => 'array',
        'resultats' => 'array',
        'date_execution' => 'datetime',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par');
    }
}