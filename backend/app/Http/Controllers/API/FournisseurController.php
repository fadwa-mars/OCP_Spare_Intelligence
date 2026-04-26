<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    /**
     * Liste des fournisseurs
     */
    public function index(Request $request)
    {
        $query = Fournisseur::query();

        if ($request->has('est_actif')) {
            $query->where('est_actif', $request->est_actif);
        }

        if ($request->has('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%')
                  ->orWhere('email_contact', 'like', '%' . $request->search . '%');
        }

        $fournisseurs = $query->orderBy('score_global', 'desc')->paginate(10000);

        return response()->json([
            'success' => true,
            'data' => $fournisseurs
        ]);
    }

    /**
     * Afficher un fournisseur
     */
    public function show($id)
    {
        $fournisseur = Fournisseur::with('commandes')->find($id);

        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Fournisseur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $fournisseur
        ]);
    }

    /**
     * Créer un fournisseur
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'email_contact' => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
        ]);

        $fournisseur = Fournisseur::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur créé avec succès',
            'data' => $fournisseur
        ], 201);
    }

    /**
     * Mettre à jour un fournisseur
     */
    public function update(Request $request, $id)
    {
        $fournisseur = Fournisseur::find($id);

        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Fournisseur non trouvé'
            ], 404);
        }

        $request->validate([
            'nom' => 'sometimes|string',
            'email_contact' => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'est_actif' => 'sometimes|boolean',
        ]);

        $fournisseur->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur mis à jour',
            'data' => $fournisseur
        ]);
    }

    /**
     * Supprimer un fournisseur
     */
    public function destroy($id)
    {
        $fournisseur = Fournisseur::find($id);

        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Fournisseur non trouvé'
            ], 404);
        }

        $fournisseur->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur supprimé'
        ]);
    }

    /**
     * Évaluer un fournisseur
     */
    public function evaluate($id)
    {
        $fournisseur = Fournisseur::find($id);

        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Fournisseur non trouvé'
            ], 404);
        }

        // Calcul du score global
        $score = ($fournisseur->taux_conformite * 0.6) + 
                 (max(0, 100 - ($fournisseur->delai_moyen_livraison / 30 * 100)) * 0.4);

        $fournisseur->score_global = round($score, 2);
        $fournisseur->date_derniere_evaluation = now();
        $fournisseur->save();

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur évalué avec succès',
            'data' => $fournisseur
        ]);
    }
}