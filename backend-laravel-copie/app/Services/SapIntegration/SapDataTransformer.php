<?php

namespace App\Services\SapIntegration;

class SapDataTransformer
{
    /**
     * Transformer les données SAP vers format interne
     */
    public function transform($sapData)
    {
        return [
            'code_sap' => $this->cleanCode($sapData['CODE_SAP'] ?? ''),
            'designation' => $this->cleanString($sapData['DESIGNATION'] ?? ''),
            'categorie' => $this->cleanString($sapData['CATEGORIE'] ?? ''),
            'unite_mesure' => $this->cleanUnit($sapData['UNITE_MESURE'] ?? ''),
            'stock_actuel' => $this->cleanNumber($sapData['STOCK_ACTUEL'] ?? 0),
            'stock_reserve' => $this->cleanNumber($sapData['STOCK_RESERVE'] ?? 0),
            'emplacement' => $this->cleanString($sapData['EMPLACEMENT'] ?? ''),
            'date_dernier_mouvement' => $this->cleanDate($sapData['DATE_DERNIER_MOUVEMENT'] ?? null),
        ];
    }

    /**
     * Nettoyer le code SAP
     */
    private function cleanCode($code)
    {
        return trim(strtoupper($code));
    }

    /**
     * Nettoyer une chaîne
     */
    private function cleanString($string)
    {
        return trim(htmlspecialchars($string));
    }

    /**
     * Nettoyer une unité de mesure
     */
    private function cleanUnit($unit)
    {
        $units = [
            'PCE' => 'pièce',
            'KG' => 'kilogramme',
            'M' => 'mètre',
            'L' => 'litre',
            'BOITE' => 'boîte',
            'PAL' => 'palette',
        ];
        
        return $units[strtoupper($unit)] ?? strtolower($unit);
    }

    /**
     * Nettoyer un nombre
     */
    private function cleanNumber($number)
    {
        $number = str_replace(',', '.', $number);
        return floatval($number);
    }

    /**
     * Nettoyer une date
     */
    private function cleanDate($date)
    {
        if (!$date) return null;
        
        try {
            return date('Y-m-d', strtotime($date));
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Transformer en format d'export SAP
     */
    public function transformForExport($internalData)
    {
        return [
            'CODE_SAP' => $internalData['code_sap'],
            'DESIGNATION' => $internalData['designation'],
            'STOCK_ACTUEL' => $internalData['stock_actuel'],
            'STOCK_DISPONIBLE' => $internalData['stock_disponible'],
            'DATE_EXPORT' => date('Y-m-d H:i:s'),
        ];
    }
}