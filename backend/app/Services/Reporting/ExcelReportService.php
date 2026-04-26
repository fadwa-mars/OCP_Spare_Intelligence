<?php

namespace App\Services\Reporting;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StockExport;
use App\Exports\OrdersExport;
use App\Exports\MovementsExport;

class ExcelReportService
{
    /**
     * Exporter le stock en Excel
     */
    public function exportStock($stocks, $filename = null)
    {
        $filename = $filename ?? 'stock_' . date('Ymd_His') . '.xlsx';
        
        return Excel::download(new StockExport($stocks), $filename);
    }

    /**
     * Exporter les commandes en Excel
     */
    public function exportOrders($commandes, $filename = null)
    {
        $filename = $filename ?? 'commandes_' . date('Ymd_His') . '.xlsx';
        
        return Excel::download(new OrdersExport($commandes), $filename);
    }

    /**
     * Exporter les mouvements en Excel
     */
    public function exportMovements($movements, $filename = null)
    {
        $filename = $filename ?? 'mouvements_' . date('Ymd_His') . '.xlsx';
        
        return Excel::download(new MovementsExport($movements), $filename);
    }

    /**
     * Exporter un rapport personnalisé
     */
    public function exportCustomReport($data, $headers, $filename = null)
    {
        $filename = $filename ?? 'rapport_' . date('Ymd_His') . '.csv';
        
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            
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
}