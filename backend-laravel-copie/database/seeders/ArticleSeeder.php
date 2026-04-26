<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run()
    {
        $articles = [
            [
                'code_sap' => 'ROU-001',
                'designation' => 'Roue de secours 800x600',
                'categorie' => 'ROUES',
                'unite_mesure' => 'pièce',
                'seuil_min' => 5,
                'seuil_securite' => 2,
                'delai_approvisionnement' => 15,
                'etat' => 'actif',
            ],
            [
                'code_sap' => 'CONV-002',
                'designation' => 'Courroie de convoyeur 5m',
                'categorie' => 'CONVOYEURS',
                'unite_mesure' => 'mètre',
                'seuil_min' => 10,
                'seuil_securite' => 3,
                'delai_approvisionnement' => 10,
                'etat' => 'actif',
            ],
            [
                'code_sap' => 'SEC-003',
                'designation' => 'Tambour sécheur rotatif',
                'categorie' => 'SECHOIRS',
                'unite_mesure' => 'pièce',
                'seuil_min' => 2,
                'seuil_securite' => 1,
                'delai_approvisionnement' => 30,
                'etat' => 'actif',
            ],
            [
                'code_sap' => 'CRIB-004',
                'designation' => 'Tamis crible vibrant',
                'categorie' => 'CRIBLES',
                'unite_mesure' => 'pièce',
                'seuil_min' => 3,
                'seuil_securite' => 1,
                'delai_approvisionnement' => 20,
                'etat' => 'actif',
            ],
            [
                'code_sap' => 'MOT-005',
                'designation' => 'Moteur électrique 50kW',
                'categorie' => 'MOTEURS',
                'unite_mesure' => 'pièce',
                'seuil_min' => 2,
                'seuil_securite' => 1,
                'delai_approvisionnement' => 25,
                'etat' => 'actif',
            ],
        ];

        foreach ($articles as $article) {
            Article::updateOrCreate(['code_sap' => $article['code_sap']], $article);
        }
    }
}