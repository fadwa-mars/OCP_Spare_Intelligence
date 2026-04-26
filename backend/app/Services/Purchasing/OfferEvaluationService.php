<?php

namespace App\Services\Purchasing;

use App\Models\Offre;
use App\Models\AppelOffre;
use App\Models\RegleMarchePublic;
use Illuminate\Support\Facades\DB;

class OfferEvaluationService
{
    /**
     * Évaluer toutes les offres d'un appel d'offres
     */
    public function evaluateOffers($appelId)
    {
        $appel = AppelOffre::find($appelId);
        $regle = RegleMarchePublic::first();
        
        if (!$regle) {
            throw new \Exception('Aucune règle de marché public configurée');
        }

        $offres = Offre::where('appel_offre_id', $appelId)->get();
        
        foreach ($offres as $offre) {
            $this->calculateScore($offre, $regle);
        }

        // Classer les offres
        $offres = Offre::where('appel_offre_id', $appelId)
            ->orderBy('score_calcule', 'desc')
            ->get();

        $rang = 1;
        foreach ($offres as $offre) {
            $offre->rang = $rang;
            $offre->save();
            $rang++;
        }

        return $offres;
    }

    /**
     * Calculer le score d'une offre
     */
    public function calculateScore($offre, $regle = null)
    {
        if (!$regle) {
            $regle = RegleMarchePublic::first();
        }

        if (!$regle) return 0;

        // Score Prix (60%)
        $autresOffres = Offre::where('appel_offre_id', $offre->appel_offre_id)
            ->where('id', '!=', $offre->id)
            ->get();

        $prixMin = $autresOffres->min('prix_unitaire') ?? $offre->prix_unitaire;
        $scorePrix = ($prixMin / $offre->prix_unitaire) * $regle->ponderation_prix;

        // Score Délai (25%)
        $delaiMin = $autresOffres->min('delai_livraison') ?? $offre->delai_livraison;
        $scoreDelai = ($delaiMin / $offre->delai_livraison) * $regle->ponderation_delai;

        // Score Qualité (15%)
        $scoreQualite = ($offre->fournisseur->score_global / 100) * $regle->ponderation_qualite;

        $scoreTotal = $scorePrix + $scoreDelai + $scoreQualite;
        
        $offre->score_calcule = round($scoreTotal, 2);
        $offre->save();

        return $offre->score_calcule;
    }

    /**
     * Sélectionner l'offre gagnante
     */
    public function selectWinner($appelId, $offreId)
    {
        DB::beginTransaction();
        
        try {
            // Marquer l'offre comme lauréate
            Offre::where('appel_offre_id', $appelId)->update(['est_laureat' => false]);
            Offre::where('id', $offreId)->update(['est_laureat' => true]);
            
            // Mettre à jour le statut de l'appel d'offres
            $appel = AppelOffre::find($appelId);
            $appel->statut = 'attribue';
            $appel->save();
            
            DB::commit();
            
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Comparer les offres
     */
    public function compareOffers($appelId)
    {
        $offres = Offre::where('appel_offre_id', $appelId)
            ->with('fournisseur')
            ->orderBy('score_calcule', 'desc')
            ->get();

        return $offres->map(function($offre) {
            return [
                'id' => $offre->id,
                'fournisseur' => $offre->fournisseur->nom,
                'prix_unitaire' => $offre->prix_unitaire,
                'delai_livraison' => $offre->delai_livraison,
                'score' => $offre->score_calcule,
                'rang' => $offre->rang,
                'est_laureat' => $offre->est_laureat,
            ];
        });
    }
}