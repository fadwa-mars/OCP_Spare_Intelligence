<?php

namespace Database\Seeders;

use App\Models\RegleMarchePublic;
use Illuminate\Database\Seeder;

class RegleMarchePublicSeeder extends Seeder
{
    public function run()
    {
        RegleMarchePublic::updateOrCreate(
            ['code' => 'DEFAULT'],
            [
                'libelle' => 'Règle par défaut',
                'nb_min_fournisseurs' => 3,
                'delai_min_reponse' => 7,
                'seuil_appel_offres' => 50000,
                'ponderation_prix' => 60,
                'ponderation_delai' => 25,
                'ponderation_qualite' => 15,
            ]
        );
    }
}