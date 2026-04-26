<?php

namespace App\Repositories;

use App\Models\AppelOffre;

class TenderRepository extends BaseRepository
{
    public function __construct(AppelOffre $model)
    {
        parent::__construct($model);
    }

    /**
     * Appels d'offres ouverts
     */
    public function getOpenTenders()
    {
        return $this->model->where('statut', 'publie')
            ->where('date_cloture', '>', now())
            ->with('demandeAchat.article')
            ->get();
    }

    /**
     * Appels d'offres à clôturer
     */
    public function getToClose()
    {
        return $this->model->where('statut', 'publie')
            ->where('date_cloture', '<', now())
            ->get();
    }

    /**
     * Appels d'offres avec offres
     */
    public function getWithOffers()
    {
        return $this->model->has('offres')
            ->with(['offres.fournisseur', 'demandeAchat.article'])
            ->get();
    }
}