<?php

namespace App\Services\SapIntegration;

use Illuminate\Support\Facades\Storage;

class SapFileWatcher
{
    protected $csvImporter;

    public function __construct(SapCsvImporter $csvImporter)
    {
        $this->csvImporter = $csvImporter;
    }

    /**
     * Surveiller un dossier et traiter les nouveaux fichiers
     */
    public function watch($directory = 'sap_imports/pending')
    {
        $files = Storage::files($directory);
        
        $processed = [];
        
        foreach ($files as $file) {
            if ($this->isValidFile($file)) {
                $result = $this->processFile($file);
                $processed[] = [
                    'file' => $file,
                    'result' => $result,
                ];
            }
        }
        
        return $processed;
    }

    /**
     * Traiter un fichier
     */
    public function processFile($filePath)
    {
        try {
            $result = $this->csvImporter->import(storage_path('app/' . $filePath));
            
            // Déplacer vers processed
            $this->moveToProcessed($filePath);
            
            return [
                'success' => true,
                'result' => $result,
            ];
        } catch (\Exception $e) {
            // Déplacer vers failed
            $this->moveToFailed($filePath);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier si le fichier est valide
     */
    private function isValidFile($filePath)
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        return in_array(strtolower($extension), ['csv', 'xlsx', 'xls']);
    }

    /**
     * Déplacer vers processed
     */
    private function moveToProcessed($filePath)
    {
        $filename = basename($filePath);
        $newPath = 'sap_imports/processed/' . date('Y-m-d') . '_' . $filename;
        Storage::move($filePath, $newPath);
    }

    /**
     * Déplacer vers failed
     */
    private function moveToFailed($filePath)
    {
        $filename = basename($filePath);
        $newPath = 'sap_imports/failed/' . date('Y-m-d') . '_' . $filename;
        Storage::move($filePath, $newPath);
    }

    /**
     * Planifier la surveillance (cron)
     */
    public function scheduleWatch()
    {
        // Cette méthode sera appelée par le scheduler toutes les X minutes
        return $this->watch();
    }
}