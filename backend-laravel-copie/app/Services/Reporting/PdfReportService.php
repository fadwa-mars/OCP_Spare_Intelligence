<?php

namespace App\Services\Reporting;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfReportService
{
    /**
     * Générer un PDF à partir d'un rapport
     */
    public function generatePdf($reportData, $template = 'default')
    {
        $pdf = Pdf::loadView('pdf.reports.' . $template, ['report' => $reportData]);
        
        $filename = 'rapport_' . $reportData['type'] . '_' . date('Ymd_His') . '.pdf';
        $path = storage_path('app/reports/' . $filename);
        
        $pdf->save($path);
        
        return [
            'path' => $path,
            'filename' => $filename,
        ];
    }

    /**
     * Télécharger un PDF
     */
    public function downloadPdf($reportId)
    {
        $report = Reporting::find($reportId);
        
        if (!$report) {
            throw new \Exception('Rapport non trouvé');
        }

        $pdf = Pdf::loadView('pdf.reports.report', ['report' => $report]);
        
        return $pdf->download('rapport_' . $report->type . '_' . $report->id . '.pdf');
    }

    /**
     * Générer un PDF de stock
     */
    public function generateStockPdf($stocks)
    {
        $pdf = Pdf::loadView('pdf.reports.stock', ['stocks' => $stocks]);
        return $pdf;
    }

    /**
     * Générer un PDF de commandes
     */
    public function generateOrderPdf($commandes)
    {
        $pdf = Pdf::loadView('pdf.reports.orders', ['commandes' => $commandes]);
        return $pdf;
    }
}