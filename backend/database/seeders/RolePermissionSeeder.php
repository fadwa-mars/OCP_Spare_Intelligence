<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Créer l'utilisateur admin par défaut
        User::updateOrCreate(
            ['email' => 'admin@ocp.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Créer un utilisateur magasinier
        User::updateOrCreate(
            ['email' => 'magasinier@ocp.com'],
            [
                'name' => 'Magasinier Test',
                'password' => Hash::make('password'),
                'role' => 'magasinier',
                'is_active' => true,
            ]
        );

        // Créer un utilisateur acheteur
        User::updateOrCreate(
            ['email' => 'acheteur@ocp.com'],
            [
                'name' => 'Acheteur Test',
                'password' => Hash::make('password'),
                'role' => 'acheteur',
                'is_active' => true,
            ]
        );

        // Créer un utilisateur planificateur
        User::updateOrCreate(
            ['email' => 'planificateur@ocp.com'],
            [
                'name' => 'Planificateur Test',
                'password' => Hash::make('password'),
                'role' => 'planificateur',
                'is_active' => true,
            ]
        );
    }
}