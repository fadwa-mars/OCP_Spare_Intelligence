<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            RegleMarchePublicSeeder::class,
            ArticleSeeder::class,
            FournisseurSeeder::class,
            StockSeeder::class,
            DemandeAchatSeeder::class,
        ]);
    }
}