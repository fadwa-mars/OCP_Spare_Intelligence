<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LigneCommandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'commande_id' => $this->commande_id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'offre_id' => $this->offre_id,
            'offre' => new OffreResource($this->whenLoaded('offre')),
            'quantite' => (float) $this->quantite,
            'prix_unitaire' => (float) $this->prix_unitaire,
            'montant_ligne' => (float) $this->montant_ligne,
        ];
    }
}