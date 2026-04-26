<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlerteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'niveau' => $this->niveau,
            'message' => $this->message,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'commande_id' => $this->commande_id,
            'commande' => new CommandeResource($this->whenLoaded('commande')),
            'date_creation' => $this->date_creation?->format('Y-m-d H:i:s'),
            'est_traitee' => $this->est_traitee,
            'date_traitement' => $this->date_traitement?->format('Y-m-d H:i:s'),
            'user_traitement_id' => $this->user_traitement_id,
            'user_traitement' => new UserResource($this->whenLoaded('userTraitement')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}