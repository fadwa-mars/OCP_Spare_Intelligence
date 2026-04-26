<?php

namespace App\Jobs;

use App\Models\Commande;
use App\Services\Supplier\SupplierEscalationService;
use App\Mail\RelanceFournisseurMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBulkRemindersJob implements ShouldQueue
{
    use Queueable;

    protected $commandeIds;
    protected $userId;

    public function __construct($commandeIds = null, $userId = null)
    {
        $this->commandeIds = $commandeIds;
        $this->userId = $userId;
    }

    public function handle(SupplierEscalationService $escalationService)
    {
        if ($this->commandeIds) {
            $commandes = Commande::whereIn('id', $this->commandeIds)->get();
        } else {
            $commandes = Commande::where('statut', '!=', 'recue')
                ->where('date_livraison_prevue', '<', now())
                ->get();
        }
        
        Log::info('Envoi des relances en masse', ['count' => $commandes->count()]);
        
        $sent = 0;
        foreach ($commandes as $commande) {
            $joursRetard = now()->diffInDays($commande->date_livraison_prevue);
            $niveau = min(6, ceil($joursRetard / 3) + 1);
            
            $relance = $escalationService->sendRelance($commande->id, $niveau, $this->userId ?? 1);
            
            if ($relance && $commande->fournisseur->email_contact) {
                Mail::to($commande->fournisseur->email_contact)->send(new RelanceFournisseurMail($commande, $relance));
                $sent++;
            }
        }
        
        Log::info('Relances envoyées', ['sent' => $sent, 'total' => $commandes->count()]);
    }
}