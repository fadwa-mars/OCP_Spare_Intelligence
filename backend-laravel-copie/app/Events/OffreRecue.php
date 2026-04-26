<?php

namespace App\Events;

use App\Models\Offre;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OffreRecue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $offre;

    public function __construct(Offre $offre)
    {
        $this->offre = $offre;
    }
}