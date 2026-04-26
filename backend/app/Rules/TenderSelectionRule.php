<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TenderSelectionRule implements ValidationRule
{
    protected $regleMarche;

    public function __construct($regleMarche = null)
    {
        $this->regleMarche = $regleMarche;
    }

    /**
     * Valider la règle
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Vérifier qu'il y a au moins 3 offres
        if (count($value) < ($this->regleMarche->nb_min_fournisseurs ?? 3)) {
            $fail('Il faut au moins ' . ($this->regleMarche->nb_min_fournisseurs ?? 3) . ' offres pour sélectionner un gagnant.');
        }
    }

    /**
     * Sélectionner l'offre gagnante selon pondération
     */
    public function selectWinner($offres, $regle)
    {
        foreach ($offres as $offre) {
            $score = 0;
            
            // Score prix (plus le prix est bas, plus le score est élevé)
            $prixMin = min(array_column($offres, 'prix_unitaire'));
            $scorePrix = ($prixMin / $offre['prix_unitaire']) * $regle->ponderation_prix;
            
            // Score délai
            $delaiMin = min(array_column($offres, 'delai_livraison'));
            $scoreDelai = ($delaiMin / $offre['delai_livraison']) * $regle->ponderation_delai;
            
            // Score qualité (basé sur le fournisseur)
            $scoreQualite = ($offre['score_fournisseur'] / 100) * $regle->ponderation_qualite;
            
            $offre['score'] = $scorePrix + $scoreDelai + $scoreQualite;
        }
        
        // Trier par score décroissant
        usort($offres, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return $offres[0] ?? null;
    }
}