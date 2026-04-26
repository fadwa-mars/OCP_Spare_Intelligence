<?php

namespace App\Http\Requests\DemandeAchat;

use Illuminate\Foundation\Http\FormRequest;

class ApproveDemandeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'commentaire' => 'nullable|string',
        ];
    }
}