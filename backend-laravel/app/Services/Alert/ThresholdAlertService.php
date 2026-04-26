<?php

namespace App\Services\Alert;

use App\Models\Article;
use App\Models\Stock;
use App\Models\Alerte;

class ThresholdAlertService
{
    /**
     * Vérifier tous les seuils
     */
    public function checkAllThresholds()
    {
        $articles = Article::with('stock')->get();
        $alertes = [];

        foreach ($articles as $article) {
            if (!$article->stock) continue;

            $alerteMin = $this->checkMinThreshold($article);
            if ($alerteMin) $alertes[] = $alerteMin;

            $alerteMax = $this->checkMaxThreshold($article);
            if ($alerteMax) $alertes[] = $alerteMax;
        }

        return $alertes;
    }

    /**
     * Vérifier seuil minimum
     */
    public function checkMinThreshold($article)
    {
        $stock = $article->stock;
        
        if ($stock->stock_actuel <= $article->seuil_min) {
            $niveau = $stock->stock_actuel <= $article->seuil_min / 2 ? 'rouge' : 'jaune';
            
            return $this->createThresholdAlert($article, 'min', $niveau);
        }

        return null;
    }

    /**
     * Vérifier seuil maximum
     */
    public function checkMaxThreshold($article)
    {
        $stock = $article->stock;
        
        if ($article->seuil_max && $stock->stock_actuel >= $article->seuil_max) {
            return $this->createThresholdAlert($article, 'max', 'jaune');
        }

        return null;
    }

    /**
     * Créer alerte de seuil
     */
    private function createThresholdAlert($article, $type, $niveau)
    {
        $existingAlert = Alerte::where('type', 'seuil_' . $type)
            ->where('article_id', $article->id)
            ->where('est_traitee', false)
            ->first();

        if (!$existingAlert) {
            $message = $type === 'min' 
                ? "Seuil minimum atteint : l'article {$article->designation} a un stock de {$article->stock->stock_actuel} (seuil: {$article->seuil_min})"
                : "Seuil maximum atteint : l'article {$article->designation} a un stock de {$article->stock->stock_actuel} (seuil max: {$article->seuil_max})";

            return Alerte::create([
                'type' => 'seuil_' . $type,
                'niveau' => $niveau,
                'message' => $message,
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }

        return null;
    }

    /**
     * Optimiser les seuils automatiquement
     */
    public function optimizeThresholds($articleId)
    {
        $article = Article::find($articleId);
        
        // Calculer nouveau seuil basé sur la consommation
        $consommationMoyenne = $this->getAverageConsumption($articleId);
        $delaiApprovisionnement = $article->delai_approvisionnement;
        
        $nouveauSeuilMin = $consommationMoyenne * $delaiApprovisionnement;
        $nouveauSeuilSecurite = $consommationMoyenne * ($delaiApprovisionnement / 2);

        return [
            'ancien_seuil_min' => $article->seuil_min,
            'nouveau_seuil_min' => round($nouveauSeuilMin, 2),
            'ancien_seuil_securite' => $article->seuil_securite,
            'nouveau_seuil_securite' => round($nouveauSeuilSecurite, 2),
        ];
    }

    /**
     * Consommation moyenne journalière
     */
    private function getAverageConsumption($articleId)
    {
        $total = \DB::table('mouvement_stocks')
            ->where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->where('date_mouvement', '>=', now()->subMonths(3))
            ->sum('quantite');

        $jours = 90;
        return $total / $jours;
    }
}