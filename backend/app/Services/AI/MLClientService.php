<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MLClientService
{
    protected $baseUrl;
    protected $enabled;

    public function __construct()
    {
        $this->baseUrl = config('ml.api_url', 'http://localhost:8001');
        $this->enabled = config('ml.enabled', false);
    }

    /**
     * Appeler le microservice ML
     */
    public function call($endpoint, $data, $method = 'POST')
    {
        if (!$this->enabled) {
            return $this->mockResponse($endpoint, $data);
        }

        try {
            $response = Http::timeout(30)->$method($this->baseUrl . $endpoint, $data);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::warning('ML API call failed', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
            ]);
            
            return $this->mockResponse($endpoint, $data);
        } catch (\Exception $e) {
            Log::error('ML API error', ['error' => $e->getMessage()]);
            return $this->mockResponse($endpoint, $data);
        }
    }

    /**
     * Réponse mockée pour développement
     */
    private function mockResponse($endpoint, $data)
    {
        switch ($endpoint) {
            case '/forecast':
                return [
                    'success' => true,
                    'forecast' => $this->mockForecast($data),
                ];
            case '/criticality':
                return [
                    'success' => true,
                    'score' => rand(0, 100),
                    'level' => ['low', 'medium', 'high'][rand(0, 2)],
                ];
            case '/anomaly':
                return [
                    'success' => true,
                    'is_anomaly' => rand(0, 10) > 8,
                    'score' => rand(0, 100),
                ];
            case '/eoq':
                return [
                    'success' => true,
                    'eoq' => rand(50, 500),
                    'total_cost' => rand(1000, 10000),
                ];
            default:
                return ['success' => false, 'message' => 'Unknown endpoint'];
        }
    }

    /**
     * Mock de prévision
     */
    private function mockForecast($data)
    {
        $demand = $data['historical_demand'] ?? [];
        if (empty($demand)) {
            return array_fill(0, 12, rand(50, 200));
        }
        
        $avg = array_sum($demand) / count($demand);
        return array_map(function() use ($avg) {
            return round($avg * (0.8 + (rand(0, 40) / 100)));
        }, range(1, 12));
    }

    /**
     * Vérifier si le service ML est disponible
     */
    public function isAvailable()
    {
        if (!$this->enabled) return false;
        
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/health');
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}