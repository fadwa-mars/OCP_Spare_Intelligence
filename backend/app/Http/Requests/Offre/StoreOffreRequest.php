<?php

namespace App\Http\Requests\Offre;

use Illuminate\Foundation\Http\FormRequest;

class StoreOffreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'appel_offre_id' => 'required|exists:appel_offres,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'delai_livraison' => 'required|integer|min:1',
            'garantie' => 'nullable|integer|min:0',
            'frais_livraison' => 'nullable|numeric|min:0',
        ];
    }
}