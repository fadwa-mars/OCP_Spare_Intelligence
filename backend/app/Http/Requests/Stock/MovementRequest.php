<?php

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;

class MovementRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'article_id' => 'required|exists:articles,id',
            'type_mouvement' => 'required|in:entree,sortie,reservation,annulation',
            'quantite' => 'required|numeric|min:0.01',
            'commentaire' => 'nullable|string',
        ];
    }
}