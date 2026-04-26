<?php

namespace App\Services\Utils;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Formater une date
     */
    public function format($date, $format = 'Y-m-d H:i:s')
    {
        if (!$date) return null;
        return Carbon::parse($date)->format($format);
    }

    /**
     * Nombre de jours entre deux dates
     */
    public function daysBetween($start, $end)
    {
        return Carbon::parse($start)->diffInDays(Carbon::parse($end));
    }

    /**
     * Vérifier si une date est dans le passé
     */
    public function isPast($date)
    {
        return Carbon::parse($date)->isPast();
    }

    /**
     * Vérifier si une date est dans le futur
     */
    public function isFuture($date)
    {
        return Carbon::parse($date)->isFuture();
    }

    /**
     * Ajouter des jours à une date
     */
    public function addDays($date, $days)
    {
        return Carbon::parse($date)->addDays($days);
    }

    /**
     * Obtenir le début de la semaine
     */
    public function startOfWeek()
    {
        return Carbon::now()->startOfWeek();
    }

    /**
     * Obtenir la fin de la semaine
     */
    public function endOfWeek()
    {
        return Carbon::now()->endOfWeek();
    }

    /**
     * Obtenir le début du mois
     */
    public function startOfMonth()
    {
        return Carbon::now()->startOfMonth();
    }

    /**
     * Obtenir la fin du mois
     */
    public function endOfMonth()
    {
        return Carbon::now()->endOfMonth();
    }

    /**
     * Formater pour affichage français
     */
    public function formatFrench($date)
    {
        if (!$date) return null;
        return Carbon::parse($date)->format('d/m/Y H:i');
    }
}