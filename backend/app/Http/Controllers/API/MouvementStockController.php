<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MouvementStock;
use Illuminate\Http\Request;

class MouvementStockController extends Controller
{
    /**
     * Liste des mouvements
     */
    public function index(Request $request)
    {
        $query = MouvementStock::with(['article', 'user']);

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        if ($request->has('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('date_mouvement', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('date_mouvement', '<=', $request->date_fin);
        }

        $mouvements = $query->orderBy('date_mouvement', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $mouvements
        ]);
    }

    /**
     * Afficher un mouvement
     */
    public function show($id)
    {
        $mouvement = MouvementStock::with(['article', 'user', 'commande'])->find($id);

        if (!$mouvement) {
            return response()->json([
                'success' => false,
                'message' => 'Mouvement non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $mouvement
        ]);
    }

    /**
     * Historique par article
     */
    public function byArticle($articleId, Request $request)
    {
        $query = MouvementStock::where('article_id', $articleId);

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $mouvements = $query->orderBy('date_mouvement', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $mouvements
        ]);
    }

    /**
     * Statistiques des mouvements
     */
    public function stats(Request $request)
    {
        $stats = [
            'total_entrees' => MouvementStock::where('type_mouvement', 'entree')
                ->whereDate('date_mouvement', '>=', now()->subDays(30))
                ->sum('quantite'),
            'total_sorties' => MouvementStock::where('type_mouvement', 'sortie')
                ->whereDate('date_mouvement', '>=', now()->subDays(30))
                ->sum('quantite'),
            'par_type' => MouvementStock::select('type_mouvement', MouvementStock::raw('SUM(quantite) as total'))
                ->groupBy('type_mouvement')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}