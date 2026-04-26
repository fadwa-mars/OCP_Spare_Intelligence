<?php

namespace App\Events;

use App\Models\Article;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $article;
    public $ancienStock;
    public $nouveauStock;
    public $typeMouvement;

    public function __construct(Article $article, $ancienStock, $nouveauStock, $typeMouvement)
    {
        $this->article = $article;
        $this->ancienStock = $ancienStock;
        $this->nouveauStock = $nouveauStock;
        $this->typeMouvement = $typeMouvement;
    }

    public function broadcastOn()
    {
        return new Channel('stock-updates');
    }

    public function broadcastAs()
    {
        return 'stock.updated';
    }

    public function broadcastWith()
    {
        return [
            'article_id' => $this->article->id,
            'article_designation' => $this->article->designation,
            'ancien_stock' => $this->ancienStock,
            'nouveau_stock' => $this->nouveauStock,
            'type_mouvement' => $this->typeMouvement,
            'variation' => $this->nouveauStock - $this->ancienStock,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}