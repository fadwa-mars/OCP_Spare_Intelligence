<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Events\SupplierDelayDetected;
use App\Models\Fournisseur;
use App\Services\Supplier\SupplierScoringService;

class UpdateSupplierScore
{
    protected $scoringService;

    public function __construct(SupplierScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
    }

    public function handleOrderCreated(OrderCreated $event)
    {
        $fournisseur = $event->commande->fournisseur;
        $fournisseur->nb_commandes += 1;
        $fournisseur->save();
        
        $this->scoringService->calculateScore($fournisseur->id);
    }

    public function handleSupplierDelay(SupplierDelayDetected $event)
    {
        $fournisseur = $event->commande->fournisseur;
        $fournisseur->nb_livraisons_retard += 1;
        
        // Calculer nouveau délai moyen
        $totalCommandes = $fournisseur->nb_commandes;
        $totalRetards = $fournisseur->nb_livraisons_retard;
        $fournisseur->delai_moyen_livraison = ($fournisseur->delai_moyen_livraison * ($totalCommandes - 1) + $event->joursRetard) / $totalCommandes;
        $fournisseur->save();
        
        $this->scoringService->calculateScore($fournisseur->id);
    }
}