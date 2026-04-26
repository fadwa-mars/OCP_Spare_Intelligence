<?php

namespace App\Services\Reporting;

use App\Models\Reporting;
use App\Models\MouvementStock;
use App\Models\Commande;
use App\Models\Article;
use App\Models\Fournisseur;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Générer un rapport de stock
     */
    public function generateStockReport($periodeDebut, $periodeFin)
    {
        $stocks = DB::table('stocks')
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->select(
                'articles.code_sap',
                'articles.designation',
                'articles.categorie',
                'stocks.stock_actuel',
                'stocks.stock_reserve',
                'stocks.stock_disponible',
                'stocks.date_dernier_mouvement'
            )
            ->get();

        return [
            'type' => 'stock',
            'periode' => ['debut' => $periodeDebut, 'fin' => $periodeFin],
            'data' => $stocks,
            'total_articles' => $stocks->count(),
            'valeur_totale' => $stocks->sum('stock_actuel') * 100,
        ];
    }

    /**
     * Générer un rapport de mouvements
     */
    public function generateMovementReport($periodeDebut, $periodeFin)
    {
        $mouvements = MouvementStock::with('article')
            ->whereBetween('date_mouvement', [$periodeDebut, $periodeFin])
            ->get();

        $parType = $mouvements->groupBy('type_mouvement')->map(function($group) {
            return [
                'quantite' => $group->sum('quantite'),
                'nombre' => $group->count(),
            ];
        });

        return [
            'type' => 'mouvements',
            'periode' => ['debut' => $periodeDebut, 'fin' => $periodeFin],
            'data' => $mouvements,
            'par_type' => $parType,
            'total_mouvements' => $mouvements->count(),
        ];
    }

    /**
     * Générer un rapport de commandes
     */
    public function generateOrderReport($periodeDebut, $periodeFin)
    {
        $commandes = Commande::with(['fournisseur', 'user'])
            ->whereBetween('date_commande', [$periodeDebut, $periodeFin])
            ->get();

        $parStatut = $commandes->groupBy('statut')->map(function($group) {
            return [
                'nombre' => $group->count(),
                'montant' => $group->sum('montant_total'),
            ];
        });

        return [
            'type' => 'commandes',
            'periode' => ['debut' => $periodeDebut, 'fin' => $periodeFin],
            'data' => $commandes,
            'par_statut' => $parStatut,
            'total_commandes' => $commandes->count(),
            'montant_total' => $commandes->sum('montant_total'),
        ];
    }

    /**
     * Générer un rapport fournisseurs
     */
    public function generateSupplierReport()
    {
        $fournisseurs = Fournisseur::orderBy('score_global', 'desc')->get();

        return [
            'type' => 'fournisseurs',
            'data' => $fournisseurs,
            'top_5' => $fournisseurs->take(5),
            'moyenne_score' => $fournisseurs->avg('score_global'),
        ];
    }

    /**
     * Sauvegarder un rapport
     */
    public function saveReport($type, $periodeDebut, $periodeFin, $contenu, $userId)
    {
        return Reporting::create([
            'type' => $type,
            'periode_debut' => $periodeDebut,
            'periode_fin' => $periodeFin,
            'contenu' => $contenu,
            'date_generation' => now(),
            'user_id' => $userId,
        ]);
    }
}