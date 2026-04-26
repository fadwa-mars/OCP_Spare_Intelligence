<?php

namespace App\Listeners;

use App\Events\StockThresholdExceeded;
use App\Events\RuptureImminenteDetected;
use App\Services\Alert\AlertService;

class NotifyStockThreshold
{
    protected $alertService;

    public function __construct(AlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    public function handleThreshold(StockThresholdExceeded $event)
    {
        $niveau = $event->stockActuel <= $event->seuilMin / 2 ? 'rouge' : 'jaune';
        
        $this->alertService->createAlert(
            'seuil_min',
            $niveau,
            "Stock de l'article {$event->article->designation} a atteint le seuil minimum",
            $event->article->id,
            null
        );
    }

    public function handleRupture(RuptureImminenteDetected $event)
    {
        $this->alertService->createAlert(
            'rupture_imminente',
            'rouge',
            "Rupture imminente pour l'article {$event->article->designation}",
            $event->article->id,
            null
        );
    }
}