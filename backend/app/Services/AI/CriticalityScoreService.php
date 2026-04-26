<?php

namespace App\Services\AI;

use App\Models\Article;

class CriticalityScoreService
{
    protected $mlClient;

    public function __construct(MLClientService $mlClient)
    {
        $this->mlClient = $mlClient;
    }

    /**
     * Calculer le score de criticité
     */
    public function calculateScore($articleId)
    {
        $article = Article::with('stock')->find($articleId);
        
        if (!$article) {
            return null;
        }

        // Préparer les features
        $features = [
            'stock_actuel' => $article->stock->stock_actuel ?? 0,
            'seuil_min' => $article->seuil_min,
            'delai_approvisionnement' => $article->delai_approvisionnement,
            'valeur_unitaire' => 100, // À récupérer du prix
            'consommation_annuelle' => $this->getAnnualConsumption($articleId),
        ];

        $result = $this->mlClient->call('/criticality', ['features' => $features]);

        return [
            'article_id' => $articleId,
            'score' => $result['score'] ?? 50,
            'level' => $result['level'] ?? 'medium',
            'recommendation' => $this->getRecommendation($result['level'] ?? 'medium'),
        ];
    }

    /**
     * Consommation annuelle
     */
    private function getAnnualConsumption($articleId)
    {
        return \DB::table('mouvement_stocks')
            ->where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->whereYear('date_mouvement', date('Y'))
            ->sum('quantite');
    }

    /**
     * Recommandation basée sur le niveau
     */
    private function getRecommendation($level)
    {
        switch ($level) {
            case 'high':
                return 'Stock de sécurité renforcé, suivi quotidien';
            case 'medium':
                return 'Stock de sécurité standard, suivi hebdomadaire';
            default:
                return 'Gestion simplifiée';
        }
    }
}