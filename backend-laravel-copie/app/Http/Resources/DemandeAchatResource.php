<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandeAchatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'quantite' => (float) $this->quantite,
            'date_demande' => $this->date_demande?->format('Y-m-d'),
            'date_besoin' => $this->date_besoin?->format('Y-m-d'),
            'urgence' => $this->urgence,
            'statut' => $this->statut,
            'appel_offre' => new AppelOffreResource($this->whenLoaded('appelOffre')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}