<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegleMarchePublicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'libelle' => $this->libelle,
            'nb_min_fournisseurs' => $this->nb_min_fournisseurs,
            'delai_min_reponse' => $this->delai_min_reponse,
            'seuil_appel_offres' => (float) $this->seuil_appel_offres,
            'ponderation_prix' => (float) $this->ponderation_prix,
            'ponderation_delai' => (float) $this->ponderation_delai,
            'ponderation_qualite' => (float) $this->ponderation_qualite,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}