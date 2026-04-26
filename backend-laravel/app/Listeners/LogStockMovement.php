<?php

namespace App\Listeners;

use App\Events\StockUpdated;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class LogStockMovement
{
    public function handle(StockUpdated $event)
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'stock_update',
            'table_name' => 'stocks',
            'record_id' => $event->article->id,
            'old_values' => json_encode(['stock_actuel' => $event->ancienStock]),
            'new_values' => json_encode(['stock_actuel' => $event->nouveauStock]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        Log::info('Stock mis à jour', [
            'article_id' => $event->article->id,
            'ancien_stock' => $event->ancienStock,
            'nouveau_stock' => $event->nouveauStock,
            'type_mouvement' => $event->typeMouvement,
        ]);
    }
}