<?php

namespace App\Events;

use App\Models\Article;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockThresholdExceeded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $article;
    public $stockActuel;
    public $seuilMin;

    public function __construct(Article $article, $stockActuel, $seuilMin)
    {
        $this->article = $article;
        $this->stockActuel = $stockActuel;
        $this->seuilMin = $seuilMin;
    }

    public function broadcastOn()
    {
        return new Channel('stock-alerts');
    }

    public function broadcastAs()
    {
        return 'stock.threshold.exceeded';
    }

    public function broadcastWith()
    {
        return [
            'article_id' => $this->article->id,
            'article_designation' => $this->article->designation,
            'stock_actuel' => $this->stockActuel,
            'seuil_min' => $this->seuilMin,
            'message' => "Stock de {$this->article->designation} a atteint le seuil minimum",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}