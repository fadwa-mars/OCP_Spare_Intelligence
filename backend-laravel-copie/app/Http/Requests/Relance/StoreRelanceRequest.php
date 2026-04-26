<?php

namespace App\Http\Requests\Relance;

use Illuminate\Foundation\Http\FormRequest;

class StoreRelanceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'commande_id' => 'required|exists:commandes,id',
            'niveau' => 'required|integer|min:1|max:6',
            'type_relance' => 'required|in:email,telephone,reunion',
            'message' => 'required|string',
        ];
    }
}