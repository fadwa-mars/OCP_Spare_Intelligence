<?php

namespace App\Services\Utils;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CsvParser
{
    /**
     * Parser un fichier CSV
     */
    public function parse($file, $hasHeader = true)
    {
        if ($file instanceof UploadedFile) {
            $path = $file->getPathname();
        } else {
            $path = storage_path('app/' . $file);
        }

        $data = array_map('str_getcsv', file($path));
        
        if ($hasHeader && !empty($data)) {
            $headers = array_shift($data);
            $result = [];
            
            foreach ($data as $row) {
                if (count($row) == count($headers)) {
                    $result[] = array_combine($headers, $row);
                }
            }
            
            return $result;
        }
        
        return $data;
    }

    /**
     * Valider les colonnes d'un CSV
     */
    public function validateColumns($data, $requiredColumns)
    {
        if (empty($data)) return false;
        
        $firstRow = $data[0];
        $columns = array_keys($firstRow);
        
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $columns)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Exporter en CSV
     */
    public function export($data, $filename, $headers = null)
    {
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            
            if ($headers) {
                fputcsv($file, $headers);
            }
            
            foreach ($data as $row) {
                fputcsv($file, (array) $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Convertir CSV en array
     */
    public function toArray($file)
    {
        return $this->parse($file);
    }
}