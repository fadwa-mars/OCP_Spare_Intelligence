<?php

namespace App\Services\Supplier;

use App\Models\Fournisseur;
use App\Models\Commande;
use App\Models\Offre;
use App\Models\Alerte;

class BackupSupplierService
{
    /**
     * Trouver un fournisseur de secours
     */
    public function findBackupSupplier($articleId, $currentSupplierId = null)
    {
        // Trouver les fournisseurs alternatifs
        $query = Fournisseur::where('est_actif', true);
        
        if ($currentSupplierId) {
            $query->where('id', '!=', $currentSupplierId);
        }

        // Prioriser par score global
        $suppliers = $query->orderBy('score_global', 'desc')->get();

        $results = [];
        foreach ($suppliers as $supplier) {
            $offre = Offre::where('fournisseur_id', $supplier->id)
                ->where('article_id', $articleId)
                ->latest()
                ->first();

            if ($offre) {
                $results[] = [
                    'fournisseur' => $supplier,
                    'prix' => $offre->prix_unitaire,
                    'delai' => $offre->delai_livraison,
                ];
            }
        }

        return $results;
    }

    /**
     * Activer un fournisseur de secours
     */
    public function activateBackup($commandeId, $backupSupplierId)
    {
        $commande = Commande::find($commandeId);
        $backupSupplier = Fournisseur::find($backupSupplierId);

        if (!$commande || !$backupSupplier) {
            throw new \Exception('Commande ou fournisseur non trouvé');
        }

        $oldSupplier = $commande->fournisseur;

        // Changer le fournisseur
        $commande->fournisseur_id = $backupSupplierId;
        $commande->save();

        // Créer une alerte
        Alerte::create([
            'type' => 'fournisseur_secours',
            'niveau' => 'jaune',
            'message' => "Fournisseur de secours activé : {$backupSupplier->nom} pour la commande {$commande->numero_bc}",
            'commande_id' => $commandeId,
            'date_creation' => now(),
            'est_traitee' => false,
        ]);

        return [
            'success' => true,
            'message' => "Fournisseur de secours {$backupSupplier->nom} activé",
            'commande' => $commande,
        ];
    }

    /**
     * Liste des fournisseurs alternatifs
     */
    public function getAlternativeSuppliers($articleId, $limit = 5)
    {
        $offres = Offre::where('article_id', $articleId)
            ->with('fournisseur')
            ->whereHas('fournisseur', function($query) {
                $query->where('est_actif', true);
            })
            ->orderBy('prix_unitaire', 'asc')
            ->limit($limit)
            ->get();

        return $offres;
    }

    /**
     * Comparer les fournisseurs
     */
    public function compareSuppliers($articleId)
    {
        $suppliers = $this->getAlternativeSuppliers($articleId, 10);
        
        $comparaison = [];
        foreach ($suppliers as $offre) {
            $comparaison[] = [
                'fournisseur' => $offre->fournisseur->nom,
                'prix' => $offre->prix_unitaire,
                'delai' => $offre->delai_livraison,
                'score' => $offre->fournisseur->score_global,
                'recommandation' => $this->getRecommendation($offre),
            ];
        }

        return $comparaison;
    }

    /**
     * Recommandation basée sur le score
     */
    private function getRecommendation($offre)
    {
        $score = $offre->fournisseur->score_global ?? 0;
        
        if ($score >= 75) return 'Recommandé';
        if ($score >= 50) return 'Alternatif acceptable';
        return 'Dernier recours';
    }
}