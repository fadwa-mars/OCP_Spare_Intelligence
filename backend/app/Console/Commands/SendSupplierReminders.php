<?php

namespace App\Console\Commands;

use App\Models\Commande;
use App\Services\Supplier\SupplierEscalationService;
use App\Mail\RelanceFournisseurMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Console\Command;

class SendSupplierReminders extends Command
{
    protected $signature = 'supplier:send-reminders';
    protected $description = 'Envoyer les relances aux fournisseurs pour les commandes en retard';

    protected $escalationService;

    public function __construct(SupplierEscalationService $escalationService)
    {
        parent::__construct();
        $this->escalationService = $escalationService;
    }

    public function handle()
    {
        $this->info('Vérification des commandes en retard...');
        
        $commandes = Commande::where('statut', '!=', 'recue')
            ->where('date_livraison_prevue', '<', now())
            ->get();
        
        if ($commandes->isEmpty()) {
            $this->info('Aucune commande en retard.');
            return;
        }
        
        $this->info($commandes->count() . ' commande(s) en retard trouvée(s).');
        
        $relancesEnvoyees = 0;
        
        foreach ($commandes as $commande) {
            $joursRetard = now()->diffInDays($commande->date_livraison_prevue);
            $result = $this->escalationService->checkAndSendRelances($commande->id, 1);
            
            if ($result && $commande->fournisseur->email_contact) {
                Mail::to($commande->fournisseur->email_contact)->send(new RelanceFournisseurMail($commande, $result));
                $relancesEnvoyees++;
                $this->line("📧 Relance envoyée pour commande {$commande->numero_bc}");
            }
        }
        
        $this->info("✅ {$relancesEnvoyees} relance(s) envoyée(s).");
    }
}