<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reporting;
use App\Models\Article;
use App\Models\MouvementStock;
use App\Models\Commande;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportingController extends Controller
{
    /**
     * Liste des rapports
     */
    public function index(Request $request)
    {
        $query = Reporting::with('user');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $reports = $query->orderBy('date_generation', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Afficher un rapport
     */
    public function show($id)
    {
        $report = Reporting::with('user')->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Rapport non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Générer un rapport hebdomadaire
     */
    public function generateWeekly(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfWeek();
        $endDate = $request->end_date ?? now()->endOfWeek();

        $contenu = $this->generateReportContent($startDate, $endDate, 'hebdomadaire');

        $report = Reporting::create([
            'type' => 'hebdomadaire',
            'periode_debut' => $startDate,
            'periode_fin' => $endDate,
            'contenu' => $contenu,
            'date_generation' => now(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rapport hebdomadaire généré',
            'data' => $report
        ]);
    }

    /**
     * Générer un rapport mensuel
     */
    public function generateMonthly(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth();
        $endDate = $request->end_date ?? now()->endOfMonth();

        $contenu = $this->generateReportContent($startDate, $endDate, 'mensuel');

        $report = Reporting::create([
            'type' => 'mensuel',
            'periode_debut' => $startDate,
            'periode_fin' => $endDate,
            'contenu' => $contenu,
            'date_generation' => now(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rapport mensuel généré',
            'data' => $report
        ]);
    }

    /**
     * Exporter le rapport en PDF
     */
    public function exportPdf($id)
    {
        $report = Reporting::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Rapport non trouvé'
            ], 404);
        }

        $pdf = PDF::loadView('pdf.report', ['report' => $report]);

        return $pdf->download('rapport_' . $report->type . '_' . $report->id . '.pdf');
    }

    /**
     * Contenu du rapport (méthode privée)
     */
    private function generateReportContent($startDate, $endDate, $type)
    {
        $mouvements = MouvementStock::whereBetween('date_mouvement', [$startDate, $endDate])
            ->select('type_mouvement', DB::raw('SUM(quantite) as total'))
            ->groupBy('type_mouvement')
            ->get();

        $commandes = Commande::whereBetween('date_commande', [$startDate, $endDate])
            ->select('statut', DB::raw('COUNT(*) as total'), DB::raw('SUM(montant_total) as montant'))
            ->groupBy('statut')
            ->get();

        $topFournisseurs = Commande::whereBetween('date_commande', [$startDate, $endDate])
            ->select('fournisseur_id', DB::raw('COUNT(*) as total_commandes'), DB::raw('SUM(montant_total) as montant_total'))
            ->with('fournisseur')
            ->groupBy('fournisseur_id')
            ->orderBy('montant_total', 'desc')
            ->limit(5)
            ->get();

        $alertes = Alerte::whereBetween('date_creation', [$startDate, $endDate])
            ->select('type', DB::raw('COUNT(*) as total'))
            ->groupBy('type')
            ->get();

        return [
            'periode' => [
                'debut' => $startDate,
                'fin' => $endDate,
                'type' => $type
            ],
            'mouvements_stock' => $mouvements,
            'commandes' => $commandes,
            'top_fournisseurs' => $topFournisseurs,
            'alertes' => $alertes,
            'generated_at' => now()
        ];
    }

    /**
     * Dashboard récapitulatif
     */
    public function dashboard(Request $request)
    {
        $date = $request->date ?? now();

        $data = [
            'total_articles' => Article::count(),
            'total_fournisseurs' => Fournisseur::count(),
            'valeur_stock' => Stock::sum(DB::raw('stock_actuel * 100')), // À ajuster avec prix réel
            'commandes_mois' => Commande::whereMonth('date_commande', $date->month)->count(),
            'alertes_non_traitees' => Alerte::where('est_traitee', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}