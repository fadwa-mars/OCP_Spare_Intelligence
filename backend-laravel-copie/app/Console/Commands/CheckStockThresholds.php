<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Alerte;
use App\Services\Alert\AlertService;
use Illuminate\Console\Command;

class CheckStockThresholds extends Command
{
    protected $signature = 'stock:check-thresholds';
    protected $description = 'Vérifier les seuils de stock et créer des alertes si nécessaire';

    protected $alertService;

    public function __construct(AlertService $alertService)
    {
        parent::__construct();
        $this->alertService = $alertService;
    }

    public function handle()
    {
        $this->info('Vérification des seuils de stock...');
        
        $articles = Article::with('stock')->get();
        $alertesCrees = 0;
        
        foreach ($articles as $article) {
            if (!$article->stock) continue;
            
            $stock = $article->stock->stock_actuel;
            $seuilMin = $article->seuil_min;
            
            if ($stock <= $seuilMin) {
                $niveau = $stock <= $seuilMin / 2 ? 'rouge' : 'jaune';
                
                $this->alertService->createAlert(
                    'seuil_min',
                    $niveau,
                    "Stock de l'article {$article->designation} a atteint le seuil minimum ({$stock}/{$seuilMin})",
                    $article->id
                );
                $alertesCrees++;
                $this->line("⚠️ Alerte créée pour: {$article->designation}");
            }
        }
        
        $this->info("✅ Vérification terminée. {$alertesCrees} alertes créées.");
    }
}