<?php

namespace App\Events;

use App\Models\Article;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RuptureImminenteDetected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $article;
    public $stockActuel;
    public $consommationMoyenne;

    public function __construct(Article $article, $stockActuel, $consommationMoyenne)
    {
        $this->article = $article;
        $this->stockActuel = $stockActuel;
        $this->consommationMoyenne = $consommationMoyenne;
    }

    public function broadcastOn()
    {
        return new Channel('rupture-alerts');
    }

    public function broadcastAs()
    {
        return 'rupture.imminente';
    }

    public function broadcastWith()
    {
        $joursRestants = $this->stockActuel / $this->consommationMoyenne;
        
        return [
            'article_id' => $this->article->id,
            'article_designation' => $this->article->designation,
            'stock_actuel' => $this->stockActuel,
            'jours_restants' => round($joursRestants, 1),
            'message' => "Rupture imminente pour {$this->article->designation} dans environ {$joursRestants} jours",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}