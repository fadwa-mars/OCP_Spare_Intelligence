<?php

namespace App\Services\Purchasing;

use App\Models\Commande;
use App\Models\Offre;
use App\Models\LigneCommande;
use App\Models\DemandeAchat;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Créer une commande à partir d'une offre gagnante
     */
    public function createOrderFromWinner($offreId, $userId)
    {
        $offre = Offre::with(['appelOffre.demandeAchat', 'fournisseur'])->find($offreId);
        
        if (!$offre) {
            throw new \Exception('Offre non trouvée');
        }

        DB::beginTransaction();
        
        try {
            $numeroBc = 'BC-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            $commande = Commande::create([
                'appel_offre_id' => $offre->appel_offre_id,
                'fournisseur_id' => $offre->fournisseur_id,
                'user_id' => $userId,
                'numero_bc' => $numeroBc,
                'date_commande' => now(),
                'date_livraison_prevue' => now()->addDays($offre->delai_livraison),
                'statut' => 'confirmee',
                'montant_total' => $offre->montant_total,
                'conditions_paiement' => '30 jours',
            ]);

            // Créer la ligne de commande
            $demande = $offre->appelOffre->demandeAchat;
            
            LigneCommande::create([
                'commande_id' => $commande->id,
                'article_id' => $demande->article_id,
                'offre_id' => $offre->id,
                'quantite' => $demande->quantite,
                'prix_unitaire' => $offre->prix_unitaire,
                'montant_ligne' => $demande->quantite * $offre->prix_unitaire,
            ]);

            // Mettre à jour la demande
            $demande->statut = 'transformee_en_commande';
            $demande->save();

            DB::commit();
            
            return $commande->load('ligneCommandes');
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Réceptionner une commande
     */
    public function receiveOrder($commandeId, $userId)
    {
        $commande = Commande::with('ligneCommandes.article')->find($commandeId);
        
        if (!$commande) {
            throw new \Exception('Commande non trouvée');
        }

        DB::beginTransaction();
        
        try {
            foreach ($commande->ligneCommandes as $ligne) {
                $this->stockService->updateStock(
                    $ligne->article_id,
                    $ligne->quantite,
                    'entree',
                    $userId,
                    $commandeId,
                    'Réception de commande ' . $commande->numero_bc
                );
            }

            $commande->date_livraison_reelle = now();
            $commande->statut = 'recue';
            $commande->save();

            DB::commit();
            
            return $commande;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Annuler une commande
     */
    public function cancelOrder($commandeId)
    {
        $commande = Commande::find($commandeId);
        
        if (!$commande) {
            throw new \Exception('Commande non trouvée');
        }

        if ($commande->statut === 'recue') {
            throw new \Exception('Une commande déjà reçue ne peut pas être annulée');
        }

        $commande->statut = 'annulee';
        $commande->save();

        return $commande;
    }

    /**
     * Statistiques des commandes
     */
    public function getStats()
    {
        return [
            'total' => Commande::count(),
            'en_attente' => Commande::where('statut', 'en_attente')->count(),
            'confirmees' => Commande::where('statut', 'confirmee')->count(),
            'recues' => Commande::where('statut', 'recue')->count(),
            'annulees' => Commande::where('statut', 'annulee')->count(),
            'montant_total' => Commande::sum('montant_total'),
        ];
    }
}