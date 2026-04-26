<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DemandeAchat;
use App\Models\AppelOffre;
use App\Models\Commande;
use App\Models\RegleMarchePublic;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DemandeAchatController extends Controller
{
    /**
     * Liste des demandes d'achat
     */
    public function index(Request $request)
    {
        $query = DemandeAchat::with(['article', 'user', 'appelOffre', 'commande']);

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('urgence')) {
            $query->where('urgence', $request->urgence);
        }

        $demandes = $query->orderBy('date_besoin', 'asc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $demandes
        ]);
    }

    /**
     * Afficher une demande
     */
    public function show($id)
    {
        $demande = DemandeAchat::with(['article', 'user', 'appelOffre', 'commande'])->find($id);

        if (!$demande) {
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $demande
        ]);
    }

    /**
     * Créer une demande
     */
    public function store(Request $request)
    {
        $request->validate([
            'article_id' => 'required|exists:articles,id',
            'quantite' => 'required|numeric|min:0.01',
            'date_besoin' => 'required|date',
            'urgence' => 'required|in:basse,moyenne,haute,critique',
        ]);

        $demande = DemandeAchat::create([
            'article_id' => $request->article_id,
            'user_id' => $request->user()->id,
            'quantite' => $request->quantite,
            'date_demande' => now(),
            'date_besoin' => $request->date_besoin,
            'urgence' => $request->urgence,
            'statut' => 'brouillon',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande créée avec succès',
            'data' => $demande
        ], 201);
    }

    /**
     * Soumettre une demande
     */
    public function submit($id)
    {
        $demande = DemandeAchat::find($id);

        if (!$demande) {
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        }

        if ($demande->statut !== 'brouillon') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les demandes en brouillon peuvent être soumises'
            ], 400);
        }

        $demande->statut = 'soumise';
        $demande->save();

        return response()->json([
            'success' => true,
            'message' => 'Demande soumise avec succès',
            'data' => $demande
        ]);
    }

    /**
     * Approuver une demande
     */
    public function approve($id)
    {
        $demande = DemandeAchat::with('article')->find($id);

        if (!$demande) {
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        }

        if ($demande->statut !== 'soumise') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les demandes soumises peuvent être approuvées'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $demande->statut = 'approuvee';
            $demande->save();

            $regle = RegleMarchePublic::first();
            $prixMoyen = 100;
            $montantEstime = $demande->quantite * $prixMoyen;
            $seuilAppelOffres = $regle ? $regle->seuil_appel_offres : 50000;

            $response = [
                'success' => true,
                'message' => 'Demande approuvée',
                'data' => $demande
            ];

            if ($montantEstime >= $seuilAppelOffres) {
                $delaiReponse = $regle ? $regle->delai_min_reponse : 7;

                $appelOffre = AppelOffre::create([
                    'demande_achat_id' => $demande->id,
                    'acheteur_id' => auth()->id(),
                    'date_lancement' => now(),
                    'date_cloture' => now()->addDays($delaiReponse),
                    'objet' => 'Appel d\'offres pour ' . $demande->article->designation,
                    'statut' => 'publie',
                ]);

                $response['appel_offre_cree'] = true;
                $response['appel_offre_id'] = $appelOffre->id;
                $response['message'] = 'Demande approuvée. Un appel d\'offres a été créé automatiquement.';

            } else {
                $meilleurFournisseur = Fournisseur::where('est_actif', true)
                    ->orderBy('score_global', 'desc')
                    ->first();

                if ($meilleurFournisseur) {
                    $numeroBc = 'BC-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                    $commande = Commande::create([
                        'demande_achat_id' => $demande->id,
                        'fournisseur_id' => $meilleurFournisseur->id,
                        'user_id' => auth()->id(),
                        'numero_bc' => $numeroBc,
                        'date_commande' => now(),
                        'date_livraison_prevue' => now()->addDays(15),
                        'statut' => 'confirmee',
                        'montant_total' => $montantEstime,
                        'conditions_paiement' => '30 jours',
                    ]);

                    $response['commande_cree'] = true;
                    $response['commande_id'] = $commande->id;
                    $response['message'] = 'Demande approuvée. Une commande a été créée automatiquement.';
                } else {
                    $response['message'] = 'Demande approuvée. Aucun fournisseur disponible.';
                }
            }

            DB::commit();
            return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejeter une demande
     */
    public function reject($id, Request $request)
    {
        $demande = DemandeAchat::find($id);

        if (!$demande) {
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        }

        $demande->statut = 'rejetee';
        $demande->save();

        return response()->json([
            'success' => true,
            'message' => 'Demande rejetée',
            'data' => $demande
        ]);
    }
}