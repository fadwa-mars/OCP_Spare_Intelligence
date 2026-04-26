<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FournisseurResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'email_contact' => $this->email_contact,
            'telephone' => $this->telephone,
            'adresse' => $this->adresse,
            'score_global' => (float) $this->score_global,
            'nb_commandes' => $this->nb_commandes,
            'nb_livraisons_retard' => $this->nb_livraisons_retard,
            'delai_moyen_livraison' => $this->delai_moyen_livraison,
            'taux_conformite' => (float) $this->taux_conformite,
            'est_actif' => $this->est_actif,
            'date_derniere_evaluation' => $this->date_derniere_evaluation?->format('Y-m-d'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}