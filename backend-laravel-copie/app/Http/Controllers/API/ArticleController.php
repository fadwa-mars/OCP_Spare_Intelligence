<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    /**
     * Liste des articles
     */
    public function index(Request $request)
    {
        $query = Article::query();

        if ($request->has('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        if ($request->has('etat')) {
            $query->where('etat', $request->etat);
        }

        if ($request->has('search')) {
            $query->where('designation', 'like', '%' . $request->search . '%')
                  ->orWhere('code_sap', 'like', '%' . $request->search . '%');
        }

        $articles = $query->with('stock')->paginate(10000);

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }

    /**
     * Afficher un article
     */
    public function show($id)
    {
        $article = Article::with('stock')->find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    /**
     * Créer un article
     */
    public function store(Request $request)
    {
        $request->validate([
            'code_sap' => 'required|string|unique:articles',
            'designation' => 'required|string',
            'categorie' => 'nullable|string',
            'unite_mesure' => 'nullable|string',
            'seuil_min' => 'nullable|numeric',
            'seuil_securite' => 'nullable|numeric',
            'delai_approvisionnement' => 'nullable|integer',
        ]);

        DB::beginTransaction();

        try {
            $article = Article::create($request->all());

            Stock::create([
                'article_id' => $article->id,
                'stock_actuel' => 0,
                'stock_reserve' => 0,
                'stock_disponible' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Article créé avec succès',
                'data' => $article->load('stock')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un article
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        $request->validate([
            'code_sap' => 'sometimes|string|unique:articles,code_sap,' . $id,
            'designation' => 'sometimes|string',
            'categorie' => 'nullable|string',
            'unite_mesure' => 'nullable|string',
            'seuil_min' => 'nullable|numeric',
            'seuil_securite' => 'nullable|numeric',
            'delai_approvisionnement' => 'nullable|integer',
            'etat' => 'sometimes|in:actif,inactif,obsolète',
        ]);

        $article->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Article mis à jour',
            'data' => $article->load('stock')
        ]);
    }

    /**
     * Supprimer un article
     */
    public function destroy($id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article supprimé'
        ]);
    }

    /**
     * Catégories disponibles
     */
    public function categories()
    {
        $categories = Article::select('categorie')->distinct()->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}