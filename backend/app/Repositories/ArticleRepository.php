<?php

namespace App\Repositories;

use App\Models\Article;

class ArticleRepository extends BaseRepository
{
    public function __construct(Article $model)
    {
        parent::__construct($model);
    }

    /**
     * Rechercher par code SAP
     */
    public function findByCodeSap($codeSap)
    {
        return $this->model->where('code_sap', $codeSap)->first();
    }

    /**
     * Rechercher par catégorie
     */
    public function findByCategorie($categorie)
    {
        return $this->model->where('categorie', $categorie)->get();
    }

    /**
     * Articles avec stock critique
     */
    public function getCriticalStock()
    {
        return $this->model->whereHas('stock', function($query) {
            $query->whereRaw('stock_actuel <= seuil_min');
        })->with('stock')->get();
    }

    /**
     * Recherche multi-critères
     */
    public function search($filters)
    {
        $query = $this->model->query();

        if (isset($filters['search'])) {
            $query->where('designation', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('code_sap', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['categorie'])) {
            $query->where('categorie', $filters['categorie']);
        }

        if (isset($filters['etat'])) {
            $query->where('etat', $filters['etat']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }
}