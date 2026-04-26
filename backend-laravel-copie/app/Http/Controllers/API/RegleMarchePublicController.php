<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RegleMarchePublic;
use Illuminate\Http\Request;

class RegleMarchePublicController extends Controller
{
    /**
     * Liste des règles
     */
    public function index()
    {
        $regles = RegleMarchePublic::all();

        return response()->json([
            'success' => true,
            'data' => $regles
        ]);
    }

    /**
     * Afficher une règle
     */
    public function show($id)
    {
        $regle = RegleMarchePublic::find($id);

        if (!$regle) {
            return response()->json([
                'success' => false,
                'message' => 'Règle non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $regle
        ]);
    }

    /**
     * Créer une règle
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:regle_marche_publics',
            'libelle' => 'required|string',
            'nb_min_fournisseurs' => 'nullable|integer',
            'delai_min_reponse' => 'nullable|integer',
            'seuil_appel_offres' => 'nullable|numeric',
            'ponderation_prix' => 'nullable|numeric',
            'ponderation_delai' => 'nullable|numeric',
            'ponderation_qualite' => 'nullable|numeric',
        ]);

        $regle = RegleMarchePublic::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Règle créée avec succès',
            'data' => $regle
        ], 201);
    }

    /**
     * Mettre à jour une règle
     */
    public function update(Request $request, $id)
    {
        $regle = RegleMarchePublic::find($id);

        if (!$regle) {
            return response()->json([
                'success' => false,
                'message' => 'Règle non trouvée'
            ], 404);
        }

        $request->validate([
            'code' => 'sometimes|string|unique:regle_marche_publics,code,' . $id,
            'libelle' => 'sometimes|string',
            'nb_min_fournisseurs' => 'nullable|integer',
            'delai_min_reponse' => 'nullable|integer',
            'seuil_appel_offres' => 'nullable|numeric',
            'ponderation_prix' => 'nullable|numeric',
            'ponderation_delai' => 'nullable|numeric',
            'ponderation_qualite' => 'nullable|numeric',
        ]);

        $regle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Règle mise à jour',
            'data' => $regle
        ]);
    }

    /**
     * Supprimer une règle
     */
    public function destroy($id)
    {
        $regle = RegleMarchePublic::find($id);

        if (!$regle) {
            return response()->json([
                'success' => false,
                'message' => 'Règle non trouvée'
            ], 404);
        }

        $regle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Règle supprimée'
        ]);
    }

    /**
     * Règle active par défaut
     */
    public function getActive()
    {
        $regle = RegleMarchePublic::first();

        return response()->json([
            'success' => true,
            'data' => $regle
        ]);
    }
}