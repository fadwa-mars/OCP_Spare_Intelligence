<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MinimumQuantityRule implements ValidationRule
{
    protected $minQuantity;
    protected $articleId;

    public function __construct($minQuantity = 1, $articleId = null)
    {
        $this->minQuantity = $minQuantity;
        $this->articleId = $articleId;
    }

    /**
     * Valider la règle
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value < $this->minQuantity) {
            $fail("La quantité minimale est de {$this->minQuantity}.");
        }

        // Vérifier la quantité par rapport au conditionnement
        if ($this->articleId) {
            $article = \App\Models\Article::find($this->articleId);
            if ($article && $article->conditionnement) {
                if ($value % $article->conditionnement != 0) {
                    $fail("La quantité doit être un multiple de {$article->conditionnement}.");
                }
            }
        }
    }

    /**
     * Obtenir la quantité économique de commande
     */
    public function getEconomicOrderQuantity($demandeAnnuelle, $coutPassation, $coutStockage, $prixUnitaire)
    {
        $eoq = sqrt((2 * $demandeAnnuelle * $coutPassation) / ($coutStockage * $prixUnitaire));
        return round($eoq);
    }

    /**
     * Obtenir le seuil de réapprovisionnement
     */
    public function getReorderPoint($consommationJournaliere, $delaiApprovisionnement, $stockSecurite = 0)
    {
        return ($consommationJournaliere * $delaiApprovisionnement) + $stockSecurite;
    }
}