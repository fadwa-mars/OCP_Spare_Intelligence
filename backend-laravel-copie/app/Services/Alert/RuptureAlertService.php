<?php

namespace App\Services\Alert;

use App\Models\Article;
use App\Models\Stock;
use App\Models\Alerte;

class RuptureAlertService
{
    /**
     * Détecter les ruptures de stock
     */
    public function detectRuptures()
    {
        $ruptures = Stock::where('stock_actuel', '<=', 0)
            ->with('article')
            ->get();

        $alertes = [];

        foreach ($ruptures as $stock) {
            $alerte = $this->createRuptureAlert($stock->article);
            if ($alerte) {
                $alertes[] = $alerte;
            }
        }

        return $alertes;
    }

    /**
     * Créer une alerte de rupture
     */
    private function createRuptureAlert($article)
    {
        $existingAlert = Alerte::where('type', 'rupture')
            ->where('article_id', $article->id)
            ->where('est_traitee', false)
            ->first();

        if (!$existingAlert) {
            return Alerte::create([
                'type' => 'rupture',
                'niveau' => 'rouge',
                'message' => "Rupture de stock : l'article {$article->designation} (code: {$article->code_sap}) n'est plus disponible",
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }

        return null;
    }

    /**
     * Détecter les ruptures imminentes
     */
    public function detectImminentRuptures($seuil = 0.2)
    {
        $stocks = Stock::with('article')
            ->whereRaw('stock_actuel > 0 AND stock_actuel <= seuil_min * ?', [$seuil])
            ->get();

        $alertes = [];

        foreach ($stocks as $stock) {
            $alerte = $this->createImminentRuptureAlert($stock->article);
            if ($alerte) {
                $alertes[] = $alerte;
            }
        }

        return $alertes;
    }

    /**
     * Créer alerte rupture imminente
     */
    private function createImminentRuptureAlert($article)
    {
        $existingAlert = Alerte::where('type', 'rupture_imminente')
            ->where('article_id', $article->id)
            ->where('est_traitee', false)
            ->first();

        if (!$existingAlert) {
            return Alerte::create([
                'type' => 'rupture_imminente',
                'niveau' => 'jaune',
                'message' => "Rupture imminente : l'article {$article->designation} atteindra bientôt son seuil minimum",
                'article_id' => $article->id,
                'date_creation' => now(),
                'est_traitee' => false,
            ]);
        }

        return null;
    }

    /**
     * Résumé des ruptures
     */
    public function getRuptureSummary()
    {
        return [
            'ruptures_actuelles' => Stock::where('stock_actuel', '<=', 0)->count(),
            'ruptures_imminentes' => Stock::whereRaw('stock_actuel > 0 AND stock_actuel <= seuil_min * 0.2')->count(),
            'articles_critiques' => $this->getCriticalArticles(),
        ];
    }

    /**
     * Articles critiques (rupture + demande en cours)
     */
    private function getCriticalArticles()
    {
        return Stock::where('stock_actuel', '<=', 0)
            ->whereHas('article.demandesAchat', function($query) {
                $query->where('statut', 'approuvee');
            })
            ->with('article')
            ->get()
            ->pluck('article');
    }
}