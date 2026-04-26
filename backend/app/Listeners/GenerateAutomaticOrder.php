<?php

namespace App\Listeners;

use App\Events\DemandeAchatApproved;
use App\Services\Purchasing\OrderService;

class GenerateAutomaticOrder
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function handle(DemandeAchatApproved $event)
    {
        $demande = $event->demande;
        
        // Vérifier si l'appel d'offres n'est pas requis
        $regle = \App\Models\RegleMarchePublic::first();
        $montantEstime = $demande->quantite * 100;
        
        if ($regle && $montantEstime < $regle->seuil_appel_offres) {
            // Créer une commande automatique
            $meilleurFournisseur = \App\Models\Fournisseur::where('est_actif', true)
                ->orderBy('score_global', 'desc')
                ->first();
            
            if ($meilleurFournisseur) {
                $this->orderService->createAutomaticOrder($demande, $meilleurFournisseur);
            }
        }
    }
}