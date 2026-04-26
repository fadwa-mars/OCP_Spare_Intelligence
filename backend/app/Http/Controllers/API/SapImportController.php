<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SapImportLog;
use App\Models\Article;
use App\Models\Stock;
use App\Services\SapIntegration\SapCsvImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SapImportController extends Controller
{
    /**
     * Liste des imports SAP
     */
    public function index(Request $request)
    {
        $query = SapImportLog::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $imports = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $imports
        ]);
    }

    /**
     * Afficher un import
     */
    public function show($id)
    {
        $import = SapImportLog::with('user')->find($id);

        if (!$import) {
            return response()->json([
                'success' => false,
                'message' => 'Import non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $import
        ]);
    }

    /**
     * Importer un fichier SAP (CSV/Excel)
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();

        // Créer le log d'import
        $importLog = SapImportLog::create([
            'filename' => $filename,
            'status' => 'processing',
            'user_id' => $request->user()->id,
        ]);

        try {
            // Stocker le fichier
            $path = $file->store('sap_imports/temp');

            // Traiter le fichier
            $importer = new SapCsvImporter();
            $result = $importer->import($path, $importLog->id);

            if ($result['success']) {
                $importLog->status = 'success';
                $importLog->total_records = $result['total'];
                $importLog->processed_records = $result['processed'];
                $importLog->failed_records = $result['failed'] ?? 0;
                $importLog->save();

                // Supprimer le fichier temporaire
                Storage::delete($path);

                return response()->json([
                    'success' => true,
                    'message' => 'Import réussi',
                    'data' => $importLog
                ]);
            } else {
                throw new \Exception($result['error']);
            }
        } catch (\Exception $e) {
            $importLog->status = 'failed';
            $importLog->error_message = $e->getMessage();
            $importLog->save();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'import',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger le template CSV
     */
    public function downloadTemplate()
    {
        $headers = [
            'code_sap', 'designation', 'categorie', 'unite_mesure',
            'stock_actuel', 'stock_reserve', 'emplacement'
        ];

        $callback = function() use ($headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_import_sap.csv"',
        ]);
    }

    /**
     * Réimporter un fichier ayant échoué
     */
    public function retry($id, Request $request)
    {
        $importLog = SapImportLog::find($id);

        if (!$importLog) {
            return response()->json([
                'success' => false,
                'message' => 'Import non trouvé'
            ], 404);
        }

        if ($importLog->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les imports échoués peuvent être réessayés'
            ], 400);
        }

        $importLog->status = 'pending';
        $importLog->error_message = null;
        $importLog->save();

        // Déclencher le job de réimport
        // ProcessSapImportJob::dispatch($importLog);

        return response()->json([
            'success' => true,
            'message' => 'Réimport programmé',
            'data' => $importLog
        ]);
    }

    /**
     * Statistiques des imports
     */
    public function stats()
    {
        $stats = [
            'total_imports' => SapImportLog::count(),
            'success' => SapImportLog::where('status', 'success')->count(),
            'failed' => SapImportLog::where('status', 'failed')->count(),
            'processing' => SapImportLog::where('status', 'processing')->count(),
            'total_records_imported' => SapImportLog::where('status', 'success')->sum('processed_records'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}