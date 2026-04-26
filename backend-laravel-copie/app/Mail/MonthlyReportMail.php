<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MonthlyReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reportData;

    public function __construct($reportData)
    {
        $this->reportData = $reportData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rapport Mensuel - OCP Spare Intelligence',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.monthly_report',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}