<?php

namespace App\Events;

use App\Models\Offre;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OffreSelected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $offre;
    public $selectedBy;

    public function __construct(Offre $offre, $selectedBy)
    {
        $this->offre = $offre;
        $this->selectedBy = $selectedBy;
    }
}