<?php

namespace App\Notifications;

use App\Models\DemandeAchat;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class DemandeApprouveeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $demande;
    protected $statut;

    public function __construct(DemandeAchat $demande, $statut = 'approuvee')
    {
        $this->demande = $demande;
        $this->statut = $statut;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $estApprouvee = $this->statut === 'approuvee';

        return (new MailMessage)
            ->subject($estApprouvee ? '✅ Demande d\'achat approuvée' : '❌ Demande d\'achat rejetée')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($estApprouvee 
                ? "Votre demande d'achat N°{$this->demande->id} a été **approuvée**."
                : "Votre demande d'achat N°{$this->demande->id} a été **rejetée**.")
            ->line("📦 **Article:** {$this->demande->article->designation}")
            ->line("🔢 **Quantité:** {$this->demande->quantite} {$this->demande->article->unite_mesure}")
            ->line("📅 **Date de besoin:** {$this->demande->date_besoin->format('d/m/Y')}")
            ->line("⚡ **Urgence:** " . strtoupper($this->demande->urgence))
            ->when($estApprouvee, function ($mail) {
                return $mail->action('Suivre la demande', url("/demandes/{$this->demande->id}"));
            })
            ->line('Merci de votre confiance.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'demande_approbation',
            'demande_id' => $this->demande->id,
            'statut' => $this->statut,
            'article_designation' => $this->demande->article->designation,
            'quantite' => $this->demande->quantite,
            'message' => $this->statut === 'approuvee' 
                ? "Votre demande d'achat a été approuvée"
                : "Votre demande d'achat a été rejetée",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}