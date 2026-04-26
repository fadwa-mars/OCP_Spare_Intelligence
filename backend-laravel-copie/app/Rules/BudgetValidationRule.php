<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class BudgetValidationRule implements ValidationRule
{
    protected $budgetMax;
    protected $budgetRestant;

    public function __construct($budgetMax = null, $budgetRestant = null)
    {
        $this->budgetMax = $budgetMax ?? 100000;
        $this->budgetRestant = $budgetRestant ?? $this->budgetMax;
    }

    /**
     * Valider la règle
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value > $this->budgetRestant) {
            $fail("Le montant dépasse le budget restant de " . number_format($this->budgetRestant, 2) . " €.");
        }
    }

    /**
     * Vérifier le budget avant commande
     */
    public function checkBudget($montant, $budgetRestant)
    {
        return $montant <= $budgetRestant;
    }

    /**
     * Calculer le budget restant après dépense
     */
    public function calculateRemaining($budgetInitial, $depenses)
    {
        return $budgetInitial - array_sum($depenses);
    }

    /**
     * Alerte dépassement budget
     */
    public function getBudgetAlert($montant, $budgetRestant, $seuilAlerte = 80)
    {
        $pourcentageUtilise = ($montant / $this->budgetMax) * 100;
        
        if ($pourcentageUtilise >= 100) {
            return ['niveau' => 'rouge', 'message' => 'Budget dépassé !'];
        }
        if ($pourcentageUtilise >= $seuilAlerte) {
            return ['niveau' => 'jaune', 'message' => "Budget utilisé à {$pourcentageUtilise}%"];
        }
        return ['niveau' => 'vert', 'message' => 'Budget OK'];
    }
}