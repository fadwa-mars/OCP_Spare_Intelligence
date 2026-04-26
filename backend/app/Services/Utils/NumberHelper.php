<?php

namespace App\Services\Utils;

class NumberHelper
{
    /**
     * Formater un nombre (prix)
     */
    public function formatPrice($number, $decimals = 2)
    {
        return number_format($number, $decimals, ',', ' ') . ' €';
    }

    /**
     * Formater un nombre (quantité)
     */
    public function formatQuantity($number, $decimals = 0)
    {
        return number_format($number, $decimals, ',', ' ');
    }

    /**
     * Pourcentage
     */
    public function percentage($part, $total)
    {
        if ($total == 0) return 0;
        return round(($part / $total) * 100, 2);
    }

    /**
     * Arrondir à l'entier supérieur
     */
    public function ceil($number)
    {
        return ceil($number);
    }

    /**
     * Arrondir à l'entier inférieur
     */
    public function floor($number)
    {
        return floor($number);
    }

    /**
     * Taux de variation entre deux valeurs
     */
    public function variation($old, $new)
    {
        if ($old == 0) return 0;
        return round((($new - $old) / $old) * 100, 2);
    }

    /**
     * Générer un nombre aléatoire dans une plage
     */
    public function random($min, $max)
    {
        return rand($min, $max);
    }

    /**
     * Formater pour affichage (K, M, B)
     */
    public function formatCompact($number)
    {
        if ($number >= 1000000000) {
            return round($number / 1000000000, 1) . 'B';
        }
        if ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M';
        }
        if ($number >= 1000) {
            return round($number / 1000, 1) . 'K';
        }
        return (string) $number;
    }
}