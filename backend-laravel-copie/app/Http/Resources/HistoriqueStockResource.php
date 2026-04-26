<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoriqueStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'stock_avant' => (float) $this->stock_avant,
            'stock_apres' => (float) $this->stock_apres,
            'quantite_change' => (float) $this->quantite_change,
            'type_mouvement' => $this->type_mouvement,
            'reference' => $this->reference,
            'date_mouvement' => $this->date_mouvement?->format('Y-m-d H:i:s'),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}