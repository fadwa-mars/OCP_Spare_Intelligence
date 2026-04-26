<?php

namespace App\Listeners;

use App\Events\StockThresholdExceeded;
use App\Events\RuptureImminenteDetected;
use App\Models\User;
use App\Notifications\StockThresholdNotification;
use Illuminate\Support\Facades\Notification;

class SendAlertNotification
{
    public function handleStockThreshold(StockThresholdExceeded $event)
    {
        $users = User::whereIn('role', ['planificateur', 'admin'])
            ->where('is_active', true)
            ->get();

        Notification::send($users, new StockThresholdNotification($event->article, $event->stockActuel, $event->seuilMin));
    }

    public function handleRuptureImminente(RuptureImminenteDetected $event)
    {
        $users = User::whereIn('role', ['planificateur', 'acheteur', 'admin'])
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            $user->notify(new StockThresholdNotification($event->article, $event->stockActuel, $event->seuilMin));
        }
    }
}