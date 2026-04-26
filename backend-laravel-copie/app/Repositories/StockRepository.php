<?php

namespace App\Repositories;

use App\Models\Stock;

class StockRepository extends BaseRepository
{
    public function __construct(Stock $model)
    {
        parent::__construct($model);
    }

    /**
     * Stock par article
     */
    public function findByArticle($articleId)
    {
        return $this->model->where('article_id', $articleId)->first();
    }

    /**
     * Stock disponible
     */
    public function getAvailableStock()
    {
        return $this->model->where('stock_disponible', '>', 0)->with('article')->get();
    }

    /**
     * Stock critique (seuil minimum)
     */
    public function getCriticalStock()
    {
        return $this->model->whereRaw('stock_actuel <= seuil_min')
            ->with('article')
            ->get();
    }

    /**
     * Valeur totale du stock
     */
    public function getTotalValue()
    {
        return $this->model->sum('stock_actuel') * 100;
    }
}