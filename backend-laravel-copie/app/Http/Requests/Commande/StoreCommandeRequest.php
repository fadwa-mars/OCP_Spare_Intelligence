<?php

namespace App\Http\Requests\Commande;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'date_livraison_prevue' => 'required|date|after:today',
            'lignes' => 'required|array|min:1',
            'lignes.*.article_id' => 'required|exists:articles,id',
            'lignes.*.quantite' => 'required|numeric|min:0.01',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'lignes.required' => 'Au moins une ligne de commande est requise',
            'lignes.*.article_id.required' => 'L\'article est requis pour chaque ligne',
            'lignes.*.quantite.required' => 'La quantité est requise pour chaque ligne',
        ];
    }
}