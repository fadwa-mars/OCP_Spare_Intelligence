<?php

namespace App\Services\Supplier;

use App\Models\Commande;
use App\Models\Relance;
use App\Models\Alerte;
use Carbon\Carbon;

class SupplierEscalationService
{
    /**
     * Niveaux d'escalade
     */
    private $levels = [
        1 => ['jour' => -7, 'type' => 'email', 'message' => 'Rappel : Commande en cours de traitement'],
        2 => ['jour' => 0, 'type' => 'email', 'message' => 'Date de livraison prévue aujourd\'hui'],
        3 => ['jour' => 3, 'type' => 'email', 'message' => 'Retard de livraison - Premier rappel'],
        4 => ['jour' => 7, 'type' => 'telephone', 'message' => 'Retard significatif - Appel requis'],
        5 => ['jour' => 10, 'type' => 'email', 'message' => 'Dernier avertissement avant escalade'],
        6 => ['jour' => 15, 'type' => 'reunion', 'message' => 'Escalade hiérarchique - Réunion urgente'],
    ];

    /**
     * Vérifier et envoyer les relances nécessaires
     */
    public function checkAndSendRelances($commandeId, $userId)
    {
        $commande = Commande::find($commandeId);
        if (!$commande || $commande->statut === 'recue') return null;

        $joursRetard = Carbon::now()->diffInDays($commande->date_livraison_prevue, false);
        $dernierNiveau = Relance::where('commande_id', $commandeId)->max('niveau') ?? 0;

        $prochainNiveau = $dernierNiveau + 1;
        
        if ($prochainNiveau <= 6 && $joursRetard >= $this->levels[$prochainNiveau]['jour']) {
            return $this->sendRelance($commandeId, $prochainNiveau, $userId);
        }

        return null;
    }

    /**
     * Envoyer une relance
     */
    public function sendRelance($commandeId, $niveau, $userId)
    {
        $level = $this->levels[$niveau];
        
        $relance = Relance::create([
            'commande_id' => $commandeId,
            'user_id' => $userId,
            'niveau' => $niveau,
            'type_relance' => $level['type'],
            'message' => $level['message'],
            'date_envoi' => now(),
            'reponse_recue' => false,
        ]);

        // Créer une alerte si niveau élevé
        if ($niveau >= 4) {
            Alerte::create([
                'type' => 'retard_livraison',
                'niveau' => $niveau >= 5 ? 'rouge' : 'jaune',
                'message' => $level['message'],
                'commande_id' => $commandeId,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }

        return $relance;
    }

    /**
     * Obtenir la prochaine relance à envoyer
     */
    public function getNextRelance($commandeId)
    {
        $commande = Commande::find($commandeId);
        if (!$commande) return null;

        $dernierNiveau = Relance::where('commande_id', $commandeId)->max('niveau') ?? 0;
        
        if ($dernierNiveau >= 6) return null;

        $prochainNiveau = $dernierNiveau + 1;
        return [
            'niveau' => $prochainNiveau,
            'type' => $this->levels[$prochainNiveau]['type'],
            'message' => $this->levels[$prochainNiveau]['message'],
            'jour' => $this->levels[$prochainNiveau]['jour'],
        ];
    }

    /**
     * Marquer une relance comme répondue
     */
    public function markAsAnswered($relanceId, $reponseDetail)
    {
        $relance = Relance::find($relanceId);
        if ($relance) {
            $relance->reponse_recue = true;
            $relance->reponse_detail = $reponseDetail;
            $relance->save();
        }
        return $relance;
    }

    /**
     * Historique des relances d'une commande
     */
    public function getRelanceHistory($commandeId)
    {
        return Relance::where('commande_id', $commandeId)
            ->orderBy('niveau', 'asc')
            ->get();
    }
}