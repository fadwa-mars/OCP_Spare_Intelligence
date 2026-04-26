<?php

namespace App\Mail;

use App\Models\Commande;
use App\Models\Relance;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RelanceFournisseurMail extends Mailable
{
    use Queueable, SerializesModels;

    public $commande;
    public $relance;

    public function __construct(Commande $commande, Relance $relance)
    {
        $this->commande = $commande;
        $this->relance = $relance;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Relance Commande N°{$this->commande->numero_bc} - Niveau {$this->relance->niveau}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.relance_fournisseur',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}