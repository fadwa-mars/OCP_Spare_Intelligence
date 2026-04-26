<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'niveau', 'message', 'article_id', 'commande_id',
        'date_creation', 'est_traitee', 'date_traitement', 'user_traitement_id'
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_traitement' => 'datetime',
        'est_traitee' => 'boolean',
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function userTraitement()
    {
        return $this->belongsTo(User::class, 'user_traitement_id');
    }
}