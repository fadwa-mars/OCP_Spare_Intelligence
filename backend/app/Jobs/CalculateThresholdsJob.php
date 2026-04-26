<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\Inventory\MinMaxThresholdService;
use App\Services\Alert\AlertService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CalculateThresholdsJob implements ShouldQueue
{
    use Queueable;

    protected $articleId;
    protected $userId;

    public function __construct($articleId = null, $userId = null)
    {
        $this->articleId = $articleId;
        $this->userId = $userId;
    }

    public function handle(MinMaxThresholdService $thresholdService, AlertService $alertService)
    {
        if ($this->articleId) {
            // Traiter un seul article
            $this->processArticle($this->articleId, $thresholdService, $alertService);
        } else {
            // Traiter tous les articles
            $articles = Article::all();
            foreach ($articles as $article) {
                $this->processArticle($article->id, $thresholdService, $alertService);
            }
        }
        
        Log::info('Calcul des seuils terminé', ['article_id' => $this->articleId ?? 'all']);
    }

    private function processArticle($articleId, $thresholdService, $alertService)
    {
        $article = Article::find($articleId);
        if (!$article) return;
        
        $optimal = $thresholdService->calculateOptimalThresholds($articleId);
        
        $ancienSeuilMin = $article->seuil_min;
        $ancienSeuilSecurite = $article->seuil_securite;
        
        if ($optimal['seuil_min'] != $ancienSeuilMin || $optimal['seuil_securite'] != $ancienSeuilSecurite) {
            $thresholdService->updateThresholds(
                $articleId,
                $optimal['seuil_min'],
                $optimal['seuil_securite'],
                $this->userId ?? 1,
                'Optimisation automatique'
            );
            
            Log::info('Seuils mis à jour', [
                'article_id' => $articleId,
                'ancien_min' => $ancienSeuilMin,
                'nouveau_min' => $optimal['seuil_min'],
            ]);
        }
    }
}