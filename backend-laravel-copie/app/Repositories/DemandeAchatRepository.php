<?php

namespace App\Repositories;

use App\Models\DemandeAchat;

class DemandeAchatRepository extends BaseRepository
{
    public function __construct(DemandeAchat $model)
    {
        parent::__construct($model);
    }

    /**
     * Demandes par statut
     */
    public function findByStatut($statut)
    {
        return $this->model->where('statut', $statut)->with('article')->get();
    }

    /**
     * Demandes approuvées en attente
     */
    public function getApprovedPending()
    {
        return $this->model->where('statut', 'approuvee')
            ->with(['article', 'user'])
            ->orderBy('date_besoin', 'asc')
            ->get();
    }

    /**
     * Demandes urgentes
     */
    public function getUrgentDemandes()
    {
        return $this->model->where('urgence', 'critique')
            ->whereIn('statut', ['soumise', 'approuvee'])
            ->with('article')
            ->get();
    }
}