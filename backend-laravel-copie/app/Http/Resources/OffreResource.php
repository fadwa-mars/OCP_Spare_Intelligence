<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'appel_offre_id' => $this->appel_offre_id,
            'appel_offre' => new AppelOffreResource($this->whenLoaded('appelOffre')),
            'fournisseur_id' => $this->fournisseur_id,
            'fournisseur' => new FournisseurResource($this->whenLoaded('fournisseur')),
            'prix_unitaire' => (float) $this->prix_unitaire,
            'delai_livraison' => $this->delai_livraison,
            'garantie' => $this->garantie,
            'frais_livraison' => (float) $this->frais_livraison,
            'montant_total' => (float) $this->montant_total,
            'date_soumission' => $this->date_soumission?->format('Y-m-d H:i:s'),
            'score_calcule' => (float) $this->score_calcule,
            'rang' => $this->rang,
            'est_laureat' => $this->est_laureat,
        ];
    }
}