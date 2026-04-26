<?php

namespace App\Services\Inventory;

use App\Models\Article;
use App\Models\SeuilHistorique;
use Illuminate\Support\Facades\DB;

class MinMaxThresholdService
{
    /**
     * Calculer les seuils optimaux
     */
    public function calculateOptimalThresholds($articleId)
    {
        $article = Article::find($articleId);
        
        $consommationAnnuelle = DB::table('mouvement_stocks')
            ->where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->whereYear('date_mouvement', date('Y'))
            ->sum('quantite');

        if ($consommationAnnuelle == 0) {
            return [
                'seuil_min' => $article->seuil_min,
                'seuil_securite' => $article->seuil_securite,
                'qec' => 0,
            ];
        }

        $coutPassation = 50;
        $coutStockage = 0.20;
        $prixUnitaire = $this->getAveragePrice($articleId);
        $qec = sqrt((2 * $consommationAnnuelle * $coutPassation) / ($coutStockage * $prixUnitaire));

        $delaiApprovisionnement = $article->delai_approvisionnement;
        $consommationMoyenneMensuelle = $consommationAnnuelle / 12;
        $stockSecurite = $consommationMoyenneMensuelle * ($delaiApprovisionnement / 30);
        $seuilReappro = ($consommationMoyenneMensuelle / 30) * $delaiApprovisionnement + $stockSecurite;

        return [
            'seuil_min' => round($seuilReappro, 2),
            'seuil_securite' => round($stockSecurite, 2),
            'qec' => round($qec, 0),
        ];
    }

    /**
     * Mettre à jour les seuils
     */
    public function updateThresholds($articleId, $newSeuilMin, $newSeuilSecurite, $userId, $raison = null)
    {
        $article = Article::find($articleId);
        
        SeuilHistorique::create([
            'article_id' => $articleId,
            'ancien_seuil_min' => $article->seuil_min,
            'nouveau_seuil_min' => $newSeuilMin,
            'ancien_seuil_securite' => $article->seuil_securite,
            'nouveau_seuil_securite' => $newSeuilSecurite,
            'raison_modification' => $raison,
            'modifie_par' => $userId,
        ]);

        $article->seuil_min = $newSeuilMin;
        $article->seuil_securite = $newSeuilSecurite;
        $article->save();

        return $article;
    }

    private function getAveragePrice($articleId)
    {
        $price = DB::table('ligne_commandes')
            ->where('article_id', $articleId)
            ->avg('prix_unitaire');
        return $price ?? 100;
    }
}