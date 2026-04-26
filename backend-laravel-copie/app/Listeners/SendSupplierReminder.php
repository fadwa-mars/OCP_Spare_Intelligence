<?php

namespace App\Listeners;

use App\Events\SupplierDelayDetected;
use App\Services\Supplier\SupplierEscalationService;
use App\Mail\RelanceFournisseurMail;
use Illuminate\Support\Facades\Mail;

class SendSupplierReminder
{
    protected $escalationService;

    public function __construct(SupplierEscalationService $escalationService)
    {
        $this->escalationService = $escalationService;
    }

    public function handle(SupplierDelayDetected $event)
    {
        $commande = $event->commande;
        $joursRetard = $event->joursRetard;
        
        // Déterminer le niveau d'escalade
        $niveau = min(6, ceil($joursRetard / 3) + 1);
        
        // Envoyer la relance
        $relance = $this->escalationService->sendRelance($commande->id, $niveau, 1);
        
        // Envoyer l'email
        Mail::to($commande->fournisseur->email_contact)->send(new RelanceFournisseurMail($commande, $relance));
    }
}