<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyReportMail extends Mailable
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
            subject: 'Rapport Hebdomadaire - OCP Spare Intelligence',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.weekly_report',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}