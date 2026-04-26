<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeuilHistoriqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'ancien_seuil_min' => (float) $this->ancien_seuil_min,
            'nouveau_seuil_min' => (float) $this->nouveau_seuil_min,
            'ancien_seuil_securite' => (float) $this->ancien_seuil_securite,
            'nouveau_seuil_securite' => (float) $this->nouveau_seuil_securite,
            'raison_modification' => $this->raison_modification,
            'modifie_par' => $this->modifie_par,
            'modifie_par_user' => new UserResource($this->whenLoaded('modifiePar')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}