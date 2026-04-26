<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MouvementStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'commande_id' => $this->commande_id,
            'commande' => new CommandeResource($this->whenLoaded('commande')),
            'type_mouvement' => $this->type_mouvement,
            'quantite' => (float) $this->quantite,
            'reference_externe' => $this->reference_externe,
            'commentaire' => $this->commentaire,
            'date_mouvement' => $this->date_mouvement?->format('Y-m-d H:i:s'),
        ];
    }
}