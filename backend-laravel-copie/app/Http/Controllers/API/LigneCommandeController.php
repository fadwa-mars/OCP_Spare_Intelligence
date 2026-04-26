<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LigneCommande;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LigneCommandeController extends Controller
{
    /**
     * Liste des lignes de commande
     */
    public function index(Request $request)
    {
        $query = LigneCommande::with(['commande', 'article', 'offre']);

        if ($request->has('commande_id')) {
            $query->where('commande_id', $request->commande_id);
        }

        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        $lignes = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $lignes
        ]);
    }

    /**
     * Afficher une ligne de commande
     */
    public function show($id)
    {
        $ligne = LigneCommande::with(['commande', 'article', 'offre'])->find($id);

        if (!$ligne) {
            return response()->json([
                'success' => false,
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ligne
        ]);
    }

    /**
     * Ajouter une ligne à une commande
     */
    public function store(Request $request)
    {
        $request->validate([
            'commande_id' => 'required|exists:commandes,id',
            'article_id' => 'required|exists:articles,id',
            'quantite' => 'required|numeric|min:0.01',
            'prix_unitaire' => 'required|numeric|min:0',
        ]);

        $commande = Commande::find($request->commande_id);

        if ($commande->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'ajouter des lignes à une commande déjà confirmée'
            ], 400);
        }

        $montant_ligne = $request->quantite * $request->prix_unitaire;

        DB::beginTransaction();

        try {
            $ligne = LigneCommande::create([
                'commande_id' => $request->commande_id,
                'article_id' => $request->article_id,
                'quantite' => $request->quantite,
                'prix_unitaire' => $request->prix_unitaire,
                'montant_ligne' => $montant_ligne,
            ]);

            // Mettre à jour le montant total de la commande
            $commande->montant_total += $montant_ligne;
            $commande->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ligne ajoutée avec succès',
                'data' => $ligne->load(['commande', 'article'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une ligne de commande
     */
    public function update(Request $request, $id)
    {
        $ligne = LigneCommande::find($id);

        if (!$ligne) {
            return response()->json([
                'success' => false,
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        $commande = $ligne->commande;

        if ($commande->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier une commande déjà confirmée'
            ], 400);
        }

        $request->validate([
            'quantite' => 'sometimes|numeric|min:0.01',
            'prix_unitaire' => 'sometimes|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Recalculer l'ancien montant
            $ancienMontant = $ligne->montant_ligne;

            if ($request->has('quantite')) {
                $ligne->quantite = $request->quantite;
            }

            if ($request->has('prix_unitaire')) {
                $ligne->prix_unitaire = $request->prix_unitaire;
            }

            $ligne->montant_ligne = $ligne->quantite * $ligne->prix_unitaire;
            $ligne->save();

            // Mettre à jour le montant total de la commande
            $commande->montant_total = $commande->montant_total - $ancienMontant + $ligne->montant_ligne;
            $commande->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ligne mise à jour',
                'data' => $ligne
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Supprimer une ligne de commande
     */
    public function destroy($id)
    {
        $ligne = LigneCommande::find($id);

        if (!$ligne) {
            return response()->json([
                'success' => false,
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        $commande = $ligne->commande;

        if ($commande->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une ligne d\'une commande déjà confirmée'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Mettre à jour le montant total de la commande
            $commande->montant_total -= $ligne->montant_ligne;
            $commande->save();

            $ligne->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ligne supprimée'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Lignes par commande
     */
    public function byCommande($commandeId)
    {
        $lignes = LigneCommande::where('commande_id', $commandeId)
            ->with(['article', 'offre'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $lignes
        ]);
    }

    /**
     * Récapitulatif d'une commande
     */
    public function recap($commandeId)
    {
        $commande = Commande::with(['fournisseur', 'user'])->find($commandeId);

        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }

        $lignes = LigneCommande::where('commande_id', $commandeId)
            ->with('article')
            ->get();

        $recap = [
            'commande' => $commande,
            'lignes' => $lignes,
            'total_articles' => $lignes->sum('quantite'),
            'sous_total' => $commande->montant_total,
            'tva' => $commande->montant_total * 0.2,
            'total_ttc' => $commande->montant_total * 1.2,
        ];

        return response()->json([
            'success' => true,
            'data' => $recap
        ]);
    }
}