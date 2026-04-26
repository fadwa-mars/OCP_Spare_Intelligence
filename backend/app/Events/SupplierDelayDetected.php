<?php

namespace App\Events;

use App\Models\Commande;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupplierDelayDetected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $commande;
    public $joursRetard;

    public function __construct(Commande $commande, $joursRetard)
    {
        $this->commande = $commande;
        $this->joursRetard = $joursRetard;
    }
}