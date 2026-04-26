<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code_sap' => $this->code_sap,
            'designation' => $this->designation,
            'categorie' => $this->categorie,
            'etat' => $this->etat,
            'seuil_min' => (float) $this->seuil_min,
            'seuil_securite' => (float) $this->seuil_securite,
            'unite_mesure' => $this->unite_mesure,
            'poids' => (float) $this->poids,
            'delai_approvisionnement' => $this->delai_approvisionnement,
            'stock' => new StockResource($this->whenLoaded('stock')),
            'classification' => new ClassificationResource($this->whenLoaded('classification')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}