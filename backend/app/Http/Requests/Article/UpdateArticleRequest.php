<?php

namespace App\Http\Requests\Article;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArticleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'code_sap' => 'sometimes|string|unique:articles,code_sap,' . $this->route('article'),
            'designation' => 'sometimes|string',
            'categorie' => 'nullable|string',
            'unite_mesure' => 'nullable|string',
            'seuil_min' => 'nullable|numeric|min:0',
            'seuil_securite' => 'nullable|numeric|min:0',
            'delai_approvisionnement' => 'nullable|integer|min:0',
            'etat' => 'sometimes|in:actif,inactif,obsolète',
        ];
    }
}