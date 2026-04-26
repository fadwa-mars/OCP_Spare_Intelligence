<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\MouvementStock;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AIController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Vérifier l'état du service IA
     */
    public function health()
    {
        $isAvailable = $this->aiService->isAvailable();

        return response()->json([
            'success' => true,
            'data' => [
                'ai_service' => $isAvailable ? 'available' : 'unavailable',
                'timestamp' => now()
            ]
        ]);
    }

    /**
     * Prédire la consommation d'un article
     */
    public function predictConsumption(Request $request, $articleId)
    {
        $article = Article::find($articleId);
        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        // Récupérer l'historique des mouvements
        $historique = MouvementStock::where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->orderBy('date_mouvement', 'asc')
            ->get(['date_mouvement as date', 'quantite'])
            ->toArray();

        if (count($historique) < 10) {
            return response()->json([
                'success' => false,
                'message' => 'Pas assez de données historiques (minimum 10 points requis)'
            ], 400);
        }

        $periods = $request->input('periods', 30);
        $result = $this->aiService->predictConsumption($articleId, $historique, $periods);

        if (!$result || !$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Erreur lors de la prédiction'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article,
                'predictions' => $result['data']['predictions'],
                'periods' => $periods
            ]
        ]);
    }

    /**
     * Détecter des anomalies pour un article
     */
    public function detectAnomalies(Request $request, $articleId)
    {
        $article = Article::find($articleId);
        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        // Récupérer les données des 6 derniers mois
        $data = MouvementStock::where('article_id', $articleId)
            ->where('date_mouvement', '>=', now()->subMonths(6))
            ->orderBy('date_mouvement', 'asc')
            ->get(['date_mouvement as date', 'quantite', 'type_mouvement'])
            ->toArray();

        $result = $this->aiService->detectAnomalies($articleId, $data);

        if (!$result || !$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Erreur lors de la détection'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article,
                'anomalies' => $result['data']
            ]
        ]);
    }

    /**
     * Calculer le score de criticité pour tous les articles
     */
    public function calculateAllCriticalities()
    {
        $articles = Article::where('etat', 'actif')->get();
        $results = [];

        foreach ($articles as $article) {
            // Calculer la consommation mensuelle moyenne
            $consommationMensuelle = MouvementStock::where('article_id', $article->id)
                ->where('type_mouvement', 'sortie')
                ->where('date_mouvement', '>=', now()->subMonths(12))
                ->sum('quantite') / 12;

            $params = [
                'consommation_mensuelle' => $consommationMensuelle,
                'prix_unitaire' => $article->prix_moyen ?? 100,
                'delai_approvisionnement' => $article->delai_approvisionnement ?? 15,
                'stock_actuel' => $article->stock->quantite ?? 0,
                'seuil_min' => $article->seuil_min ?? 10,
            ];

            $result = $this->aiService->calculateCriticality($article->id, $params);

            if ($result && $result['success']) {
                $results[] = [
                    'article_id' => $article->id,
                    'article' => $article->designation,
                    'score' => $result['data']['score'],
                    'level' => $result['data']['level'],
                    'recommendation' => $result['data']['recommendation']
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Dashboard IA - Résumé des prédictions et alertes
     */
    public function dashboard()
    {
        $aiAvailable = $this->aiService->isAvailable();

        // Top 5 articles à risque (stock bas)
        $articlesRisque = Article::with('stock')
            ->whereHas('stock', function ($query) {
                $query->whereRaw('quantite <= seuil_min');
            })
            ->take(5)
            ->get(['id', 'designation', 'code_sap', 'seuil_min']);

        // Statistiques des articles avec score de criticité
        $articlesCritiques = Article::where('etat', 'actif')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'ai_available' => $aiAvailable,
                'articles_risque' => $articlesRisque,
                'total_articles_actifs' => $articlesCritiques,
                'timestamp' => now()
            ]
        ]);
    }
}