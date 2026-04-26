<?php

namespace App\Jobs;

use App\Services\Inventory\DeadStockDetectionService;
use App\Services\Alert\AlertService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessDeadStockJob implements ShouldQueue
{
    use Queueable;

    protected $months;
    protected $userId;

    public function __construct($months = [6, 12, 18, 24], $userId = null)
    {
        $this->months = $months;
        $this->userId = $userId;
    }

    public function handle(DeadStockDetectionService $deadStockService, AlertService $alertService)
    {
        Log::info('Démarrage du traitement des stocks morts', ['months' => $this->months]);
        
        $deadStocks = $deadStockService->detectDeadStock($this->months);
        
        Log::info('Stocks morts détectés', ['count' => count($deadStocks)]);
        
        foreach ($deadStocks as $deadStock) {
            $alertService->createAlert(
                'stock_mort',
                $deadStock['mois_sans_mouvement'] >= 18 ? 'rouge' : 'jaune',
                "Article {$deadStock['article']->designation} sans mouvement depuis {$deadStock['mois_sans_mouvement']} mois",
                $deadStock['article']->id
            );
        }
        
        Log::info('Traitement des stocks morts terminé', [
            'dead_stocks_detected' => count($deadStocks),
            'alerts_created' => count($deadStocks),
        ]);
    }
}