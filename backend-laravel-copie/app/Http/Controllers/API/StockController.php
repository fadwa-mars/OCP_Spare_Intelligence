<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Article;
use App\Models\MouvementStock;
use App\Models\HistoriqueStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Liste des stocks
     */
    public function index(Request $request)
    {
        $query = Stock::with('article');

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        if ($request->has('stock_critique')) {
            $query->whereRaw('stock_actuel <= seuil_min');
        }

        $stocks = $query->paginate(10000);

        return response()->json([
            'success' => true,
            'data' => $stocks
        ]);
    }

    /**
     * Afficher un stock
     */
    public function show($id)
    {
        $stock = Stock::with('article')->find($id);

        if (!$stock) {
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $stock
        ]);
    }

    /**
     * Mouvement de stock (entrée/sortie)
     */
    public function movement(Request $request)
    {
        $request->validate([
            'article_id' => 'required|exists:articles,id',
            'type_mouvement' => 'required|in:entree,sortie,reservation,annulation',
            'quantite' => 'required|numeric|min:0.01',
            'commentaire' => 'nullable|string',
        ]);

        $stock = Stock::where('article_id', $request->article_id)->first();

        if (!$stock) {
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé pour cet article'
            ], 404);
        }

        DB::beginTransaction();

        try {
            $stock_avant = $stock->stock_actuel;

            switch ($request->type_mouvement) {
                case 'entree':
                    $stock->stock_actuel += $request->quantite;
                    break;
                case 'sortie':
                    if ($stock->stock_actuel < $request->quantite) {
                        throw new \Exception('Stock insuffisant');
                    }
                    $stock->stock_actuel -= $request->quantite;
                    break;
                case 'reservation':
                    if ($stock->stock_disponible < $request->quantite) {
                        throw new \Exception('Stock disponible insuffisant');
                    }
                    $stock->stock_reserve += $request->quantite;
                    $stock->stock_disponible -= $request->quantite;
                    break;
                case 'annulation':
                    if ($stock->stock_reserve < $request->quantite) {
                        throw new \Exception('Réservation insuffisante');
                    }
                    $stock->stock_reserve -= $request->quantite;
                    $stock->stock_disponible += $request->quantite;
                    break;
            }

            $stock->stock_disponible = $stock->stock_actuel - $stock->stock_reserve;
            $stock->date_dernier_mouvement = now();
            $stock->save();

            // Enregistrer le mouvement
            MouvementStock::create([
                'article_id' => $request->article_id,
                'user_id' => $request->user()->id,
                'type_mouvement' => $request->type_mouvement,
                'quantite' => $request->quantite,
                'commentaire' => $request->commentaire,
                'date_mouvement' => now(),
            ]);

            // Historique
            HistoriqueStock::create([
                'article_id' => $request->article_id,
                'stock_avant' => $stock_avant,
                'stock_apres' => $stock->stock_actuel,
                'quantite_change' => $request->quantite,
                'type_mouvement' => $request->type_mouvement,
                'date_mouvement' => now(),
                'user_id' => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mouvement effectué avec succès',
                'data' => $stock
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Stock par article
     */
    public function byArticle($articleId)
    {
        $stock = Stock::where('article_id', $articleId)->with('article')->first();

        if (!$stock) {
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $stock
        ]);
    }

    /**
     * Stock critique (seuil min dépassé)
     */
    public function critique()
    {
        $stocks = Stock::with('article')
            ->whereRaw('stock_actuel <= seuil_min')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stocks
        ]);
    }
}