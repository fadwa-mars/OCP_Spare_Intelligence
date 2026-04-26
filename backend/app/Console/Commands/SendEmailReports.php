<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Mail\WeeklyReportMail;
use App\Mail\MonthlyReportMail;
use App\Services\Reporting\ReportService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Console\Command;

class SendEmailReports extends Command
{
    protected $signature = 'reports:send-emails {--type=weekly}';
    protected $description = 'Envoyer les rapports par email aux utilisateurs concernés';

    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        parent::__construct();
        $this->reportService = $reportService;
    }

    public function handle()
    {
        $type = $this->option('type');
        $this->info("Envoi des rapports {$type}...");
        
        $roles = $type === 'weekly' 
            ? ['admin', 'planificateur', 'acheteur']
            : ['admin', 'planificateur'];
        
        $users = User::whereIn('role', $roles)
            ->where('is_active', true)
            ->get();
        
        $periodeDebut = $type === 'weekly' ? now()->startOfWeek() : now()->startOfMonth();
        $periodeFin = $type === 'weekly' ? now()->endOfWeek() : now()->endOfMonth();
        
        $stockReport = $this->reportService->generateStockReport($periodeDebut, $periodeFin);
        $orderReport = $this->reportService->generateOrderReport($periodeDebut, $periodeFin);
        
        $report = [
            'type' => $type,
            'periode' => ['debut' => $periodeDebut, 'fin' => $periodeFin],
            'stock' => $stockReport,
            'commandes' => $orderReport,
        ];
        
        $sent = 0;
        foreach ($users as $user) {
            if ($type === 'weekly') {
                Mail::to($user->email)->send(new WeeklyReportMail($report));
            } else {
                Mail::to($user->email)->send(new MonthlyReportMail($report));
            }
            $sent++;
            $this->line("📧 Email envoyé à: {$user->email}");
        }
        
        $this->info("✅ {$sent} email(s) envoyé(s).");
    }
}