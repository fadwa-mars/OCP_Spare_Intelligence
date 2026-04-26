<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AppelOffre;
use App\Models\Offre;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OffreFournisseurController extends Controller
{
    public function store(Request $request, $appelOffreId)
    {
        $request->validate([
            'prix' => 'required|numeric|min:0',
            'delai_jours' => 'required|integer|min:1',
            'garantie' => 'required|integer|min:0|max:60',
            'frais_livraison' => 'nullable|numeric|min:0',
            'conditions_paiement' => 'nullable|string',
            'commentaires' => 'nullable|string',
        ]);
        
        $appelOffre = AppelOffre::with('demandeAchat')
            ->where('statut', 'publie')
            ->where('date_cloture', '>', now())
            ->find($appelOffreId);
            
        if (!$appelOffre) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non disponible'
            ], 404);
        }
        
        $fournisseur = Fournisseur::where('user_id', auth()->id())->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas enregistré comme fournisseur'
            ], 403);
        }
        
        $existing = Offre::where('appel_offre_id', $appelOffreId)
            ->where('fournisseur_id', $fournisseur->id)
            ->first();
            
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà soumis une offre'
            ], 400);
        }
        
        $quantite = $appelOffre->demandeAchat->quantite ?? 1;
        $frais_livraison = $request->frais_livraison ?? 0;
        $montant_total = ($request->prix * $quantite) + $frais_livraison;
        
        DB::beginTransaction();
        try {
            $offre = Offre::create([
                'appel_offre_id' => $appelOffreId,
                'fournisseur_id' => $fournisseur->id,
                'prix_unitaire' => $request->prix,
                'delai_livraison' => $request->delai_jours,
                'garantie' => $request->garantie,
                'frais_livraison' => $frais_livraison,
                'montant_total' => $montant_total,
                'date_soumission' => now(),
                'score_calcule' => null,
                'rang' => null,
                'est_laureat' => false,
                'statut' => 'soumise',
            ]);
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Offre soumise avec succès',
                'data' => $offre
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function myOffers()
    {
        $fournisseur = Fournisseur::where('user_id', auth()->id())->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }
        
        $offres = Offre::with('appelOffre.demandeAchat.article')
            ->where('fournisseur_id', $fournisseur->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $offres
        ]);
    }
    
    public function show($id)
    {
        $fournisseur = Fournisseur::where('user_id', auth()->id())->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }
        
        $offre = Offre::with('appelOffre.demandeAchat.article')
            ->where('fournisseur_id', $fournisseur->id)
            ->find($id);
            
        if (!$offre) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $offre
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $fournisseur = Fournisseur::where('user_id', auth()->id())->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }
        
        $offre = Offre::where('fournisseur_id', $fournisseur->id)
            ->where('est_laureat', false)
            ->find($id);
            
        if (!$offre) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée ou déjà traitée'
            ], 404);
        }
        
        $request->validate([
            'prix' => 'sometimes|numeric|min:0',
            'delai_jours' => 'sometimes|integer|min:1',
            'garantie' => 'sometimes|integer|min:0|max:60',
            'frais_livraison' => 'sometimes|numeric|min:0',
        ]);
        
        $updateData = [];
        $quantite = $offre->appelOffre->demandeAchat->quantite ?? 1;
        
        if ($request->has('prix')) {
            $updateData['prix_unitaire'] = $request->prix;
            $frais = $request->frais_livraison ?? $offre->frais_livraison;
            $updateData['montant_total'] = ($request->prix * $quantite) + $frais;
        }
        if ($request->has('delai_jours')) $updateData['delai_livraison'] = $request->delai_jours;
        if ($request->has('garantie')) $updateData['garantie'] = $request->garantie;
        if ($request->has('frais_livraison')) {
            $updateData['frais_livraison'] = $request->frais_livraison;
            $prix = $request->prix ?? $offre->prix_unitaire;
            $updateData['montant_total'] = ($prix * $quantite) + $request->frais_livraison;
        }
        
        $offre->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'Offre mise à jour',
            'data' => $offre
        ]);
    }
    
    public function destroy($id)
    {
        $fournisseur = Fournisseur::where('user_id', auth()->id())->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }
        
        $offre = Offre::where('fournisseur_id', $fournisseur->id)
            ->where('est_laureat', false)
            ->find($id);
            
        if (!$offre) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }
        
        $offre->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Offre supprimée'
        ]);
    }
}