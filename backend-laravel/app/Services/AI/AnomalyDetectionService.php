<?php

namespace App\Services\AI;

use App\Models\MouvementStock;

class AnomalyDetectionService
{
    protected $mlClient;

    public function __construct(MLClientService $mlClient)
    {
        $this->mlClient = $mlClient;
    }

    /**
     * Détecter les anomalies de consommation
     */
    public function detectAnomalies($articleId)
    {
        // Récupérer les 12 derniers mois
        $consumption = MouvementStock::where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->where('date_mouvement', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(date_mouvement, "%Y-%m") as month, SUM(quantite) as total')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->pluck('total')
            ->toArray();

        $result = $this->mlClient->call('/anomaly', ['consumption' => $consumption]);

        return [
            'article_id' => $articleId,
            'is_anomaly' => $result['is_anomaly'] ?? false,
            'anomaly_score' => $result['score'] ?? 0,
            'anomaly_points' => $this->findAnomalyPoints($consumption),
        ];
    }

    /**
     * Identifier les points d'anomalie
     */
    private function findAnomalyPoints($data)
    {
        $mean = array_sum($data) / count($data);
        $std = sqrt(array_sum(array_map(function($x) use ($mean) {
            return pow($x - $mean, 2);
        }, $data)) / count($data));

        $anomalies = [];
        foreach ($data as $i => $value) {
            if (abs($value - $mean) > 2 * $std) {
                $anomalies[] = [
                    'index' => $i,
                    'value' => $value,
                    'expected' => round($mean, 2),
                ];
            }
        }

        return $anomalies;
    }
}