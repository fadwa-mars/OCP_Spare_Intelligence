<?php

namespace App\Jobs;

use App\Models\SapImportLog;
use App\Services\SapIntegration\SapCsvImporter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessSapImportJob implements ShouldQueue
{
    use Queueable;

    protected $logId;
    protected $filePath;

    public function __construct($logId, $filePath)
    {
        $this->logId = $logId;
        $this->filePath = $filePath;
    }

    public function handle(SapCsvImporter $importer)
    {
        $log = SapImportLog::find($this->logId);
        
        if (!$log) {
            Log::error('Log SAP non trouvé', ['log_id' => $this->logId]);
            return;
        }
        
        Log::info('Démarrage du traitement du fichier SAP', [
            'log_id' => $this->logId,
            'file' => $this->filePath,
        ]);
        
        $log->status = 'processing';
        $log->save();
        
        try {
            $fullPath = storage_path('app/' . $this->filePath);
            $result = $importer->import($fullPath, $this->logId);
            
            $log->status = 'success';
            $log->total_records = $result['total'];
            $log->processed_records = $result['processed'];
            $log->failed_records = $result['failed'];
            $log->save();
            
            // Nettoyer le fichier temporaire
            Storage::delete($this->filePath);
            
            Log::info('Import SAP terminé avec succès', [
                'log_id' => $this->logId,
                'processed' => $result['processed'],
                'failed' => $result['failed'],
            ]);
        } catch (\Exception $e) {
            $log->status = 'failed';
            $log->error_message = $e->getMessage();
            $log->save();
            
            Log::error('Import SAP échoué', [
                'log_id' => $this->logId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}