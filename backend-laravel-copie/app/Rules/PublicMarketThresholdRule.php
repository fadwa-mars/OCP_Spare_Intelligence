<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PublicMarketThresholdRule implements ValidationRule
{
    protected $seuil;

    public function __construct($seuil = null)
    {
        $this->seuil = $seuil ?? 50000;
    }

    /**
     * Valider la règle
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value >= $this->seuil) {
            // Déclencher un appel d'offres obligatoire
            session(['tender_required' => true]);
        }
    }

    /**
     * Vérifier si un appel d'offres est requis
     */
    public function isTenderRequired($montant)
    {
        return $montant >= $this->seuil;
    }

    /**
     * Obtenir le nombre minimum de fournisseurs
     */
    public function getMinSuppliers($montant)
    {
        if ($montant >= $this->seuil * 2) {
            return 5;
        }
        if ($montant >= $this->seuil) {
            return 3;
        }
        return 1;
    }

    /**
     * Obtenir le délai minimum de réponse
     */
    public function getMinResponseDays($montant)
    {
        if ($montant >= $this->seuil * 2) {
            return 15;
        }
        if ($montant >= $this->seuil) {
            return 10;
        }
        return 7;
    }
}