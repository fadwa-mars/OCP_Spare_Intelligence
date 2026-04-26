<?php

namespace App\Console\Commands;

use App\Services\Reporting\ReportService;
use App\Services\Reporting\EmailReportService;
use Illuminate\Console\Command;

class GeneratePeriodicReports extends Command
{
    protected $signature = 'reports:generate {--type=weekly}';
    protected $description = 'Générer les rapports périodiques (hebdomadaires/mensuels)';

    protected $reportService;
    protected $emailService;

    public function __construct(ReportService $reportService, EmailReportService $emailService)
    {
        parent::__construct();
        $this->reportService = $reportService;
        $this->emailService = $emailService;
    }

    public function handle()
    {
        $type = $this->option('type');
        
        $this->info("Génération du rapport {$type}...");
        
        $periodeDebut = $type === 'weekly' ? now()->startOfWeek() : now()->startOfMonth();
        $periodeFin = $type === 'weekly' ? now()->endOfWeek() : now()->endOfMonth();
        
        // Générer les différents rapports
        $stockReport = $this->reportService->generateStockReport($periodeDebut, $periodeFin);
        $movementReport = $this->reportService->generateMovementReport($periodeDebut, $periodeFin);
        $orderReport = $this->reportService->generateOrderReport($periodeDebut, $periodeFin);
        
        // Sauvegarder
        $report = $this->reportService->saveReport(
            $type,
            $periodeDebut,
            $periodeFin,
            [
                'stock' => $stockReport,
                'mouvements' => $movementReport,
                'commandes' => $orderReport,
            ],
            1
        );
        
        $this->info("✅ Rapport généré et sauvegardé (ID: {$report->id})");
        
        // Envoyer par email
        $this->emailService->sendWeeklyReport($report);
        $this->info("📧 Rapport envoyé par email");
    }
}