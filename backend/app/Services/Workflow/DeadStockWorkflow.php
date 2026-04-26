<?php

namespace App\Services\Workflow;

use App\Models\Article;
use App\Services\Inventory\DeadStockDetectionService;
use App\Services\Alert\AlertService;

class DeadStockWorkflow
{
    protected $deadStockDetectionService;
    protected $alertService;

    public function __construct(DeadStockDetectionService $deadStockDetectionService, AlertService $alertService)
    {
        $this->deadStockDetectionService = $deadStockDetectionService;
        $this->alertService = $alertService;
    }

    /**
     * Détecter et traiter les stocks morts
     */
    public function process()
    {
        $deadStocks = $this->deadStockDetectionService->detectDeadStock();
        
        foreach ($deadStocks as $deadStock) {
            $this->processDeadStockItem($deadStock['article']);
        }

        return $deadStocks;
    }

    /**
     * Traiter un article en stock mort
     */
    public function processDeadStockItem($article)
    {
        $actions = $this->getAvailableActions($article);
        
        // Créer une alerte
        $this->alertService->createAlert(
            'stock_mort',
            'jaune',
            "Article {$article->designation} détecté comme stock mort. Actions disponibles : " . implode(', ', array_keys($actions)),
            $article->id
        );

        return $actions;
    }

    /**
     * Actions disponibles pour un stock mort
     */
    public function getAvailableActions($article)
    {
        return [
            'transfert' => [
                'label' => 'Transférer vers un autre site',
                'description' => 'Proposer le transfert de stock vers un autre site ayant besoin de cet article',
            ],
            'cession' => [
                'label' => 'Cession à prix réduit',
                'description' => 'Proposer une cession à prix réduit pour écouler le stock',
            ],
            'revision' => [
                'label' => 'Réviser les seuils',
                'description' => 'Réviser à la baisse les seuils d\'approvisionnement',
            ],
            'destruction' => [
                'label' => 'Planifier la destruction',
                'description' => 'Planifier la destruction des articles obsolètes',
            ],
        ];
    }

    /**
     * Exécuter une action sur un stock mort
     */
    public function executeAction($articleId, $action, $userId)
    {
        $article = Article::find($articleId);
        
        if (!$article) {
            throw new \Exception('Article non trouvé');
        }

        $actions = $this->getAvailableActions($article);
        
        if (!isset($actions[$action])) {
            throw new \Exception('Action non valide');
        }

        // Créer un suivi de l'action
        $this->logAction($articleId, $action, $userId);

        return [
            'success' => true,
            'action' => $action,
            'message' => "Action '{$actions[$action]['label']}' planifiée avec succès",
        ];
    }

    /**
     * Journaliser l'action
     */
    private function logAction($articleId, $action, $userId)
    {
        // Log dans la base de données ou fichier
        \Log::info("Action stock mort", [
            'article_id' => $articleId,
            'action' => $action,
            'user_id' => $userId,
            'date' => now(),
        ]);
    }

    /**
     * Rapport des stocks morts
     */
    public function getReport()
    {
        $deadStocks = $this->deadStockDetectionService->detectDeadStock();
        
        $report = [
            'total_articles_morts' => count($deadStocks),
            'valeur_totale' => collect($deadStocks)->sum('valeur_stock'),
            'par_periode' => collect($deadStocks)->groupBy('mois_sans_mouvement')->map(function($group) {
                return [
                    'nombre' => $group->count(),
                    'valeur' => $group->sum('valeur_stock'),
                ];
            }),
            'details' => $deadStocks,
        ];

        return $report;
    }
}