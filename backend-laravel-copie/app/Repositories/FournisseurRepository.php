<?php

namespace App\Repositories;

use App\Models\Fournisseur;

class FournisseurRepository extends BaseRepository
{
    public function __construct(Fournisseur $model)
    {
        parent::__construct($model);
    }

    /**
     * Fournisseurs actifs
     */
    public function getActiveSuppliers()
    {
        return $this->model->where('est_actif', true)
            ->orderBy('score_global', 'desc')
            ->get();
    }

    /**
     * Top fournisseurs
     */
    public function getTopSuppliers($limit = 10)
    {
        return $this->model->where('est_actif', true)
            ->orderBy('score_global', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Fournisseurs par performance
     */
    public function searchByPerformance($minScore = 70)
    {
        return $this->model->where('score_global', '>=', $minScore)
            ->orderBy('score_global', 'desc')
            ->get();
    }
}