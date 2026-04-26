<?php

namespace App\Services\Inventory;

use App\Models\Article;
use App\Models\Stock;
use App\Models\MouvementStock;
use App\Models\HistoriqueStock;
use App\Models\Alerte;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Mettre à jour le stock après un mouvement
     */
    public function updateStock($articleId, $quantite, $typeMouvement, $userId, $commandeId = null, $commentaire = null)
    {
        DB::beginTransaction();

        try {
            $stock = Stock::where('article_id', $articleId)->first();
            $article = Article::find($articleId);
            
            if (!$stock) {
                throw new \Exception('Stock non trouvé');
            }

            $stockAvant = $stock->stock_actuel;

            switch ($typeMouvement) {
                case 'entree':
                    $stock->stock_actuel += $quantite;
                    break;
                case 'sortie':
                    if ($stock->stock_actuel < $quantite) {
                        throw new \Exception('Stock insuffisant');
                    }
                    $stock->stock_actuel -= $quantite;
                    break;
                case 'reservation':
                    if ($stock->stock_disponible < $quantite) {
                        throw new \Exception('Stock disponible insuffisant');
                    }
                    $stock->stock_reserve += $quantite;
                    break;
                case 'annulation':
                    if ($stock->stock_reserve < $quantite) {
                        throw new \Exception('Réservation insuffisante');
                    }
                    $stock->stock_reserve -= $quantite;
                    break;
            }

            $stock->stock_disponible = $stock->stock_actuel - $stock->stock_reserve;
            $stock->date_dernier_mouvement = now();
            $stock->save();

            // Enregistrer le mouvement
            MouvementStock::create([
                'article_id' => $articleId,
                'user_id' => $userId,
                'commande_id' => $commandeId,
                'type_mouvement' => $typeMouvement,
                'quantite' => $quantite,
                'commentaire' => $commentaire,
                'date_mouvement' => now(),
            ]);

            // Historique
            HistoriqueStock::create([
                'article_id' => $articleId,
                'stock_avant' => $stockAvant,
                'stock_apres' => $stock->stock_actuel,
                'quantite_change' => $quantite,
                'type_mouvement' => $typeMouvement,
                'date_mouvement' => now(),
                'user_id' => $userId,
            ]);

            // Vérifier les seuils
            $this->checkThresholds($article, $stock);

            DB::commit();
            return $stock;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Vérifier les seuils
     */
    private function checkThresholds($article, $stock)
    {
        if ($stock->stock_actuel <= $article->seuil_min) {
            Alerte::create([
                'type' => 'seuil_min',
                'niveau' => $stock->stock_actuel <= $article->seuil_min / 2 ? 'rouge' : 'jaune',
                'message' => "Stock de l'article {$article->designation} a atteint le seuil minimum",
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }

        if ($stock->stock_actuel <= 0) {
            Alerte::create([
                'type' => 'rupture',
                'niveau' => 'rouge',
                'message' => "Rupture de stock pour l'article {$article->designation}",
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }
    }

    /**
     * Valeur totale du stock
     */
    public function getTotalStockValue()
    {
        return Stock::sum(DB::raw('stock_actuel * 100'));
    }
}