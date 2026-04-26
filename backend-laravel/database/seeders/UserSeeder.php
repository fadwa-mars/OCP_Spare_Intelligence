<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@ocp.com',
                'password' => Hash::make('password'),
                'role' => 'magasinier',
                'is_active' => true,
            ],
            [
                'name' => 'Marie Martin',
                'email' => 'marie.martin@ocp.com',
                'password' => Hash::make('password'),
                'role' => 'acheteur',
                'is_active' => true,
            ],
            [
                'name' => 'Pierre Durand',
                'email' => 'pierre.durand@ocp.com',
                'password' => Hash::make('password'),
                'role' => 'planificateur',
                'is_active' => true,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}