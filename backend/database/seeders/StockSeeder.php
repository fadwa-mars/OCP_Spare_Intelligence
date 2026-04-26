<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run()
    {
        $articles = Article::all();

        foreach ($articles as $article) {
            Stock::updateOrCreate(
                ['article_id' => $article->id],
                [
                    'stock_actuel' => rand(5, 50),
                    'stock_reserve' => rand(0, 5),
                    'stock_disponible' => rand(5, 45),
                    'emplacement' => 'Aile ' . chr(rand(65, 70)) . '-' . rand(1, 10),
                    'date_dernier_mouvement' => now()->subDays(rand(1, 30)),
                ]
            );
        }
    }
}