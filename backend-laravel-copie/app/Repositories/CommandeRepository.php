<?php

namespace App\Repositories;

use App\Models\Commande;

class CommandeRepository extends BaseRepository
{
    public function __construct(Commande $model)
    {
        parent::__construct($model);
    }

    /**
     * Commandes par fournisseur
     */
    public function findByFournisseur($fournisseurId)
    {
        return $this->model->where('fournisseur_id', $fournisseurId)
            ->with('ligneCommandes')
            ->get();
    }

    /**
     * Commandes en retard
     */
    public function getLateOrders()
    {
        return $this->model->where('statut', '!=', 'recue')
            ->where('date_livraison_prevue', '<', now())
            ->with('fournisseur')
            ->get();
    }

    /**
     * Commandes à recevoir aujourd'hui
     */
    public function getTodayDeliveries()
    {
        return $this->model->where('date_livraison_prevue', today())
            ->where('statut', '!=', 'recue')
            ->with('fournisseur')
            ->get();
    }
}