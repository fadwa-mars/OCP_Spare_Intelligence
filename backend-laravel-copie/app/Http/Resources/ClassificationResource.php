<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'classe_abc' => $this->classe_abc,
            'classe_xyz' => $this->classe_xyz,
            'valeur_consommation' => (float) $this->valeur_consommation,
            'valeur_stock' => (float) $this->valeur_stock,
            'date_calcul' => $this->date_calcul?->format('Y-m-d'),
            'recommandation' => $this->getRecommandation(),
        ];
    }

    private function getRecommandation(): string
    {
        if ($this->classe_abc === 'A' && $this->classe_xyz === 'X') {
            return 'Stock de sécurité optimal, réapprovisionnement automatique';
        }
        if ($this->classe_abc === 'A' && $this->classe_xyz === 'Y') {
            return 'Suivi régulier, stock de sécurité modéré';
        }
        if ($this->classe_abc === 'A' && $this->classe_xyz === 'Z') {
            return 'Prévoir un stock de sécurité élevé, suivi rapproché';
        }
        if ($this->classe_abc === 'B') {
            return 'Gestion standard, révision périodique';
        }
        if ($this->classe_abc === 'C') {
            return 'Gestion simplifiée, commandes groupées';
        }
        return 'Suivi standard';
    }
}