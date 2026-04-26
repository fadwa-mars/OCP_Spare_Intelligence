<?php

namespace App\Services\Inventory;

use App\Models\Article;
use App\Models\Alerte;
use Carbon\Carbon;

class DeadStockDetectionService
{
    /**
     * Détecter les stocks morts
     */
    public function detectDeadStock($periods = [6, 12, 18, 24])
    {
        $results = [];

        foreach ($periods as $months) {
            $dateLimit = Carbon::now()->subMonths($months);
            
            $articles = Article::whereDoesntHave('mouvements', function($query) use ($dateLimit) {
                $query->where('type_mouvement', 'sortie')
                      ->where('date_mouvement', '>=', $dateLimit);
            })->get();

            foreach ($articles as $article) {
                $stock = $article->stock;
                
                $results[] = [
                    'article' => $article,
                    'stock_actuel' => $stock->stock_actuel ?? 0,
                    'valeur_stock' => ($stock->stock_actuel ?? 0) * 100,
                    'mois_sans_mouvement' => $months,
                ];

                $this->createDeadStockAlert($article, $months);
            }
        }

        return $results;
    }

    /**
     * Créer alerte stock mort
     */
    private function createDeadStockAlert($article, $months)
    {
        $existingAlert = Alerte::where('type', 'stock_mort')
            ->where('article_id', $article->id)
            ->where('est_traitee', false)
            ->first();

        if (!$existingAlert) {
            Alerte::create([
                'type' => 'stock_mort',
                'niveau' => $months >= 18 ? 'rouge' : 'jaune',
                'message' => "Article {$article->designation} sans mouvement depuis {$months} mois",
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }
    }
}