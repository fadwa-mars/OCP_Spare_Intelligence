<?php

namespace App\Mail;

use App\Models\AppelOffre;
use App\Models\Offre;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenderResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public $appelOffre;
    public $offreGagnante;

    public function __construct(AppelOffre $appelOffre, Offre $offreGagnante = null)
    {
        $this->appelOffre = $appelOffre;
        $this->offreGagnante = $offreGagnante;
    }

    public function envelope(): Envelope
    {
        $subject = $this->offreGagnante 
            ? "🏆 Résultat Appel d'offres N°{$this->appelOffre->id} - Offre retenue"
            : "📢 Appel d'offres clôturé N°{$this->appelOffre->id}";

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tender_result',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}