<?php

namespace App\Services\Workflow;

use App\Models\DemandeAchat;
use App\Models\User;
use App\Services\Alert\AlertService;
use App\Services\Purchasing\TenderService;

class ApprovalWorkflow
{
    protected $alertService;
    protected $tenderService;

    public function __construct(AlertService $alertService, TenderService $tenderService)
    {
        $this->alertService = $alertService;
        $this->tenderService = $tenderService;
    }

    /**
     * Démarrer le workflow d'approbation
     */
    public function start($demandeId)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        // Vérifier si appel d'offres requis
        if ($this->tenderService->isTenderRequired($demandeId)) {
            $this->triggerTenderWorkflow($demande);
        } else {
            $this->triggerSimpleApproval($demande);
        }

        return $demande;
    }

    /**
     * Approuver une demande
     */
    public function approve($demandeId, $userId, $commentaire = null)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        $demande->statut = 'approuvee';
        $demande->save();

        // Créer une alerte de succès
        $this->alertService->createAlert(
            'approbation',
            'info',
            "Demande d'achat N°{$demande->id} approuvée" . ($commentaire ? " : $commentaire" : ''),
            $demande->article_id
        );

        return $demande;
    }

    /**
     * Rejeter une demande
     */
    public function reject($demandeId, $userId, $motif)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        $demande->statut = 'rejetee';
        $demande->save();

        // Créer une alerte de rejet
        $this->alertService->createAlert(
            'rejet',
            'jaune',
            "Demande d'achat N°{$demande->id} rejetée : $motif",
            $demande->article_id
        );

        return $demande;
    }

    /**
     * Déclencher workflow simple
     */
    private function triggerSimpleApproval($demande)
    {
        $demande->statut = 'soumise';
        $demande->save();
    }

    /**
     * Déclencher workflow appel d'offres
     */
    private function triggerTenderWorkflow($demande)
    {
        $demande->statut = 'soumise';
        $demande->save();
    }

    /**
     * Obtenir les approbateurs potentiels
     */
    public function getApprovers()
    {
        return User::whereIn('role', ['planificateur', 'admin'])
            ->where('is_active', true)
            ->get();
    }
}