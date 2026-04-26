<?php

namespace App\Services\Utils;

use Illuminate\Support\Facades\Storage;

class FileHelper
{
    /**
     * Télécharger un fichier
     */
    public function download($path, $name = null)
    {
        if (!Storage::exists($path)) {
            throw new \Exception('Fichier non trouvé');
        }

        $fileName = $name ?? basename($path);
        return Storage::download($path, $fileName);
    }

    /**
     * Supprimer un fichier
     */
    public function delete($path)
    {
        if (Storage::exists($path)) {
            return Storage::delete($path);
        }
        return false;
    }

    /**
     * Obtenir la taille d'un fichier
     */
    public function getSize($path)
    {
        if (!Storage::exists($path)) return null;
        return Storage::size($path);
    }

    /**
     * Obtenir l'extension d'un fichier
     */
    public function getExtension($filename)
    {
        return pathinfo($filename, PATHINFO_EXTENSION);
    }

    /**
     * Générer un nom de fichier unique
     */
    public function uniqueFilename($originalName)
    {
        $extension = $this->getExtension($originalName);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        return $basename . '_' . time() . '_' . rand(1000, 9999) . '.' . $extension;
    }

    /**
     * Lire un fichier CSV
     */
    public function readCsv($path)
    {
        if (!Storage::exists($path)) return [];

        $content = Storage::get($path);
        $lines = explode("\n", $content);
        $data = [];

        foreach ($lines as $line) {
            if (trim($line)) {
                $data[] = str_getcsv($line);
            }
        }

        return $data;
    }
}