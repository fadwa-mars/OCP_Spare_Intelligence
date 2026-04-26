<?php

namespace App\Http\Requests\DemandeAchat;

use Illuminate\Foundation\Http\FormRequest;

class StoreDemandeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'article_id' => 'required|exists:articles,id',
            'quantite' => 'required|numeric|min:0.01',
            'date_besoin' => 'required|date|after_or_equal:today',
            'urgence' => 'required|in:basse,moyenne,haute,critique',
        ];
    }

    public function messages()
    {
        return [
            'article_id.required' => 'L\'article est requis',
            'quantite.required' => 'La quantité est requise',
            'date_besoin.required' => 'La date de besoin est requise',
            'date_besoin.after_or_equal' => 'La date de besoin doit être aujourd\'hui ou après',
        ];
    }
}