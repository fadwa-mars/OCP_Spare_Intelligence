<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SimulationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom_simulation' => $this->nom_simulation,
            'description' => $this->description,
            'parametres' => $this->parametres,
            'resultats' => $this->resultats,
            'statut' => $this->statut,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'cree_par' => $this->cree_par,
            'cree_par_user' => new UserResource($this->whenLoaded('creePar')),
            'date_execution' => $this->date_execution?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}