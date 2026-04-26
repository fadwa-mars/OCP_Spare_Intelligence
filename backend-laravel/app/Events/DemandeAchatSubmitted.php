<?php

namespace App\Events;

use App\Models\DemandeAchat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DemandeAchatSubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $demande;

    public function __construct(DemandeAchat $demande)
    {
        $this->demande = $demande;
    }
}