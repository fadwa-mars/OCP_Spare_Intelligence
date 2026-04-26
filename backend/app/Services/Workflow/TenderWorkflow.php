<?php

namespace App\Services\Workflow;

use App\Models\AppelOffre;
use App\Models\Offre;
use App\Services\Purchasing\OfferEvaluationService;
use App\Services\Alert\AlertService;

class TenderWorkflow
{
    protected $offerEvaluationService;
    protected $alertService;

    public function __construct(OfferEvaluationService $offerEvaluationService, AlertService $alertService)
    {
        $this->offerEvaluationService = $offerEvaluationService;
        $this->alertService = $alertService;
    }

    /**
     * Publier un appel d'offres
     */
    public function publish($appelId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) {
            throw new \Exception('Appel d\'offres non trouvé');
        }

        $appel->statut = 'publie';
        $appel->save();

        // Notifier les fournisseurs
        $this->notifySuppliers($appel);

        return $appel;
    }

    /**
     * Clôturer un appel d'offres
     */
    public function close($appelId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) {
            throw new \Exception('Appel d\'offres non trouvé');
        }

        $appel->statut = 'cloture';
        $appel->save();

        // Évaluer les offres
        $offres = $this->offerEvaluationService->evaluateOffers($appelId);

        return [
            'appel' => $appel,
            'offres' => $offres,
        ];
    }

    /**
     * Attribuer l'appel d'offres
     */
    public function attribute($appelId, $offreId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) {
            throw new \Exception('Appel d\'offres non trouvé');
        }

        $this->offerEvaluationService->selectWinner($appelId, $offreId);

        $offre = Offre::find($offreId);

        // Créer une alerte
        $this->alertService->createAlert(
            'tender_attribue',
            'info',
            "Appel d'offres N°{$appel->id} attribué au fournisseur {$offre->fournisseur->nom}",
            null,
            null
        );

        return $appel;
    }

    /**
     * Notifier les fournisseurs
     */
    private function notifySuppliers($appel)
    {
        // Logique de notification des fournisseurs
        // À implémenter avec email ou API
    }

    /**
     * Vérifier si l'appel d'offres est clôturable
     */
    public function canClose($appelId)
    {
        $appel = AppelOffre::find($appelId);
        
        if (!$appel) return false;
        
        return now()->gte($appel->date_cloture) || $appel->statut === 'cloture';
    }

    /**
     * Obtenir le résumé de l'appel d'offres
     */
    public function getSummary($appelId)
    {
        $appel = AppelOffre::with('offres.fournisseur')->find($appelId);
        
        if (!$appel) return null;

        return [
            'id' => $appel->id,
            'objet' => $appel->objet,
            'statut' => $appel->statut,
            'date_cloture' => $appel->date_cloture,
            'nb_offres' => $appel->offres->count(),
            'meilleure_offre' => $appel->offres->sortByDesc('score_calcule')->first(),
        ];
    }
}