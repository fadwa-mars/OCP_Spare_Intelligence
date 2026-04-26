<?php

namespace App\Mail;

use App\Models\DemandeAchat;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $demande;
    public $status;

    public function __construct(DemandeAchat $demande, $status = 'pending')
    {
        $this->demande = $demande;
        $this->status = $status;
    }

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved' 
            ? "✅ Demande d'achat approuvée N°{$this->demande->id}"
            : "📋 Nouvelle demande d'achat à approuver N°{$this->demande->id}";

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approval_request',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}