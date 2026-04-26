<?php

namespace App\Http\Requests\Simulation;

use Illuminate\Foundation\Http\FormRequest;

class StoreSimulationRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nom_simulation' => 'required|string',
            'description' => 'nullable|string',
            'parametres' => 'required|array',
            'article_id' => 'nullable|exists:articles,id',
        ];
    }
}