<?php

namespace App\Jobs;

use App\Mail\WeeklyReportMail;
use App\Services\Reporting\ReportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailReportJob implements ShouldQueue
{
    use Queueable;

    protected $recipient;
    protected $reportData;
    protected $type;

    public function __construct($recipient, $reportData, $type = 'weekly')
    {
        $this->recipient = $recipient;
        $this->reportData = $reportData;
        $this->type = $type;
    }

    public function handle()
    {
        Log::info('Envoi du rapport par email', [
            'recipient' => $this->recipient,
            'type' => $this->type,
        ]);
        
        try {
            if ($this->type === 'weekly') {
                Mail::to($this->recipient)->send(new WeeklyReportMail($this->reportData));
            } else {
                // MonthlyReportMail::class
            }
            
            Log::info('Email envoyé avec succès', ['recipient' => $this->recipient]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'email', [
                'recipient' => $this->recipient,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}