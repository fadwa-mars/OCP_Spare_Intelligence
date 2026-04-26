<?php

namespace App\Console\Commands;

use App\Services\Inventory\DeadStockDetectionService;
use Illuminate\Console\Command;

class DetectDeadStock extends Command
{
    protected $signature = 'stock:detect-dead {--months=6,12,18,24}';
    protected $description = 'Détecter les stocks morts (sans mouvement)';

    protected $deadStockService;

    public function __construct(DeadStockDetectionService $deadStockService)
    {
        parent::__construct();
        $this->deadStockService = $deadStockService;
    }

    public function handle()
    {
        $months = explode(',', $this->option('months'));
        $months = array_map('intval', $months);
        
        $this->info('Détection des stocks morts...');
        $this->line('Périodes: ' . implode(', ', $months) . ' mois');
        
        $results = $this->deadStockService->detectDeadStock($months);
        
        $this->newLine();
        $this->table(
            ['Article', 'Code SAP', 'Stock actuel', 'Mois sans mouvement', 'Valeur'],
            collect($results)->map(function($item) {
                return [
                    $item['article']->designation,
                    $item['article']->code_sap,
                    $item['stock_actuel'],
                    $item['mois_sans_mouvement'],
                    number_format($item['valeur_stock'], 2) . ' €',
                ];
            })
        );
        
        $this->newLine();
        $this->info("✅ Détection terminée. " . count($results) . " stocks morts détectés.");
    }
}