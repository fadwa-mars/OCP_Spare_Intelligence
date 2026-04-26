<?php

namespace App\Services\AI;

use App\Models\MouvementStock;

class ConsumptionForecastService
{
    protected $mlClient;

    public function __construct(MLClientService $mlClient)
    {
        $this->mlClient = $mlClient;
    }

    /**
     * Prévoir la consommation d'un article
     */
    public function forecast($articleId, $periods = 12)
    {
        // Récupérer l'historique des 24 derniers mois
        $historical = MouvementStock::where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->where('date_mouvement', '>=', now()->subMonths(24))
            ->selectRaw('DATE_FORMAT(date_mouvement, "%Y-%m") as month, SUM(quantite) as total')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->pluck('total')
            ->toArray();

        $result = $this->mlClient->call('/forecast', [
            'historical_demand' => $historical,
            'periods' => $periods,
        ]);

        return [
            'article_id' => $articleId,
            'historical' => $historical,
            'forecast' => $result['forecast'] ?? [],
            'generated_at' => now(),
        ];
    }

    /**
     * Prévoir pour tous les articles
     */
    public function forecastAll()
    {
        // À implémenter pour une exécution planifiée
        return ['status' => 'queued'];
    }
}