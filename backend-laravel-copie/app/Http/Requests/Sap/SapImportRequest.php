<?php

namespace App\Http\Requests\Sap;

use Illuminate\Foundation\Http\FormRequest;

class SapImportRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ];
    }

    public function messages()
    {
        return [
            'file.required' => 'Un fichier est requis',
            'file.mimes' => 'Le fichier doit être au format CSV ou Excel',
            'file.max' => 'Le fichier ne doit pas dépasser 10MB',
        ];
    }
}