<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppelOffreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'demande_achat_id' => $this->demande_achat_id,
            'demande_achat' => new DemandeAchatResource($this->whenLoaded('demandeAchat')),
            'acheteur_id' => $this->acheteur_id,
            'acheteur' => new UserResource($this->whenLoaded('acheteur')),
            'date_lancement' => $this->date_lancement?->format('Y-m-d H:i:s'),
            'date_cloture' => $this->date_cloture?->format('Y-m-d H:i:s'),
            'objet' => $this->objet,
            'statut' => $this->statut,
            'offres' => OffreResource::collection($this->whenLoaded('offres')),
            'commande' => new CommandeResource($this->whenLoaded('commande')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}