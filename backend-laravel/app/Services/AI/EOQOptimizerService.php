<?php

namespace App\Services\AI;

class EOQOptimizerService
{
    protected $mlClient;

    public function __construct(MLClientService $mlClient)
    {
        $this->mlClient = $mlClient;
    }

    /**
     * Optimiser la quantité économique de commande
     */
    public function optimize($articleId, $demandeAnnuelle, $coutPassation, $coutStockage, $prixUnitaire)
    {
        $result = $this->mlClient->call('/eoq', [
            'demande_annuelle' => $demandeAnnuelle,
            'cout_passation' => $coutPassation,
            'cout_stockage' => $coutStockage,
            'prix_unitaire' => $prixUnitaire,
        ]);

        // Calcul EOQ classique
        $eoq = sqrt((2 * $demandeAnnuelle * $coutPassation) / ($coutStockage * $prixUnitaire));

        return [
            'article_id' => $articleId,
            'demande_annuelle' => $demandeAnnuelle,
            'eoq_classique' => round($eoq, 0),
            'eoq_optimise' => $result['eoq'] ?? round($eoq, 0),
            'cout_total_optimal' => $result['total_cost'] ?? $this->calculateTotalCost($eoq, $demandeAnnuelle, $coutPassation, $coutStockage, $prixUnitaire),
            'nombre_commandes' => ceil($demandeAnnuelle / $eoq),
            'frequence_commandes_jours' => round(365 / ceil($demandeAnnuelle / $eoq), 0),
        ];
    }

    /**
     * Calculer le coût total
     */
    private function calculateTotalCost($eoq, $demande, $coutPassation, $coutStockage, $prix)
    {
        $coutPassationTotal = ($demande / $eoq) * $coutPassation;
        $coutStockageTotal = ($eoq / 2) * $coutStockage * $prix;
        return round($coutPassationTotal + $coutStockageTotal, 2);
    }

    /**
     * Simuler différents scénarios
     */
    public function simulateScenarios($demandeAnnuelle, $coutPassation, $coutStockage, $prixUnitaire)
    {
        $scenarios = [];
        
        foreach ([0.5, 0.75, 1, 1.25, 1.5] as $facteur) {
            $eoq = sqrt((2 * $demandeAnnuelle * $coutPassation) / ($coutStockage * $prixUnitaire)) * $facteur;
            $coutTotal = $this->calculateTotalCost($eoq, $demandeAnnuelle, $coutPassation, $coutStockage, $prixUnitaire);
            
            $scenarios[] = [
                'facteur' => $facteur,
                'eoq' => round($eoq, 0),
                'cout_total' => round($coutTotal, 2),
            ];
        }

        return $scenarios;
    }
}