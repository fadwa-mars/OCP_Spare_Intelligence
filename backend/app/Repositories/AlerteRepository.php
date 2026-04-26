<?php

namespace App\Repositories;

use App\Models\Alerte;

class AlerteRepository extends BaseRepository
{
    public function __construct(Alerte $model)
    {
        parent::__construct($model);
    }

    /**
     * Alertes non traitées
     */
    public function getUnresolved()
    {
        return $this->model->where('est_traitee', false)
            ->orderBy('date_creation', 'desc')
            ->get();
    }

    /**
     * Alertes par niveau
     */
    public function findByLevel($niveau)
    {
        return $this->model->where('niveau', $niveau)
            ->where('est_traitee', false)
            ->get();
    }

    /**
     * Alertes rouges (urgentes)
     */
    public function getUrgentAlerts()
    {
        return $this->model->where('niveau', 'rouge')
            ->where('est_traitee', false)
            ->with(['article', 'commande'])
            ->get();
    }
}