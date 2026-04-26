<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'is_active'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relations
    public function demandesAchat()
    {
        return $this->hasMany(DemandeAchat::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function alertesTraitees()
    {
        return $this->hasMany(Alerte::class, 'user_traitement_id');
    }

    public function relances()
    {
        return $this->hasMany(Relance::class);
    }

    public function reportings()
    {
        return $this->hasMany(Reporting::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function sapImportLogs()
    {
        return $this->hasMany(SapImportLog::class);
    }

    public function simulations()
    {
        return $this->hasMany(SimulationWhatIf::class, 'cree_par');
    }
}