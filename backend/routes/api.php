<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\FournisseurController;
use App\Http\Controllers\API\StockController;
use App\Http\Controllers\API\DemandeAchatController;
use App\Http\Controllers\API\AppelOffreController;
use App\Http\Controllers\API\CommandeController;
use App\Http\Controllers\API\MouvementStockController;
use App\Http\Controllers\API\AlerteController;
use App\Http\Controllers\API\RelanceController;
use App\Http\Controllers\API\ReportingController;
use App\Http\Controllers\API\SapImportController;
use App\Http\Controllers\API\OffreController;
use App\Http\Controllers\API\LigneCommandeController;
use App\Http\Controllers\API\HistoriqueStockController;
use App\Http\Controllers\API\SeuilHistoriqueController;
use App\Http\Controllers\API\ClassificationController;
use App\Http\Controllers\API\SimulationController;
use App\Http\Controllers\API\OffreFournisseurController;
use App\Http\Controllers\API\AIController;
use Illuminate\Support\Facades\Route;

// ============================================
// ROUTES PUBLIQUES (Authentification)
// ============================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// ============================================
// ROUTES IA (Service Intelligence Artificielle)
// ============================================
Route::prefix('ai')->group(function () {
    Route::get('/health', [AIController::class, 'health']);
    Route::get('/dashboard', [AIController::class, 'dashboard']);
    Route::get('/predict/{articleId}', [AIController::class, 'predictConsumption']);
    Route::get('/anomalies/{articleId}', [AIController::class, 'detectAnomalies']);
    Route::get('/criticalities', [AIController::class, 'calculateAllCriticalities']);
});

