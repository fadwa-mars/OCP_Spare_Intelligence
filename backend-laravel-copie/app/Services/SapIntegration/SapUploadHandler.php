<?php

namespace App\Services\SapIntegration;

use App\Models\SapImportLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SapUploadHandler
{
    protected $csvImporter;

    public function __construct(SapCsvImporter $csvImporter)
    {
        $this->csvImporter = $csvImporter;
    }

    /**
     * Gérer l'upload d'un fichier
     */
    public function handleUpload(UploadedFile $file, $userId)
    {
        // Créer le log
        $log = SapImportLog::create([
            'filename' => $file->getClientOriginalName(),
            'status' => 'processing',
            'user_id' => $userId,
        ]);

        try {
            // Stocker le fichier
            $path = $file->store('sap_imports/temp');

            // Valider le format
            if (!$this->csvImporter->validateFormat($path)) {
                throw new \Exception('Format de fichier invalide');
            }

            // Importer
            $result = $this->csvImporter->import($path, $log->id);

            // Mettre à jour le log
            $log->status = 'success';
            $log->total_records = $result['total'];
            $log->processed_records = $result['processed'];
            $log->failed_records = $result['failed'];
            $log->save();

            // Nettoyer
            Storage::delete($path);

            return $log;
        } catch (\Exception $e) {
            $log->status = 'failed';
            $log->error_message = $e->getMessage();
            $log->save();
            
            throw $e;
        }
    }

    /**
     * Réessayer un import échoué
     */
    public function retry($logId)
    {
        $log = SapImportLog::find($logId);
        
        if (!$log) {
            throw new \Exception('Log non trouvé');
        }

        // Logique de réimport
        $log->status = 'pending';
        $log->error_message = null;
        $log->save();

        return $log;
    }

    /**
     * Obtenir l'historique des imports
     */
    public function getHistory($limit = 50)
    {
        return SapImportLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}