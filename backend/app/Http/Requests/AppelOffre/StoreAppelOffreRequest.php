<?php

namespace App\Http\Requests\AppelOffre;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppelOffreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'demande_achat_id' => 'required|exists:demande_achats,id',
            'date_cloture' => 'required|date|after:now',
            'objet' => 'required|string',
        ];
    }
}