<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_sap', 'designation', 'categorie', 'etat',
        'seuil_min', 'seuil_securite', 'unite_mesure', 'poids', 'delai_approvisionnement'
    ];

    protected $casts = [
        'seuil_min' => 'decimal:2',
        'seuil_securite' => 'decimal:2',
        'poids' => 'decimal:2',
    ];

    // Relations
    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function demandesAchat()
    {
        return $this->hasMany(DemandeAchat::class);
    }

    public function mouvements()
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function alertes()
    {
        return $this->hasMany(Alerte::class);
    }

    public function ligneCommandes()
    {
        return $this->hasMany(LigneCommande::class);
    }

    public function historiqueStocks()
    {
        return $this->hasMany(HistoriqueStock::class);
    }

    public function seuilHistoriques()
    {
        return $this->hasMany(SeuilHistorique::class);
    }

    public function classification()
    {
        return $this->hasOne(ClassificationAbcXyz::class);
    }

    public function simulations()
    {
        return $this->hasMany(SimulationWhatIf::class);
    }
}