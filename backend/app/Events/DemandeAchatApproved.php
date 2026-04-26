<?php

namespace App\Events;

use App\Models\DemandeAchat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DemandeAchatApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $demande;
    public $approveurId;

    public function __construct(DemandeAchat $demande, $approveurId)
    {
        $this->demande = $demande;
        $this->approveurId = $approveurId;
    }
}