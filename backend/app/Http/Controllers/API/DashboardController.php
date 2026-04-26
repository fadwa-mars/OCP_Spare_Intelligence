<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Stock;
use App\Models\Commande;
use App\Models\DemandeAchat;
use App\Models\Alerte;
use App\Models\Fournisseur;
use App\Models\MouvementStock;
use App\Models\ClassificationAbcXyz;
use App\Models\User;
use App\Models\AppelOffre;
use App\Models\SimulationWhatIf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard principal - KPIs communs
     */
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;

        $data = [
            'total_articles' => Article::count(),
            'total_fournisseurs' => Fournisseur::count(),
            'alertes_non_traitees' => Alerte::where('est_traitee', false)->count(),
            'commandes_en_attente' => Commande::where('statut', 'en_attente')->count(),
        ];

        switch ($role) {
            case 'admin':
                $data['total_users'] = User::count();
                $data['total_commandes'] = Commande::count();
                $data['valeur_stock_total'] = $this->getValeurStockTotal();
                break;
            case 'planificateur':
                $data['stock_critique'] = Stock::whereHas('article', function($query) {
                    $query->whereRaw('stocks.stock_actuel <= articles.seuil_min');
                })->count();
                $data['classification_a'] = ClassificationAbcXyz::where('classe_abc', 'A')->count();
                break;
            case 'acheteur':
                $data['demandes_approuvees'] = DemandeAchat::where('statut', 'approuvee')->count();
                $data['commandes_en_cours'] = Commande::where('statut', 'confirmee')->count();
                break;
            case 'magasinier':
                $data['stock_total'] = Stock::sum('stock_actuel');
                $data['receptions_semaine'] = MouvementStock::where('type_mouvement', 'entree')
                    ->where('date_mouvement', '>=', now()->startOfWeek())
                    ->count();
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * KPIs détaillés par rôle
     */
    public function kpis(Request $request)
    {
        $user = auth()->user();
        $role = $user->role;
        $period = $request->period ?? 'month';

        $kpis = [];

        switch ($role) {
            case 'admin':
                $kpis = [
                    'total_users' => User::count(),
                    'total_articles' => Article::count(),
                    'total_commandes' => Commande::count(),
                    'total_fournisseurs' => Fournisseur::count(),
                    'chiffre_affaires' => Commande::sum('montant_total'),
                    'alertes_rouges' => Alerte::where('niveau', 'rouge')->where('est_traitee', false)->count(),
                    'evolution' => '+12%',
                ];
                break;
            case 'planificateur':
                $kpis = [
                    'total_articles' => Article::count(),
                    'stock_critique' => Stock::whereHas('article', function($query) {
                        $query->whereRaw('stocks.stock_actuel <= articles.seuil_min');
                    })->count(),
                    'articles_classification_a' => ClassificationAbcXyz::where('classe_abc', 'A')->count(),
                    'articles_classification_b' => ClassificationAbcXyz::where('classe_abc', 'B')->count(),
                    'articles_classification_c' => ClassificationAbcXyz::where('classe_abc', 'C')->count(),
                    'simulations_realisees' => SimulationWhatIf::count() ?? 0,
                    'evolution' => '-3%',
                ];
                break;
            case 'acheteur':
                $kpis = [
                    'demandes_approuvees' => DemandeAchat::where('statut', 'approuvee')->count(),
                    'commandes_en_cours' => Commande::where('statut', 'confirmee')->count(),
                    'fournisseurs_actifs' => Fournisseur::where('est_actif', true)->count(),
                    'appels_offres_ouverts' => AppelOffre::where('statut', 'publie')->count(),
                    'delais_livraison_moyen' => round(Commande::whereNotNull('date_livraison_reelle')
                        ->select(DB::raw('AVG(DATEDIFF(date_livraison_reelle, date_livraison_prevue)) as delai'))
                        ->value('delai') ?? 0, 1),
                    'evolution' => '+5%',
                ];
                break;
            case 'magasinier':
                $kpis = [
                    'stock_total' => round(Stock::sum('stock_actuel'), 2),
                    'receptions_mois' => MouvementStock::where('type_mouvement', 'entree')
                        ->where('date_mouvement', '>=', now()->startOfMonth())
                        ->count(),
                    'sorties_mois' => MouvementStock::where('type_mouvement', 'sortie')
                        ->where('date_mouvement', '>=', now()->startOfMonth())
                        ->count(),
                    'alertes_rouges' => Alerte::where('niveau', 'rouge')->where('est_traitee', false)->count(),
                    'evolution' => '+8%',
                ];
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $kpis
        ]);
    }

    /**
     * Données pour les graphiques
     */
    public function charts()
    {
        $stockEvolution = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $stockMoyen = Stock::avg('stock_actuel') ?? 0;
            $stockEvolution[] = [
                'month' => $date->format('M'),
                'value' => round($stockMoyen, 2)
            ];
        }

        $topArticles = MouvementStock::where('type_mouvement', 'sortie')
            ->select('article_id', DB::raw('SUM(quantite) as total'))
            ->with('article')
            ->groupBy('article_id')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        $consumptionData = [];
        foreach ($topArticles as $article) {
            $consumptionData[] = [
                'label' => $article->article->designation ?? 'N/A',
                'value' => round($article->total, 2)
            ];
        }

        $alertesByType = Alerte::select('type', DB::raw('COUNT(*) as total'))
            ->where('est_traitee', false)
            ->groupBy('type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stock_evolution' => $stockEvolution,
                'top_consumption' => $consumptionData,
                'alertes_by_type' => $alertesByType
            ]
        ]);
    }

    /**
     * Liste des stocks critiques
     */
    public function stockCritique()
    {
        $stocks = Stock::with('article')
            ->whereHas('article', function($query) {
                $query->whereRaw('stocks.stock_actuel <= articles.seuil_min');
            })
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'article_id' => $stock->article_id,
                    'article_designation' => $stock->article->designation,
                    'code_sap' => $stock->article->code_sap,
                    'stock_actuel' => $stock->stock_actuel,
                    'seuil_min' => $stock->article->seuil_min,
                    'urgence' => $stock->stock_actuel <= $stock->article->seuil_min / 2 ? 'critique' : 'warning'
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $stocks
        ]);
    }

    /**
     * Statistiques générales
     */
    public function stats()
    {
        $user = auth()->user();
        $role = $user->role;

        $stats = [
            'total_articles' => Article::count(),
            'total_fournisseurs' => Fournisseur::count(),
            'alertes_non_traitees' => Alerte::where('est_traitee', false)->count(),
            'commandes_en_attente' => Commande::where('statut', 'en_attente')->count(),
        ];

        switch ($role) {
            case 'admin':
                $stats['total_users'] = User::count();
                $stats['total_commandes'] = Commande::count();
                $stats['valeur_stock_total'] = $this->getValeurStockTotal();
                break;
            case 'planificateur':
                $stats['stock_critique'] = Stock::whereHas('article', function($query) {
                    $query->whereRaw('stocks.stock_actuel <= articles.seuil_min');
                })->count();
                $stats['classification_a'] = ClassificationAbcXyz::where('classe_abc', 'A')->count();
                break;
            case 'acheteur':
                $stats['demandes_approuvees'] = DemandeAchat::where('statut', 'approuvee')->count();
                $stats['commandes_en_cours'] = Commande::where('statut', 'confirmee')->count();
                break;
            case 'magasinier':
                $stats['stock_total'] = round(Stock::sum('stock_actuel'), 2);
                $stats['receptions_semaine'] = MouvementStock::where('type_mouvement', 'entree')
                    ->where('date_mouvement', '>=', now()->startOfWeek())
                    ->count();
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Évolution du stock (pour graphique line)
     */
    public function stockEvolution(Request $request)
    {
        $months = $request->months ?? 6;
        $evolution = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');

            $stockMoyen = Stock::avg('stock_actuel') ?? 0;

            $evolution[] = [
                'month' => $monthName,
                'stock' => round($stockMoyen, 2)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => collect($evolution)->pluck('month'),
                'values' => collect($evolution)->pluck('stock')
            ]
        ]);
    }

    /**
     * Statistiques de consommation (pour graphique bar)
     */
    public function consumptionStats()
    {
        $topArticles = MouvementStock::where('type_mouvement', 'sortie')
            ->select('article_id', DB::raw('SUM(quantite) as total'))
            ->with('article')
            ->groupBy('article_id')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'labels' => $topArticles->pluck('article.designation'),
                'values' => $topArticles->pluck('total')
            ]
        ]);
    }

    /**
     * Activités récentes
     */
    public function recentActivities(Request $request)
    {
        $limit = $request->limit ?? 10;
        $activities = [];

        // Mouvements de stock
        $movements = MouvementStock::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        foreach ($movements as $movement) {
            $activities[] = [
                'id' => $movement->id,
                'action' => $this->getMovementAction($movement),
                'user' => $movement->user->name ?? 'Système',
                'time' => $movement->created_at->diffForHumans(),
                'type' => 'movement'
            ];
        }

        // Commandes
        $commandes = Commande::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        foreach ($commandes as $commande) {
            $activities[] = [
                'id' => $commande->id,
                'action' => $this->getCommandeAction($commande),
                'user' => $commande->user->name ?? 'Système',
                'time' => $commande->created_at->diffForHumans(),
                'type' => 'commande'
            ];
        }

        // Demandes d'achat
        $demandes = DemandeAchat::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        foreach ($demandes as $demande) {
            $activities[] = [
                'id' => $demande->id,
                'action' => $this->getDemandeAction($demande),
                'user' => $demande->user->name ?? 'Système',
                'time' => $demande->created_at->diffForHumans(),
                'type' => 'demande'
            ];
        }

        // Trier par date et limiter
        $activities = collect($activities)->sortByDesc('time')->take($limit)->values();

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    // Méthodes privées
    private function getValeurStockTotal()
    {
        return Stock::sum(DB::raw('stock_actuel * 100'));
    }

    private function getMovementAction($movement)
    {
        $types = [
            'entree' => 'Nouvelle entrée de stock',
            'sortie' => 'Sortie de stock effectuée',
            'reservation' => 'Réservation de stock',
            'annulation' => 'Annulation de mouvement'
        ];
        return $types[$movement->type_mouvement] ?? 'Mouvement de stock';
    }

    private function getCommandeAction($commande)
    {
        $statuts = [
            'confirmee' => 'Commande confirmée',
            'expediee' => 'Commande expédiée',
            'recue' => 'Commande réceptionnée',
            'annulee' => 'Commande annulée',
            'en_attente' => 'Nouvelle commande créée'
        ];
        return $statuts[$commande->statut] ?? 'Commande mise à jour';
    }

    private function getDemandeAction($demande)
    {
        $statuts = [
            'soumise' => 'Demande d\'achat soumise',
            'approuvee' => 'Demande d\'achat approuvée',
            'rejetee' => 'Demande d\'achat rejetée',
            'transformee_en_commande' => 'Demande transformée en commande'
        ];
        return $statuts[$demande->statut] ?? 'Demande d\'achat créée';
    }
}