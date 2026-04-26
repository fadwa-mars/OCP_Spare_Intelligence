<?php

namespace App\Services\Purchasing;

use App\Models\DemandeAchat;
use App\Models\Article;
use App\Models\Alerte;
use Illuminate\Support\Facades\DB;

class PurchaseRequestService
{
    /**
     * Créer une demande d'achat
     */
    public function createDemande($articleId, $userId, $quantite, $dateBesoin, $urgence = 'moyenne')
    {
        $article = Article::find($articleId);
        
        if (!$article) {
            throw new \Exception('Article non trouvé');
        }

        $demande = DemandeAchat::create([
            'article_id' => $articleId,
            'user_id' => $userId,
            'quantite' => $quantite,
            'date_demande' => now(),
            'date_besoin' => $dateBesoin,
            'urgence' => $urgence,
            'statut' => 'brouillon',
        ]);

        return $demande;
    }

    /**
     * Soumettre une demande (changement statut)
     */
    public function submitDemande($demandeId)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        if ($demande->statut !== 'brouillon') {
            throw new \Exception('Seules les demandes en brouillon peuvent être soumises');
        }

        $demande->statut = 'soumise';
        $demande->save();

        // Notifier les acheteurs
        $this->notifyAcheteurs($demande);

        return $demande;
    }

    /**
     * Approuver une demande
     */
    public function approveDemande($demandeId)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        if ($demande->statut !== 'soumise') {
            throw new \Exception('Seules les demandes soumises peuvent être approuvées');
        }

        $demande->statut = 'approuvee';
        $demande->save();

        return $demande;
    }

    /**
     * Rejeter une demande
     */
    public function rejectDemande($demandeId, $motif = null)
    {
        $demande = DemandeAchat::find($demandeId);
        
        if (!$demande) {
            throw new \Exception('Demande non trouvée');
        }

        $demande->statut = 'rejetee';
        $demande->save();

        // Créer une alerte
        Alerte::create([
            'type' => 'demande_rejetee',
            'niveau' => 'info',
            'message' => "Demande d'achat rejetée" . ($motif ? " : $motif" : ''),
            'date_creation' => now(),
            'est_traitee' => false,
        ]);

        return $demande;
    }

    /**
     * Notifier les acheteurs
     */
    private function notifyAcheteurs($demande)
    {
        // Logique de notification
        // À implémenter avec les notifications Laravel
    }

    /**
     * Statistiques des demandes
     */
    public function getStats()
    {
        return [
            'total' => DemandeAchat::count(),
            'brouillon' => DemandeAchat::where('statut', 'brouillon')->count(),
            'soumises' => DemandeAchat::where('statut', 'soumise')->count(),
            'approuvees' => DemandeAchat::where('statut', 'approuvee')->count(),
            'rejetees' => DemandeAchat::where('statut', 'rejetee')->count(),
            'transformees' => DemandeAchat::where('statut', 'transformee_en_commande')->count(),
        ];
    }
}