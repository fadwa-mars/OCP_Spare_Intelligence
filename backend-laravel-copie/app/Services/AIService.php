<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $baseUrl;
    protected $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.ai.url', 'http://localhost:8001');
        $this->timeout = config('services.ai.timeout', 30);
    }

    /**
     * Vérifier si le service IA est disponible
     */
    public function isAvailable(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/health');
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('AI Service unavailable: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Prédire la consommation future d'un article
     */
    public function predictConsumption(int $articleId, array $historique, int $periods = 30): ?array
    {
        try {
            $response = Http::timeout($this->timeout)->post($this->baseUrl . '/predict/consumption', [
                'article_id' => $articleId,
                'historique' => $historique,
                'periods' => $periods,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('AI Prediction failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('AI Prediction error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Détecter des anomalies dans les données
     */
    public function detectAnomalies(int $articleId, array $data): ?array
    {
        try {
            $response = Http::timeout($this->timeout)->post($this->baseUrl . '/detect/anomalies', [
                'article_id' => $articleId,
                'data' => $data,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('AI Anomaly detection error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculer le score de criticité d'un article
     */
    public function calculateCriticality(int $articleId, array $params): ?array
    {
        try {
            $response = Http::timeout($this->timeout)->post($this->baseUrl . '/criticality/score', [
                'article_id' => $articleId,
                'consommation_mensuelle' => $params['consommation_mensuelle'],
                'prix_unitaire' => $params['prix_unitaire'],
                'delai_approvisionnement' => $params['delai_approvisionnement'],
                'stock_actuel' => $params['stock_actuel'],
                'seuil_min' => $params['seuil_min'],
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('AI Criticality calculation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculer les scores pour plusieurs articles
     */
    public function batchCriticality(array $articles): ?array
    {
        try {
            $response = Http::timeout($this->timeout)->post($this->baseUrl . '/batch/criticality', $articles);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('AI Batch criticality error: ' . $e->getMessage());
            return null;
        }
    }
}