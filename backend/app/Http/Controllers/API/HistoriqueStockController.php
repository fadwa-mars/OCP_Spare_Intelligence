<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HistoriqueStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistoriqueStockController extends Controller
{
    /**
     * Liste des historiques de stock
     */
    public function index(Request $request)
    {
        $query = HistoriqueStock::with(['article', 'user']);

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

        $historiques = $query->orderBy('date_mouvement', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $historiques
        ]);
    }

    /**
     * Afficher un historique
     */
    public function show($id)
    {
        $historique = HistoriqueStock::with(['article', 'user'])->find($id);

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
     * Historique par article
     */
    public function byArticle($articleId, Request $request)
    {
        $query = HistoriqueStock::where('article_id', $articleId);

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $historiques = $query->orderBy('date_mouvement', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $historiques
        ]);
    }

    /**
     * Évolution du stock pour un article (graphique)
     */
    public function evolution($articleId, Request $request)
    {
        $jours = $request->jours ?? 30;
        $dateDebut = now()->subDays($jours);

        $evolution = HistoriqueStock::where('article_id', $articleId)
            ->whereDate('date_mouvement', '>=', $dateDebut)
            ->select(
                DB::raw('DATE(date_mouvement) as date'),
                DB::raw('stock_apres as stock')
            )
            ->orderBy('date_mouvement', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $evolution
        ]);
    }

    /**
     * Statistiques des mouvements par période
     */
    public function stats(Request $request)
    {
        $period = $request->period ?? 'month'; // month, week, year
        $groupBy = 'month';

        switch ($period) {
            case 'week':
                $groupBy = 'week';
                break;
            case 'year':
                $groupBy = 'year';
                break;
            default:
                $groupBy = 'month';
        }

        $stats = HistoriqueStock::select(
            DB::raw("DATE_FORMAT(date_mouvement, '%Y-%m') as periode"),
            DB::raw('SUM(quantite_change) as total_mouvements'),
            DB::raw('COUNT(*) as nombre_mouvements')
        )
        ->groupBy('periode')
        ->orderBy('periode', 'desc')
        ->limit(12)
        ->get();

        $parType = HistoriqueStock::select('type_mouvement', DB::raw('SUM(quantite_change) as total'))
            ->whereDate('date_mouvement', '>=', now()->subDays(30))
            ->groupBy('type_mouvement')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'par_periode' => $stats,
                'par_type' => $parType
            ]
        ]);
    }

    /**
     * Export CSV de l'historique
     */
    public function export(Request $request)
    {
        $query = HistoriqueStock::with(['article', 'user']);

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('date_mouvement', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('date_mouvement', '<=', $request->date_fin);
        }

        $historiques = $query->orderBy('date_mouvement', 'desc')->get();

        $headers = [
            'article_id',
            'article_designation',
            'stock_avant',
            'stock_apres',
            'quantite_change',
            'type_mouvement',
            'date_mouvement',
            'user_name'
        ];

        $callback = function() use ($historiques, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($historiques as $historique) {
                fputcsv($file, [
                    $historique->article_id,
                    $historique->article->designation ?? '',
                    $historique->stock_avant,
                    $historique->stock_apres,
                    $historique->quantite_change,
                    $historique->type_mouvement,
                    $historique->date_mouvement,
                    $historique->user->name ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="historique_stocks.csv"',
        ]);
    }
}