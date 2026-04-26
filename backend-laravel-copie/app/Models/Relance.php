<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relance extends Model
{
    use HasFactory;

    protected $fillable = [
        'commande_id', 'user_id', 'niveau', 'type_relance',
        'message', 'date_envoi', 'reponse_recue', 'reponse_detail'
    ];

    protected $casts = [
        'date_envoi' => 'datetime',
        'reponse_recue' => 'boolean',
    ];

    // Relations
    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}