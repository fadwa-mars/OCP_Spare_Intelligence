<?php

namespace App\Mail;

use App\Models\Article;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RuptureAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public $article;
    public $stockActuel;
    public $seuilMin;

    public function __construct(Article $article, $stockActuel, $seuilMin)
    {
        $this->article = $article;
        $this->stockActuel = $stockActuel;
        $this->seuilMin = $seuilMin;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⚠️ ALERTE RUPTURE - {$this->article->designation}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rupture_alert',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}