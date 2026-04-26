<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\MouvementStock;
use App\Models\Alerte;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Commande::with(['fournisseur', 'user']);

        if ($user && $user->role === 'fournisseur') {
            $fournisseur = Fournisseur::where('user_id', $user->id)->first();
            if ($fournisseur) {
                $query->where('fournisseur_id', $fournisseur->id);
            } else {
                return response()->json(['success' => true, 'data' => []]);
            }
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('fournisseur_id')) {
            $query->where('fournisseur_id', $request->fournisseur_id);
        }

        $commandes = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $commandes
        ]);
    }

    public function show($id)
{
    $user = auth()->user();
    
    // Charger la commande avec TOUTES les relations nécessaires
    $commande = Commande::with([
        'fournisseur', 
        'user', 
        'ligneCommandes.article'  // ← S'assurer que cette relation est chargée
    ])->find($id);

    if (!$commande) {
        return response()->json([
            'success' => false,
            'message' => 'Commande non trouvée'
        ], 404);
    }

    if ($user && $user->role === 'fournisseur') {
        $fournisseur = Fournisseur::where('user_id', $user->id)->first();
        if (!$fournisseur || $commande->fournisseur_id != $fournisseur->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas accès à cette commande'
            ], 403);
        }
    }

    return response()->json([
        'success' => true,
        'data' => $commande
    ]);
}

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role === 'fournisseur') {
            return response()->json([
                'success' => false,
                'message' => 'Les fournisseurs ne peuvent pas créer de commandes'
            ], 403);
        }

        $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_livraison_prevue' => 'required|date',
            'lignes' => 'required|array',
            'lignes.*.article_id' => 'required|exists:articles,id',
            'lignes.*.quantite' => 'required|numeric|min:0.01',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $numero_bc = 'BC-' . date('Ymd') . '-' . rand(1000, 9999);

            $commande = Commande::create([
                'fournisseur_id' => $request->fournisseur_id,
                'user_id' => $request->user()->id,
                'numero_bc' => $numero_bc,
                'date_commande' => now(),
                'date_livraison_prevue' => $request->date_livraison_prevue,
                'statut' => 'confirmee',
                'montant_total' => 0,
            ]);

            $montant_total = 0;

            foreach ($request->lignes as $ligne) {
                $montant_ligne = $ligne['quantite'] * $ligne['prix_unitaire'];
                $montant_total += $montant_ligne;

                LigneCommande::create([
                    'commande_id' => $commande->id,
                    'article_id' => $ligne['article_id'],
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                    'montant_ligne' => $montant_ligne,
                ]);
            }

            $commande->montant_total = $montant_total;
            $commande->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => $commande->load('ligneCommandes')
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

    public function receive($id, Request $request)
    {
        $user = auth()->user();
        
        if ($user->role === 'fournisseur') {
            return response()->json([
                'success' => false,
                'message' => 'Les fournisseurs ne peuvent pas réceptionner des commandes'
            ], 403);
        }
        
        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }

        DB::beginTransaction();

        try {
            $commande->date_livraison_reelle = now();
            $commande->statut = 'recue';
            $commande->save();

            foreach ($commande->ligneCommandes as $ligne) {
                MouvementStock::create([
                    'article_id' => $ligne->article_id,
                    'user_id' => $request->user()->id,
                    'commande_id' => $commande->id,
                    'type_mouvement' => 'entree',
                    'quantite' => $ligne->quantite,
                    'date_mouvement' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande réceptionnée avec succès',
                'data' => $commande
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la réception'
            ], 500);
        }
    }

    public function cancel($id)
    {
        $user = auth()->user();
        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        if ($user->role === 'fournisseur') {
            $fournisseur = Fournisseur::where('user_id', $user->id)->first();
            if (!$fournisseur || $commande->fournisseur_id != $fournisseur->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas annuler cette commande'
                ], 403);
            }
            
            if ($commande->statut === 'recue') {
                return response()->json([
                    'success' => false,
                    'message' => 'Une commande déjà reçue ne peut pas être annulée'
                ], 400);
            }
        }

        if ($commande->statut === 'recue') {
            return response()->json([
                'success' => false,
                'message' => 'Une commande déjà reçue ne peut pas être annulée'
            ], 400);
        }

        $commande->statut = 'annulee';
        $commande->save();

        return response()->json([
            'success' => true,
            'message' => 'Commande annulée',
            'data' => $commande
        ]);
    }
    
    public function getFournisseurCommandes()
    {
        $user = auth()->user();
        
        if ($user->role !== 'fournisseur') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $fournisseur = Fournisseur::where('user_id', $user->id)->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }
        
        $commandes = Commande::with(['ligneCommandes.article', 'offre.appelOffre'])
            ->where('fournisseur_id', $fournisseur->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $commandes
        ]);
    }
    
    public function confirm($id)
    {
        $user = auth()->user();
        
        $fournisseur = Fournisseur::where('user_id', $user->id)->first();
        
        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Fournisseur non trouvé'
            ], 404);
        }
        
        $commande = Commande::where('fournisseur_id', $fournisseur->id)
            ->where('statut', 'confirmee')
            ->find($id);
            
        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée ou ne peut pas être confirmée'
            ], 404);
        }
        
        $commande->statut = 'expediee';  // ← CHANGÉ : 'en_cours_livraison' → 'expediee'
        $commande->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Commande confirmée avec succès',
            'data' => $commande
        ]);
    }
}