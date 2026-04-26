<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * Utilisateurs par rôle
     */
    public function findByRole($role)
    {
        return $this->model->where('role', $role)->get();
    }

    /**
     * Utilisateurs actifs
     */
    public function getActiveUsers()
    {
        return $this->model->where('is_active', true)->get();
    }

    /**
     * Acheteurs
     */
    public function getAcheteurs()
    {
        return $this->model->where('role', 'acheteur')
            ->where('is_active', true)
            ->get();
    }

    /**
     * Planificateurs
     */
    public function getPlanificateurs()
    {
        return $this->model->where('role', 'planificateur')
            ->where('is_active', true)
            ->get();
    }
}