<?php

namespace App\Console\Commands;

use App\Models\Fournisseur;
use App\Services\Supplier\SupplierScoringService;
use Illuminate\Console\Command;

class CalculateSupplierScores extends Command
{
    protected $signature = 'supplier:calculate-scores';
    protected $description = 'Recalculer les scores de tous les fournisseurs';

    protected $scoringService;

    public function __construct(SupplierScoringService $scoringService)
    {
        parent::__construct();
        $this->scoringService = $scoringService;
    }

    public function handle()
    {
        $this->info('Calcul des scores fournisseurs...');
        
        $fournisseurs = Fournisseur::where('est_actif', true)->get();
        $progressBar = $this->output->createProgressBar($fournisseurs->count());
        
        foreach ($fournisseurs as $fournisseur) {
            $score = $this->scoringService->calculateScore($fournisseur->id);
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        
        $this->info('✅ Scores recalculés pour ' . $fournisseurs->count() . ' fournisseurs.');
        
        // Afficher le top 5
        $top5 = Fournisseur::orderBy('score_global', 'desc')->limit(5)->get();
        $this->newLine();
        $this->line('Top 5 des fournisseurs:');
        
        foreach ($top5 as $fournisseur) {
            $this->line("  - {$fournisseur->nom}: {$fournisseur->score_global} pts");
        }
    }
}