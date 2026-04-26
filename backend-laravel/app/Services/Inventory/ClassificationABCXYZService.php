<?php

namespace App\Services\Inventory;

use App\Models\Article;
use App\Models\ClassificationAbcXyz;
use App\Models\MouvementStock;
use Illuminate\Support\Facades\DB;

class ClassificationABCXYZService
{
    /**
     * Générer la classification ABC/XYZ
     */
    public function generate()
    {
        $dateCalcul = now();
        $consommations = MouvementStock::where('type_mouvement', 'sortie')
            ->whereYear('date_mouvement', date('Y'))
            ->select('article_id', DB::raw('SUM(quantite) as consommation_totale'))
            ->groupBy('article_id')
            ->get();

        $totalConsommation = $consommations->sum('consommation_totale');
        $articlesTries = $consommations->sortByDesc('consommation_totale');

        $pourcentageCumule = 0;
        $classifications = [];

        foreach ($articlesTries as $item) {
            $pourcentage = ($item->consommation_totale / $totalConsommation) * 100;
            $pourcentageCumule += $pourcentage;

            if ($pourcentageCumule <= 70) {
                $classeAbc = 'A';
            } elseif ($pourcentageCumule <= 90) {
                $classeAbc = 'B';
            } else {
                $classeAbc = 'C';
            }

            $classeXyz = $this->calculateXyzClass($item->article_id);
            $article = Article::find($item->article_id);
            $valeurStock = ($article->stock->stock_actuel ?? 0) * 100;

            $classifications[] = [
                'article_id' => $item->article_id,
                'classe_abc' => $classeAbc,
                'classe_xyz' => $classeXyz,
                'valeur_consommation' => $item->consommation_totale,
                'valeur_stock' => $valeurStock,
                'date_calcul' => $dateCalcul,
            ];
        }

        ClassificationAbcXyz::query()->delete();
        foreach ($classifications as $classification) {
            ClassificationAbcXyz::create($classification);
        }

        return $classifications;
    }

    /**
     * Calculer la classe XYZ
     */
    private function calculateXyzClass($articleId)
    {
        $mouvements = MouvementStock::where('article_id', $articleId)
            ->where('type_mouvement', 'sortie')
            ->whereYear('date_mouvement', date('Y'))
            ->select(DB::raw('MONTH(date_mouvement) as mois'), DB::raw('SUM(quantite) as consommation_mensuelle'))
            ->groupBy('mois')
            ->get();

        if ($mouvements->count() <= 1) return 'Z';

        $moyenne = $mouvements->avg('consommation_mensuelle');
        $ecartType = sqrt($mouvements->map(function($m) use ($moyenne) {
            return pow($m->consommation_mensuelle - $moyenne, 2);
        })->sum() / $mouvements->count());

        $cv = $ecartType / $moyenne;

        if ($cv < 0.5) return 'X';
        if ($cv < 1) return 'Y';
        return 'Z';
    }

    /**
     * Obtenir les recommandations
     */
    public function getRecommendations($classeAbc, $classeXyz)
    {
        if ($classeAbc === 'A' && $classeXyz === 'X') {
            return 'Stock de sécurité optimal, réapprovisionnement automatique';
        }
        if ($classeAbc === 'A' && $classeXyz === 'Z') {
            return 'Prévoir un stock de sécurité élevé, suivi rapproché';
        }
        if ($classeAbc === 'C') {
            return 'Gestion simplifiée, commandes groupées';
        }
        return 'Suivi standard';
    }
}