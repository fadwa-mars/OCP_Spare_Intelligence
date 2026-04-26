<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Récupérer tous les enregistrements
     */
    public function all(array $relations = []): Collection
    {
        return $this->model->with($relations)->get();
    }

    /**
     * Récupérer avec pagination
     */
    public function paginate($perPage = 15, array $relations = [])
    {
        return $this->model->with($relations)->paginate($perPage);
    }

    /**
     * Trouver par ID
     */
    public function find($id, array $relations = []): ?Model
    {
        return $this->model->with($relations)->find($id);
    }

    /**
     * Trouver ou échouer
     */
    public function findOrFail($id, array $relations = []): Model
    {
        return $this->model->with($relations)->findOrFail($id);
    }

    /**
     * Créer un enregistrement
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Mettre à jour
     */
    public function update($id, array $data): bool
    {
        $record = $this->findOrFail($id);
        return $record->update($data);
    }

    /**
     * Supprimer
     */
    public function delete($id): bool
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }

    /**
     * Compter les enregistrements
     */
    public function count(): int
    {
        return $this->model->count();
    }
}