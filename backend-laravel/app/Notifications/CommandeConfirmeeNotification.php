<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CommandeConfirmeeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $commande;

    public function __construct(Commande $commande)
    {
        $this->commande = $commande;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $estRecue = $this->commande->statut === 'recue';

        return (new MailMessage)
            ->subject($estRecue ? '📦 Commande réceptionnée' : '📋 Confirmation de commande')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($estRecue 
                ? "La commande **N°{$this->commande->numero_bc}** a été réceptionnée avec succès."
                : "La commande **N°{$this->commande->numero_bc}** a été confirmée.")
            ->line("🏭 **Fournisseur:** {$this->commande->fournisseur->nom}")
            ->line("💰 **Montant total:** " . number_format($this->commande->montant_total, 2) . " €")
            ->line("📅 **Date de livraison prévue:** {$this->commande->date_livraison_prevue->format('d/m/Y')}")
            ->when($estRecue, function ($mail) {
                return $mail->line("📅 **Date de réception:** {$this->commande->date_livraison_reelle->format('d/m/Y')}");
            })
            ->when(!$estRecue && $this->commande->date_livraison_prevue->isPast(), function ($mail) {
                return $mail->line('⚠️ **Attention:** Cette commande est en retard.');
            })
            ->action('Voir la commande', url("/commandes/{$this->commande->id}"))
            ->line('Merci de votre attention.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'commande_confirmation',
            'commande_id' => $this->commande->id,
            'numero_bc' => $this->commande->numero_bc,
            'statut' => $this->commande->statut,
            'fournisseur' => $this->commande->fournisseur->nom,
            'montant_total' => $this->commande->montant_total,
            'date_livraison_prevue' => $this->commande->date_livraison_prevue->format('Y-m-d'),
            'est_retardee' => $this->commande->date_livraison_prevue->isPast() && $this->commande->statut !== 'recue',
            'message' => $this->commande->statut === 'recue' 
                ? "Commande {$this->commande->numero_bc} réceptionnée"
                : "Commande {$this->commande->numero_bc} confirmée",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}