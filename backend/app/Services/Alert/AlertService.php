<?php

namespace App\Services\Alert;

use App\Models\Alerte;
use App\Models\User;
use App\Notifications\StockThresholdNotification;
use Illuminate\Support\Facades\Notification;

class AlertService
{
    /**
     * Créer une alerte
     */
    public function createAlert($type, $niveau, $message, $articleId = null, $commandeId = null)
    {
        // Vérifier si une alerte similaire existe déjà non traitée
        $existingAlert = Alerte::where('type', $type)
            ->where('article_id', $articleId)
            ->where('commande_id', $commandeId)
            ->where('est_traitee', false)
            ->first();

        if ($existingAlert) {
            return $existingAlert;
        }

        return Alerte::create([
            'type' => $type,
            'niveau' => $niveau,
            'message' => $message,
            'article_id' => $articleId,
            'commande_id' => $commandeId,
            'date_creation' => now(),
            'est_traitee' => false,
        ]);
    }

    /**
     * Marquer une alerte comme traitée
     */
    public function markAsTreated($alerteId, $userId)
    {
        $alerte = Alerte::find($alerteId);
        
        if ($alerte) {
            $alerte->est_traitee = true;
            $alerte->date_traitement = now();
            $alerte->user_traitement_id = $userId;
            $alerte->save();
        }

        return $alerte;
    }

    /**
     * Obtenir les alertes non traitées
     */
    public function getUnresolvedAlerts($type = null)
    {
        $query = Alerte::where('est_traitee', false);
        
        if ($type) {
            $query->where('type', $type);
        }

        return $query->orderBy('date_creation', 'desc')->get();
    }

    /**
     * Compter les alertes par niveau
     */
    public function countByLevel()
    {
        return [
            'rouge' => Alerte::where('niveau', 'rouge')->where('est_traitee', false)->count(),
            'jaune' => Alerte::where('niveau', 'jaune')->where('est_traitee', false)->count(),
            'info' => Alerte::where('niveau', 'info')->where('est_traitee', false)->count(),
            'total' => Alerte::where('est_traitee', false)->count(),
        ];
    }

    /**
     * Notifier les utilisateurs
     */
    public function notifyUsers($alerte, $roles = ['admin', 'planificateur'])
    {
        $users = User::whereIn('role', $roles)->where('is_active', true)->get();
        
        foreach ($users as $user) {
            Notification::send($user, new StockThresholdNotification($alerte));
        }
    }

    /**
     * Nettoyer les anciennes alertes
     */
    public function cleanOldAlerts($days = 30)
    {
        $dateLimit = now()->subDays($days);
        
        return Alerte::where('est_traitee', true)
            ->where('date_traitement', '<', $dateLimit)
            ->delete();
    }
}