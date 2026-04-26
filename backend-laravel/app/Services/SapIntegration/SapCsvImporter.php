<?php

namespace App\Services\SapIntegration;

use App\Models\Article;
use App\Models\Stock;
use App\Models\SapImportLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SapCsvImporter
{
    /**
     * Importer un fichier CSV
     */
    public function import($filePath, $logId = null)
    {
        $data = array_map('str_getcsv', file($filePath));
        $headers = array_shift($data);
        
        $total = count($data);
        $processed = 0;
        $failed = 0;

        foreach ($data as $row) {
            try {
                $rowData = array_combine($headers, $row);
                $this->processRow($rowData);
                $processed++;
            } catch (\Exception $e) {
                $failed++;
                if ($logId) {
                    $this->logError($logId, $row, $e->getMessage());
                }
            }
        }

        return [
            'success' => true,
            'total' => $total,
            'processed' => $processed,
            'failed' => $failed,
        ];
    }

    /**
     * Traiter une ligne du CSV
     */
    private function processRow($data)
    {
        DB::beginTransaction();
        
        try {
            // Mettre à jour ou créer l'article
            $article = Article::updateOrCreate(
                ['code_sap' => $data['CODE_SAP']],
                [
                    'designation' => $data['DESIGNATION'] ?? '',
                    'categorie' => $data['CATEGORIE'] ?? null,
                    'unite_mesure' => $data['UNITE_MESURE'] ?? null,
                    'seuil_min' => $data['SEUIL_MIN'] ?? 0,
                    'seuil_securite' => $data['SEUIL_SECURITE'] ?? 0,
                ]
            );

            // Mettre à jour le stock
            Stock::updateOrCreate(
                ['article_id' => $article->id],
                [
                    'stock_actuel' => $data['STOCK_ACTUEL'] ?? 0,
                    'stock_reserve' => $data['STOCK_RESERVE'] ?? 0,
                    'stock_disponible' => ($data['STOCK_ACTUEL'] ?? 0) - ($data['STOCK_RESERVE'] ?? 0),
                    'emplacement' => $data['EMPLACEMENT'] ?? null,
                    'date_dernier_mouvement' => $data['DATE_DERNIER_MOUVEMENT'] ?? null,
                ]
            );

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Enregistrer une erreur
     */
    private function logError($logId, $row, $error)
    {
        $log = SapImportLog::find($logId);
        if ($log) {
            $errors = $log->details ?? [];
            $errors[] = [
                'row' => $row,
                'error' => $error,
                'date' => now(),
            ];
            $log->details = $errors;
            $log->save();
        }
    }

    /**
     * Valider le format du fichier
     */
    public function validateFormat($filePath)
    {
        $requiredColumns = ['CODE_SAP', 'DESIGNATION', 'STOCK_ACTUEL'];
        
        $data = array_map('str_getcsv', file($filePath));
        $headers = array_shift($data);
        
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $headers)) {
                return false;
            }
        }
        
        return true;
    }
}