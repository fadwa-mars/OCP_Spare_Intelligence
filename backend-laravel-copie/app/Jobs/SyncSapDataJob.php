<?php

namespace App\Jobs;

use App\Services\SapIntegration\SapCsvImporter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncSapDataJob implements ShouldQueue
{
    use Queueable;

    protected $filePath;
    protected $logId;

    public function __construct($filePath, $logId = null)
    {
        $this->filePath = $filePath;
        $this->logId = $logId;
    }

    public function handle(SapCsvImporter $importer)
    {
        Log::info('Démarrage du job SyncSapDataJob', ['file' => $this->filePath]);
        
        try {
            $result = $importer->import($this->filePath, $this->logId);
            
            Log::info('Job SyncSapDataJob terminé avec succès', [
                'file' => $this->filePath,
                'processed' => $result['processed'],
                'failed' => $result['failed'],
            ]);
        } catch (\Exception $e) {
            Log::error('Job SyncSapDataJob échoué', [
                'file' => $this->filePath,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}