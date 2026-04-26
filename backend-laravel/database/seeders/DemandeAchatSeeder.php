<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\User;
use App\Models\DemandeAchat;
use Illuminate\Database\Seeder;

class DemandeAchatSeeder extends Seeder
{
    public function run()
    {
        $articles = Article::all();
        $users = User::all();

        for ($i = 0; $i < 10; $i++) {
            DemandeAchat::create([
                'article_id' => $articles->random()->id,
                'user_id' => $users->random()->id,
                'quantite' => rand(1, 20),
                'date_demande' => now()->subDays(rand(1, 60)),
                'date_besoin' => now()->addDays(rand(1, 30)),
                'urgence' => collect(['basse', 'moyenne', 'haute', 'critique'])->random(),
                'statut' => collect(['brouillon', 'soumise', 'approuvee', 'rejetee'])->random(),
            ]);
        }
    }
}