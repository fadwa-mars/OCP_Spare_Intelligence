<?php

namespace App\Services\Purchasing;

use App\Models\AppelOffre;
use App\Models\DemandeAchat;
use App\Models\RegleMarchePublic;
use App\Models\Fournisseur;
use Illuminate\Support\Facades\DB;

class TenderService
{
    /**
     * Créer un appel d'offres
     */
    public function createTender($demandeId, $acheteurId, $dateCloture, $objet)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        $appel = AppelOffre::create([
            'demande_achat_id' => $demandeId,
            'acheteur_id' => $acheteurId,
            'date_lancement' => now(),
            'date_cloture' => $dateCloture,
            'objet' => $objet,
            'statut' => 'publie',
        ]);

        return $appel;
    }

    /**
     * Publier un appel d'offres
     */
    public function publishTender($appelId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) {
            throw new \Exception('Appel d\'offres non trouvé');
        }

        $appel->statut = 'publie';
        $appel->save();

        return $appel;
    }

    /**
     * Clôturer un appel d'offres
     */
    public function closeTender($appelId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) {
            throw new \Exception('Appel d\'offres non trouvé');
        }

        $appel->statut = 'cloture';
        $appel->save();

        return $appel;
    }

    /**
     * Vérifier si un appel d'offres est requis
     */
    public function isTenderRequired($demandeId)
    {
        $demande = DemandeAchat::find($demandeId);
        $regle = RegleMarchePublic::first();
        
        if (!$regle) return false;

        $montantEstime = $demande->quantite * 100; // Prix estimé
        return $montantEstime >= $regle->seuil_appel_offres;
    }

    /**
     * Obtenir les fournisseurs à inviter
     */
    public function getSuppliersToInvite($appelId)
    {
        $appel = AppelOffre::find($appelId);
        $regle = RegleMarchePublic::first();
        
        $minFournisseurs = $regle->nb_min_fournisseurs ?? 3;
        
        // Récupérer les meilleurs fournisseurs
        $suppliers = Fournisseur::where('est_actif', true)
            ->orderBy('score_global', 'desc')
            ->limit($minFournisseurs)
            ->get();

        return $suppliers;
    }
}