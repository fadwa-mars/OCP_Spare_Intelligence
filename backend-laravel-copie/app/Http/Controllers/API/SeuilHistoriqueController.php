<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SeuilHistorique;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeuilHistoriqueController extends Controller
{
    /**
     * Liste des historiques de seuils
     */
    public function index(Request $request)
    {
        $query = SeuilHistorique::with(['article', 'modifiePar']);

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $historiques = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $historiques
        ]);
    }

    /**
     * Afficher un historique de seuil
     */
    public function show($id)
    {
        $historique = SeuilHistorique::with(['article', 'modifiePar'])->find($id);

        if (!$historique) {
            return response()->json([
                'success' => false,
                'message' => 'Historique non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $historique
        ]);
    }

    /**
     * Historique des modifications pour un article
     */
    public function byArticle($articleId)
    {
        $article = Article::find($articleId);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        $historiques = SeuilHistorique::where('article_id', $articleId)
            ->with('modifiePar')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article,
                'seuil_actuel_min' => $article->seuil_min,
                'seuil_actuel_securite' => $article->seuil_securite,
                'historique' => $historiques
            ]
        ]);
    }

    /**
     * Enregistrer une modification de seuil (appelé automatiquement)
     */
    public function store(Request $request)
    {
        $request->validate([
            'article_id' => 'required|exists:articles,id',
            'ancien_seuil_min' => 'required|numeric',
            'nouveau_seuil_min' => 'required|numeric',
            'ancien_seuil_securite' => 'required|numeric',
            'nouveau_seuil_securite' => 'required|numeric',
            'raison_modification' => 'nullable|string',
        ]);

        $historique = SeuilHistorique::create([
            'article_id' => $request->article_id,
            'ancien_seuil_min' => $request->ancien_seuil_min,
            'nouveau_seuil_min' => $request->nouveau_seuil_min,
            'ancien_seuil_securite' => $request->ancien_seuil_securite,
            'nouveau_seuil_securite' => $request->nouveau_seuil_securite,
            'raison_modification' => $request->raison_modification,
            'modifie_par' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modification enregistrée',
            'data' => $historique
        ], 201);
    }

    /**
     * Statistiques des modifications
     */
    public function stats()
    {
        $stats = [
            'total_modifications' => SeuilHistorique::count(),
            'modifications_30_jours' => SeuilHistorique::whereDate('created_at', '>=', now()->subDays(30))->count(),
            'articles_les_plus_modifies' => SeuilHistorique::select('article_id', DB::raw('COUNT(*) as total'))
                ->with('article')
                ->groupBy('article_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
            'modifications_par_mois' => SeuilHistorique::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois', 'desc')
            ->limit(12)
            ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Comparer les seuils actuels avec les historiques
     */
    public function compare($articleId)
    {
        $article = Article::find($articleId);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        $dernierHistorique = SeuilHistorique::where('article_id', $articleId)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'seuils_actuels' => [
                    'seuil_min' => $article->seuil_min,
                    'seuil_securite' => $article->seuil_securite
                ],
                'derniers_seuils_modifies' => $dernierHistorique ? [
                    'seuil_min' => $dernierHistorique->nouveau_seuil_min,
                    'seuil_securite' => $dernierHistorique->nouveau_seuil_securite,
                    'date' => $dernierHistorique->created_at,
                    'raison' => $dernierHistorique->raison_modification
                ] : null
            ]
        ]);
    }
}