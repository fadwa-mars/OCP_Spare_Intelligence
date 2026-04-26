<?php

namespace App\Services\Supplier;

use App\Models\Fournisseur;
use App\Models\Commande;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SupplierScoringService
{
    /**
     * Calculer le score global d'un fournisseur
     */
    public function calculateScore($fournisseurId)
    {
        $fournisseur = Fournisseur::find($fournisseurId);
        
        // Critères
        $scoreDelai = $this->calculateDeliveryScore($fournisseurId);      // 40%
        $scoreQualite = $this->calculateQualityScore($fournisseurId);     // 35%
        $scorePrix = $this->calculatePriceScore($fournisseurId);          // 25%
        
        $scoreTotal = ($scoreDelai * 0.40) + ($scoreQualite * 0.35) + ($scorePrix * 0.25);
        
        $fournisseur->score_global = round($scoreTotal, 2);
        $fournisseur->date_derniere_evaluation = now();
        $fournisseur->save();
        
        return $fournisseur->score_global;
    }

    /**
     * Score délai de livraison
     */
    private function calculateDeliveryScore($fournisseurId)
    {
        $commandes = Commande::where('fournisseur_id', $fournisseurId)
            ->whereNotNull('date_livraison_reelle')
            ->get();

        if ($commandes->count() == 0) return 50;

        $totalRetard = 0;
        foreach ($commandes as $commande) {
            $retard = max(0, Carbon::parse($commande->date_livraison_reelle)->diffInDays($commande->date_livraison_prevue));
            $totalRetard += $retard;
        }

        $retardMoyen = $totalRetard / $commandes->count();
        
        if ($retardMoyen <= 0) return 100;
        if ($retardMoyen <= 2) return 90;
        if ($retardMoyen <= 5) return 75;
        if ($retardMoyen <= 10) return 50;
        return 25;
    }

    /**
     * Score qualité
     */
    private function calculateQualityScore($fournisseurId)
    {
        $fournisseur = Fournisseur::find($fournisseurId);
        return $fournisseur->taux_conformite ?? 70;
    }

    /**
     * Score prix
     */
    private function calculatePriceScore($fournisseurId)
    {
        $prixMoyen = DB::table('offres')
            ->where('fournisseur_id', '!=', $fournisseurId)
            ->avg('prix_unitaire');

        $prixFournisseur = DB::table('offres')
            ->where('fournisseur_id', $fournisseurId)
            ->avg('prix_unitaire');

        if ($prixMoyen == 0 || $prixFournisseur == 0) return 70;

        if ($prixFournisseur <= $prixMoyen) return 100;

        $ratio = $prixMoyen / $prixFournisseur;
        return round($ratio * 100, 2);
    }

    /**
     * Classement des fournisseurs
     */
    public function getRanking($limit = 10)
    {
        return Fournisseur::where('est_actif', true)
            ->orderBy('score_global', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Évaluation complète avec détails
     */
    public function getDetailedScore($fournisseurId)
    {
        return [
            'score_global' => $this->calculateScore($fournisseurId),
            'score_delai' => $this->calculateDeliveryScore($fournisseurId),
            'score_qualite' => $this->calculateQualityScore($fournisseurId),
            'score_prix' => $this->calculatePriceScore($fournisseurId),
            'niveau' => $this->getLevel($fournisseurId),
        ];
    }

    /**
     * Niveau du fournisseur
     */
    private function getLevel($fournisseurId)
    {
        $score = Fournisseur::find($fournisseurId)->score_global ?? 0;
        
        if ($score >= 90) return 'Platine';
        if ($score >= 75) return 'Or';
        if ($score >= 60) return 'Argent';
        if ($score >= 40) return 'Bronze';
        return 'À surveiller';
    }
}