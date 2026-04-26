<?php

namespace App\Listeners;

use App\Events\SapImportCompleted;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class LogSapImport
{
    public function handle(SapImportCompleted $event)
    {
        AuditLog::create([
            'user_id' => $event->importLog->user_id,
            'action' => 'sap_import',
            'table_name' => 'sap_import_logs',
            'record_id' => $event->importLog->id,
            'old_values' => null,
            'new_values' => json_encode([
                'filename' => $event->importLog->filename,
                'status' => $event->status,
                'total_records' => $event->importLog->total_records,
                'processed_records' => $event->importLog->processed_records,
            ]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        Log::info('Import SAP terminé', [
            'import_id' => $event->importLog->id,
            'status' => $event->status,
            'filename' => $event->importLog->filename,
        ]);
    }
}