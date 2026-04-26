<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Offre;
use App\Models\AppelOffre;
use App\Models\Fournisseur;
use App\Models\RegleMarchePublic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OffreController extends Controller
{
    /**
     * Liste des offres
     */
    public function index(Request $request)
    {
        $query = Offre::with(['appelOffre', 'fournisseur']);

        if ($request->has('appel_offre_id')) {
            $query->where('appel_offre_id', $request->appel_offre_id);
        }

        if ($request->has('fournisseur_id')) {
            $query->where('fournisseur_id', $request->fournisseur_id);
        }

        if ($request->has('est_laureat')) {
            $query->where('est_laureat', $request->est_laureat);
        }

        $offres = $query->orderBy('score_calcule', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $offres
        ]);
    }

    /**
     * Afficher une offre
     */
    public function show($id)
    {
        $offre = Offre::with(['appelOffre.demandeAchat.article', 'fournisseur'])->find($id);

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

    /**
     * Soumettre une offre pour un appel d'offres
     */
    public function store(Request $request)
    {
        $request->validate([
            'appel_offre_id' => 'required|exists:appel_offres,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'delai_livraison' => 'required|integer|min:1',
            'garantie' => 'nullable|integer',
            'frais_livraison' => 'nullable|numeric|min:0',
        ]);

        $appelOffre = AppelOffre::find($request->appel_offre_id);

        if ($appelOffre->statut !== 'publie') {
            return response()->json([
                'success' => false,
                'message' => 'Cet appel d\'offres n\'est pas ouvert aux soumissions'
            ], 400);
        }

        if (now() > $appelOffre->date_cloture) {
            return response()->json([
                'success' => false,
                'message' => 'La date de clôture est dépassée'
            ], 400);
        }

        $fournisseur = Fournisseur::where('user_id', $request->user()->id)->first();

        if (!$fournisseur) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas enregistré comme fournisseur'
            ], 403);
        }

        $montant_total = ($request->prix_unitaire * $appelOffre->demandeAchat->quantite) + ($request->frais_livraison ?? 0);

        $offre = Offre::create([
            'appel_offre_id' => $request->appel_offre_id,
            'fournisseur_id' => $fournisseur->id,
            'prix_unitaire' => $request->prix_unitaire,
            'delai_livraison' => $request->delai_livraison,
            'garantie' => $request->garantie,
            'frais_livraison' => $request->frais_livraison ?? 0,
            'montant_total' => $montant_total,
            'date_soumission' => now(),
            'statut' => 'soumise',
        ]);

        // Calculer le score de l'offre
        $this->calculateScore($offre);

        return response()->json([
            'success' => true,
            'message' => 'Offre soumise avec succès',
            'data' => $offre
        ], 201);
    }

    /**
     * Évaluer et noter les offres d'un appel d'offres
     */
    public function evaluate($appelOffreId)
    {
        $appelOffre = AppelOffre::with('offres')->find($appelOffreId);

        if (!$appelOffre) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non trouvé'
            ], 404);
        }

        $regle = RegleMarchePublic::first();

        if (!$regle) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune règle de marché public configurée'
            ], 400);
        }

        foreach ($appelOffre->offres as $offre) {
            $this->calculateScore($offre, $regle);
        }

        // Classer les offres par score
        $offres = $appelOffre->offres()->orderBy('score_calcule', 'desc')->get();

        $rang = 1;
        foreach ($offres as $offre) {
            $offre->rang = $rang;
            $offre->save();
            $rang++;
        }

        return response()->json([
            'success' => true,
            'message' => 'Offres évaluées avec succès',
            'data' => $offres
        ]);
    }

    /**
     * Calculer le score d'une offre
     */
    private function calculateScore($offre, $regle = null)
    {
        if (!$regle) {
            $regle = RegleMarchePublic::first();
        }

        if (!$regle) {
            return;
        }

        // Récupérer toutes les offres du même appel d'offres
        $autresOffres = Offre::where('appel_offre_id', $offre->appel_offre_id)
            ->where('id', '!=', $offre->id)
            ->get();

        // Score Prix (plus le prix est bas, plus le score est élevé)
        $prixMin = $autresOffres->min('prix_unitaire') ?? $offre->prix_unitaire;
        $scorePrix = ($prixMin / $offre->prix_unitaire) * $regle->ponderation_prix;

        // Score Délai (plus le délai est court, plus le score est élevé)
        $delaiMin = $autresOffres->min('delai_livraison') ?? $offre->delai_livraison;
        $scoreDelai = ($delaiMin / $offre->delai_livraison) * $regle->ponderation_delai;

        // Score Qualité (basé sur le score global du fournisseur)
        $scoreQualite = ($offre->fournisseur->score_global / 100) * $regle->ponderation_qualite;

        // Score total
        $scoreTotal = $scorePrix + $scoreDelai + $scoreQualite;

        $offre->score_calcule = round($scoreTotal, 2);
        $offre->save();

        return $offre;
    }

    /**
     * Sélectionner l'offre gagnante
     */
    public function selectWinner($id, Request $request)
    {
        $offre = Offre::find($id);

        if (!$offre) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }

        $appelOffre = $offre->appelOffre;

        if ($appelOffre->statut !== 'cloture') {
            return response()->json([
                'success' => false,
                'message' => 'L\'appel d\'offres doit être clôturé avant de sélectionner un gagnant'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Marquer l'offre comme lauréate
            Offre::where('appel_offre_id', $appelOffre->id)->update(['est_laureat' => false]);
            $offre->est_laureat = true;
            $offre->save();

            // Mettre à jour le statut de l'appel d'offres
            $appelOffre->statut = 'attribue';
            $appelOffre->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Offre gagnante sélectionnée',
                'data' => $offre
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la sélection'
            ], 500);
        }
    }

    /**
     * Comparer les offres d'un appel d'offres
     */
    public function compare($appelOffreId)
    {
        $appelOffre = AppelOffre::with(['offres.fournisseur'])->find($appelOffreId);

        if (!$appelOffre) {
            return response()->json([
                'success' => false,
                'message' => 'Appel d\'offres non trouvé'
            ], 404);
        }

        $comparaison = [
            'appel_offre' => $appelOffre,
            'offres' => $appelOffre->offres->map(function ($offre) {
                return [
                    'id' => $offre->id,
                    'fournisseur' => $offre->fournisseur->nom,
                    'prix_unitaire' => $offre->prix_unitaire,
                    'delai_livraison' => $offre->delai_livraison,
                    'garantie' => $offre->garantie,
                    'frais_livraison' => $offre->frais_livraison,
                    'montant_total' => $offre->montant_total,
                    'score' => $offre->score_calcule,
                    'rang' => $offre->rang,
                    'est_laureat' => $offre->est_laureat,
                ];
            }),
            'meilleure_offre' => $appelOffre->offres()->orderBy('score_calcule', 'desc')->first()
        ];

        return response()->json([
            'success' => true,
            'data' => $comparaison
        ]);
    }
}