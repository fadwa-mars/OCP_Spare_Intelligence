<?php

namespace App\Notifications;

use App\Models\Article;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class StockThresholdNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $article;
    protected $stockActuel;
    protected $seuilMin;

    public function __construct(Article $article, $stockActuel, $seuilMin)
    {
        $this->article = $article;
        $this->stockActuel = $stockActuel;
        $this->seuilMin = $seuilMin;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $pourcentage = round(($this->stockActuel / $this->seuilMin) * 100, 2);
        $estCritique = $this->stockActuel <= $this->seuilMin / 2;

        return (new MailMessage)
            ->subject($estCritique ? '⚠️ ALERTE CRITIQUE - Stock minimum atteint' : '⚠️ Alerte - Stock minimum atteint')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("L'article **{$this->article->designation}** (Code SAP: {$this->article->code_sap}) a atteint son seuil minimum.")
            ->line("📊 **Stock actuel:** {$this->stockActuel} {$this->article->unite_mesure}")
            ->line("📉 **Seuil minimum:** {$this->seuilMin} {$this->article->unite_mesure}")
            ->line("📈 **Pourcentage restant:** {$pourcentage}%")
            ->when($estCritique, function ($mail) {
                return $mail->line('🔴 **NIVEAU CRITIQUE** - Une action immédiate est requise !');
            })
            ->action('Voir l\'article', url("/articles/{$this->article->id}"))
            ->line('Merci de prendre les mesures nécessaires pour réapprovisionner le stock.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'stock_threshold',
            'article_id' => $this->article->id,
            'article_designation' => $this->article->designation,
            'stock_actuel' => $this->stockActuel,
            'seuil_min' => $this->seuilMin,
            'est_critique' => $this->stockActuel <= $this->seuilMin / 2,
            'message' => "L'article {$this->article->designation} a atteint son seuil minimum",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}