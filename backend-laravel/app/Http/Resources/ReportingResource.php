<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'periode_debut' => $this->periode_debut?->format('Y-m-d'),
            'periode_fin' => $this->periode_fin?->format('Y-m-d'),
            'contenu' => $this->contenu,
            'date_generation' => $this->date_generation?->format('Y-m-d H:i:s'),
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}