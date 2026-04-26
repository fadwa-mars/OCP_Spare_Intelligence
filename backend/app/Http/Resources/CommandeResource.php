<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero_bc' => $this->numero_bc,
            'appel_offre_id' => $this->appel_offre_id,
            'appel_offre' => new AppelOffreResource($this->whenLoaded('appelOffre')),
            'fournisseur_id' => $this->fournisseur_id,
            'fournisseur' => new FournisseurResource($this->whenLoaded('fournisseur')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'date_commande' => $this->date_commande?->format('Y-m-d'),
            'date_livraison_prevue' => $this->date_livraison_prevue?->format('Y-m-d'),
            'date_livraison_reelle' => $this->date_livraison_reelle?->format('Y-m-d'),
            'statut' => $this->statut,
            'montant_total' => (float) $this->montant_total,
            'conditions_paiement' => $this->conditions_paiement,
            'lignes' => LigneCommandeResource::collection($this->whenLoaded('ligneCommandes')),
            'est_retardee' => $this->date_livraison_prevue && !$this->date_livraison_reelle && now()->gt($this->date_livraison_prevue),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}