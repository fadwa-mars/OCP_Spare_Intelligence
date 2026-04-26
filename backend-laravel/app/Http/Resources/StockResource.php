<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'stock_actuel' => (float) $this->stock_actuel,
            'stock_reserve' => (float) $this->stock_reserve,
            'stock_disponible' => (float) $this->stock_disponible,
            'emplacement' => $this->emplacement,
            'date_dernier_mouvement' => $this->date_dernier_mouvement?->format('Y-m-d'),
            'est_critique' => $this->article && $this->stock_actuel <= $this->article->seuil_min,
            'est_rupture' => $this->stock_actuel <= 0,
            'taux_occupation' => $this->article ? round(($this->stock_actuel / $this->article->seuil_max) * 100, 2) : null,
        ];
    }
}