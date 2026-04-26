<?php

namespace App\Console\Commands;

use App\Services\SapIntegration\SapCsvImporter;
use App\Models\SapImportLog;
use Illuminate\Console\Command;

class SapImportCommand extends Command
{
    protected $signature = 'sap:import {file?} {--auto}';
    protected $description = 'Import des données depuis fichier SAP (CSV/Excel)';

    protected $importer;

    public function __construct(SapCsvImporter $importer)
    {
        parent::__construct();
        $this->importer = $importer;
    }

    public function handle()
    {
        if ($this->argument('file')) {
            $file = $this->argument('file');
            $this->info("Import du fichier: {$file}");
            
            $result = $this->importer->import($file);
            
            if ($result['success']) {
                $this->info("✅ Import réussi : {$result['processed']} lignes traitées");
            } else {
                $this->error("❌ Erreur : {$result['error']}");
            }
        } elseif ($this->option('auto')) {
            $this->info("Mode automatique - recherche des fichiers dans le dossier watch...");
            $this->autoImport();
        } else {
            $this->error("Veuillez spécifier un fichier ou utiliser l'option --auto");
        }
    }

    private function autoImport()
    {
        $watchDir = storage_path('app/sap_imports/pending');
        $files = glob($watchDir . '/*.{csv,xlsx,xls}', GLOB_BRACE);
        
        if (empty($files)) {
            $this->info("Aucun fichier trouvé dans le dossier watch");
            return;
        }
        
        foreach ($files as $file) {
            $this->info("Traitement de: " . basename($file));
            $result = $this->importer->import($file);
            
            if ($result['success']) {
                $this->info("✅ Import réussi : {$result['processed']} lignes");
                rename($file, storage_path('app/sap_imports/processed/' . basename($file)));
            } else {
                $this->error("❌ Erreur : {$result['error']}");
                rename($file, storage_path('app/sap_imports/failed/' . basename($file)));
            }
        }
    }
}