// ============================================
// ROUTES PROTÉGÉES (JWT)
// ============================================
Route::middleware(['auth:sanctum', 'auth.jwt', 'check.status'])->group(function () {
    
    // Authentification
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']); 
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('/dashboard/charts', [DashboardController::class, 'charts']);
    Route::get('/dashboard/stock-critique', [DashboardController::class, 'stockCritique']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/stock-evolution', [DashboardController::class, 'stockEvolution']);
    Route::get('/dashboard/consumption-stats', [DashboardController::class, 'consumptionStats']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
    
    // ============================================
    // ROUTES POUR FOURNISSEURS (AVANT les autres)
    // ============================================
    Route::middleware(['role:fournisseur'])->prefix('fournisseur')->group(function () {
        // Appels d'offres disponibles
        Route::get('/appels-offres', [AppelOffreController::class, 'index']);
        Route::get('/appels-offres/{id}', [AppelOffreController::class, 'show']);
        
        // Gestion des offres
        Route::post('/appels-offres/{appelOffreId}/offres', [OffreFournisseurController::class, 'store']);
        Route::get('/mes-offres', [OffreFournisseurController::class, 'myOffers']);
        Route::get('/mes-offres/{id}', [OffreFournisseurController::class, 'show']);
        Route::put('/mes-offres/{id}', [OffreFournisseurController::class, 'update']);
        Route::delete('/mes-offres/{id}', [OffreFournisseurController::class, 'destroy']);
        
        // Commandes fournisseur
        Route::get('/mes-commandes', [CommandeController::class, 'getFournisseurCommandes']);
        Route::get('/mes-commandes/{id}', [CommandeController::class, 'show']);
        Route::put('/commandes/{id}/confirm', [CommandeController::class, 'confirm']);
        Route::delete('/commandes/{id}/cancel', [CommandeController::class, 'cancel']);
    });
    
    // ============================================
    // ROUTES ACCESSIBLES À TOUS (GET uniquement)
    // ============================================
    // Articles
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{id}', [ArticleController::class, 'show']);
    Route::get('/articles/categories/list', [ArticleController::class, 'categories']);
    
    // Fournisseurs
    Route::get('/fournisseurs', [FournisseurController::class, 'index']);
    Route::get('/fournisseurs/{id}', [FournisseurController::class, 'show']);
    
    // Stocks
    Route::get('/stocks', [StockController::class, 'index']);
    Route::get('/stocks/article/{articleId}', [StockController::class, 'byArticle']);
    Route::get('/stocks/critique/list', [StockController::class, 'critique']);
    Route::get('/stocks/{id}', [StockController::class, 'show']);
    
    // Appels d'offres (GET pour tous)
    Route::get('/appels-offres', [AppelOffreController::class, 'index']);
    Route::get('/appels-offres/{id}', [AppelOffreController::class, 'show']);
    
    // ============================================
    // ROUTES POUR ADMIN, ACHETEUR, PLANIFICATEUR, MAGASINIER (POST, PUT, DELETE)
    // ============================================
    Route::middleware(['role:admin,acheteur,planificateur,magasinier'])->group(function () {
        
        // Articles
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::put('/articles/{id}', [ArticleController::class, 'update']);
        Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
        
        // Fournisseurs
        Route::post('/fournisseurs', [FournisseurController::class, 'store']);
        Route::put('/fournisseurs/{id}', [FournisseurController::class, 'update']);
        Route::delete('/fournisseurs/{id}', [FournisseurController::class, 'destroy']);
        Route::post('/fournisseurs/{id}/evaluate', [FournisseurController::class, 'evaluate']);
        
        // Stocks
        Route::post('/stocks/movement', [StockController::class, 'movement']);
        Route::put('/stocks/{id}', [StockController::class, 'update']);
        
        // Demandes d'achat
        Route::apiResource('demandes', DemandeAchatController::class);
        Route::post('/demandes/{id}/submit', [DemandeAchatController::class, 'submit']);
        Route::post('/demandes/{id}/approve', [DemandeAchatController::class, 'approve']);
        Route::post('/demandes/{id}/reject', [DemandeAchatController::class, 'reject']);
        
        // Appels d'offres (POST, PUT, DELETE)
        Route::post('/appels-offres', [AppelOffreController::class, 'store']);
        Route::put('/appels-offres/{id}', [AppelOffreController::class, 'update']);
        Route::delete('/appels-offres/{id}', [AppelOffreController::class, 'destroy']);
        Route::post('/appels-offres/{id}/close', [AppelOffreController::class, 'close']);
        Route::post('/appels-offres/{id}/select-winner', [AppelOffreController::class, 'selectWinner']);
        
        // Offres
        Route::get('/offres', [OffreController::class, 'index']);
        Route::get('/offres/{id}', [OffreController::class, 'show']);
        Route::post('/offres/{id}/select', [OffreController::class, 'selectWinner']);
        Route::get('/appels-offres/{appelId}/offres/compare', [OffreController::class, 'compare']);
        Route::post('/appels-offres/{appelId}/offres/evaluate', [OffreController::class, 'evaluate']);
        
        // Commandes
        Route::get('/commandes', [CommandeController::class, 'index']);
        Route::get('/commandes/{id}', [CommandeController::class, 'show']);
        Route::post('/commandes', [CommandeController::class, 'store']);
        Route::put('/commandes/{id}', [CommandeController::class, 'update']);
        Route::delete('/commandes/{id}', [CommandeController::class, 'destroy']);
        Route::post('/commandes/{id}/receive', [CommandeController::class, 'receive']);
        Route::post('/commandes/{id}/cancel', [CommandeController::class, 'cancel']);
        
        // Lignes de commande
        Route::apiResource('lignes-commande', LigneCommandeController::class);
        Route::get('/commandes/{commandeId}/lignes', [LigneCommandeController::class, 'byCommande']);
        Route::get('/commandes/{commandeId}/recap', [LigneCommandeController::class, 'recap']);
        
        // Mouvements de stock
        Route::apiResource('mouvements', MouvementStockController::class);
        Route::get('/mouvements/article/{articleId}', [MouvementStockController::class, 'byArticle']);
        Route::get('/mouvements/stats/summary', [MouvementStockController::class, 'stats']);
        
        // Alertes
        Route::apiResource('alertes', AlerteController::class);
        Route::put('/alertes/{id}/treat', [AlerteController::class, 'markAsTreated']);
        Route::get('/alertes/urgent/list', [AlerteController::class, 'urgent']);
        Route::get('/alertes/count/summary', [AlerteController::class, 'count']);
        
        // Relances
        Route::apiResource('relances', RelanceController::class);
        Route::post('/relances/{id}/answer', [RelanceController::class, 'markAsAnswered']);
        Route::get('/commandes/{commandeId}/relances', [RelanceController::class, 'byCommande']);
        Route::get('/commandes/{commandeId}/next-relance', [RelanceController::class, 'nextEscalation']);
        
        // Reporting
        Route::apiResource('reportings', ReportingController::class);
        Route::post('/reports/weekly', [ReportingController::class, 'generateWeekly']);
        Route::post('/reports/monthly', [ReportingController::class, 'generateMonthly']);
        Route::get('/reports/{id}/export-pdf', [ReportingController::class, 'exportPdf']);
        Route::get('/reports/dashboard/summary', [ReportingController::class, 'dashboard']);
        
        // Historique
        Route::apiResource('historique-stocks', HistoriqueStockController::class);
        Route::get('/historique-stocks/article/{articleId}', [HistoriqueStockController::class, 'byArticle']);
        Route::get('/historique-stocks/article/{articleId}/evolution', [HistoriqueStockController::class, 'evolution']);
        Route::get('/historique-stocks/stats/summary', [HistoriqueStockController::class, 'stats']);
        
        // Seuils historiques
        Route::apiResource('seuil-historiques', SeuilHistoriqueController::class);
        Route::get('/seuil-historiques/article/{articleId}', [SeuilHistoriqueController::class, 'byArticle']);
        Route::get('/seuil-historiques/article/{articleId}/compare', [SeuilHistoriqueController::class, 'compare']);
        
        // Classification ABC/XYZ
        Route::apiResource('classifications', ClassificationController::class);
        Route::post('/classifications/generate', [ClassificationController::class, 'generate']);
        Route::get('/classifications/article/{articleId}', [ClassificationController::class, 'byArticle']);
        Route::get('/classifications/summary/report', [ClassificationController::class, 'summary']);
        Route::get('/classifications/recommendations/list', [ClassificationController::class, 'recommendations']);
        
        // Simulations
        Route::apiResource('simulations', SimulationController::class);
        Route::post('/simulations/{id}/execute', [SimulationController::class, 'execute']);
        Route::post('/simulations/{id}/duplicate', [SimulationController::class, 'duplicate']);
        Route::post('/simulations/compare', [SimulationController::class, 'compare']);
        Route::get('/simulations/templates/list', [SimulationController::class, 'templates']);
        Route::post('/simulations/create-from-template', [SimulationController::class, 'createFromTemplate']);
        
        // SAP Import
        Route::apiResource('sap-imports', SapImportController::class);
        Route::post('/sap/import', [SapImportController::class, 'import']);
        Route::get('/sap/template/download', [SapImportController::class, 'downloadTemplate']);
        Route::post('/sap-imports/{id}/retry', [SapImportController::class, 'retry']);
        Route::get('/sap/stats/summary', [SapImportController::class, 'stats']);
    });
    
    // ============================================
    // ROUTES ADMIN UNIQUEMENT
    // ============================================
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::apiResource('users', AdminController::class);
        Route::put('/users/{id}/toggle-status', [AdminController::class, 'toggleStatus']);
        Route::get('/users/stats/summary', [AdminController::class, 'stats']);
    });
});