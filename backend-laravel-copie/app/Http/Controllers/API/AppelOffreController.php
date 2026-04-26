<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AppelOffre;
use App\Models\Offre;
use App\Models\Commande;
use App\Models\LigneCommande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppelOffreController extends Controller
{
    /**
     * Liste des appels d'offres (filtré par rôle)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = AppelOffre::with(['demandeAchat', 'acheteur']);
        
        // Filtrage des AO pour les fournisseurs
        if ($user && $user->role === 'fournisseur') {
            // Les fournisseurs voient uniquement les AO publiés et non clôturés
            $query->where('statut', 'publie')
                  ->where('date_cloture', '>', now());
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $appels = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $appels
        ]);
    }

    /**
     * Afficher un appel d'offres (avec vérification d'accès)
     */
    public function show($id)
    {
        $user = auth()->user();
        
        // Charger l'AO avec les offres et leurs fournisseurs
        $appel = AppelOffre::with([
            'demandeAchat.article', 
            'acheteur', 
            'offres.fournisseur'
        ])->find($id);

        if (!$appel) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non trouvé'
            ], 404);
        }
        
        // Vérifier si le fournisseur a accès à cet AO
        if ($user && $user->role === 'fournisseur' && $appel->statut !== 'publie') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas accès à cet appel d\'offres'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $appel
        ]);
    }

    /**
     * Créer un appel d'offres (accessible uniquement aux acheteurs/admins)
     */
    public function store(Request $request)
    {
        $request->validate([
            'demande_achat_id' => 'required|exists:demande_achats,id',
            'date_cloture' => 'required|date|after:now',
            'objet' => 'required|string',
        ]);

        $appel = AppelOffre::create([
            'demande_achat_id' => $request->demande_achat_id,
            'acheteur_id' => $request->user()->id,
            'date_lancement' => now(),
            'date_cloture' => $request->date_cloture,
            'objet' => $request->objet,
            'statut' => 'publie',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appel d\'offres créé avec succès',
            'data' => $appel
        ], 201);
    }

    /**
     * Clôturer un appel d'offres
     */
    public function close($id)
    {
        $appel = AppelOffre::find($id);

        if (!$appel) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non trouvé'
            ], 404);
        }

        $appel->statut = 'cloture';
        $appel->save();

        return response()->json([
            'success' => true,
            'message' => 'Appel d\'offres clôturé',
            'data' => $appel
        ]);
    }

    /**
     * Sélectionner l'offre gagnante et créer la commande
     */
    public function selectWinner($id, Request $request)
    {
        $request->validate([
            'offre_id' => 'required|exists:offres,id',
        ]);

        $appel = AppelOffre::with('demandeAchat')->find($id);

        if (!$appel) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non trouvé'
            ], 404);
        }

        // Vérifier que l'appel d'offres est clôturé
        if ($appel->statut !== 'cloture') {
            return response()->json([
                'success' => false,
                'message' => 'L\'appel d\'offres doit être clôturé avant de sélectionner un gagnant'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Marquer l'offre comme lauréate
            Offre::where('appel_offre_id', $id)->update(['est_laureat' => false]);
            $offreGagnante = Offre::find($request->offre_id);
            $offreGagnante->est_laureat = true;
            $offreGagnante->statut = 'acceptee';
            $offreGagnante->save();

            // CRÉER LA COMMANDE
            $numero_bc = 'BC-' . date('Ymd') . '-' . rand(1000, 9999);
            
            $commande = Commande::create([
                'appel_offre_id' => $appel->id,
                'fournisseur_id' => $offreGagnante->fournisseur_id,
                'user_id' => auth()->id(),
                'numero_bc' => $numero_bc,
                'date_commande' => now(),
                'date_livraison_prevue' => now()->addDays($offreGagnante->delai_livraison),
                'statut' => 'confirmee',
                'montant_total' => $offreGagnante->montant_total,
                'conditions_paiement' => '30 jours',
            ]);

            // Créer la ligne de commande
            $demandeAchat = $appel->demandeAchat;
            
            LigneCommande::create([
                'commande_id' => $commande->id,
                'article_id' => $demandeAchat->article_id,
                'quantite' => $demandeAchat->quantite,
                'prix_unitaire' => $offreGagnante->prix_unitaire,
                'montant_ligne' => $offreGagnante->prix_unitaire * $demandeAchat->quantite,
            ]);

            $appel->statut = 'attribue';
            $appel->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Offre gagnante sélectionnée et commande créée',
                'data' => $appel,
                'commande_id' => $commande->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les AO disponibles pour les fournisseurs (endpoint spécifique)
     */
    public function availableForFournisseur()
    {
        $user = auth()->user();
        
        if ($user->role !== 'fournisseur') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $appels = AppelOffre::with(['demandeAchat.article'])
            ->where('statut', 'publie')
            ->where('date_cloture', '>', now())
            ->orderBy('date_cloture', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $appels
        ]);
    }
}