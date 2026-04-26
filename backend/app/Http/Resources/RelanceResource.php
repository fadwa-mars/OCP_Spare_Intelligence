<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RelanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'commande_id' => $this->commande_id,
            'commande' => new CommandeResource($this->whenLoaded('commande')),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'niveau' => $this->niveau,
            'type_relance' => $this->type_relance,
            'message' => $this->message,
            'date_envoi' => $this->date_envoi?->format('Y-m-d H:i:s'),
            'reponse_recue' => $this->reponse_recue,
            'reponse_detail' => $this->reponse_detail,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}