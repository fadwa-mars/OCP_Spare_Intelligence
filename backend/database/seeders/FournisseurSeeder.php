<?php

namespace Database\Seeders;

use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class FournisseurSeeder extends Seeder
{
    public function run()
    {
        $fournisseurs = [
            [
                'nom' => 'SAP Matériels Maroc',
                'email_contact' => 'contact@sapmateriel.ma',
                'telephone' => '0522-123456',
                'adresse' => 'Casablanca, Maroc',
                'score_global' => 85.5,
                'delai_moyen_livraison' => 5,
                'taux_conformite' => 95,
                'est_actif' => true,
            ],
            [
                'nom' => 'Equipements Industriels SA',
                'email_contact' => 'contact@equipindus.ma',
                'telephone' => '0522-234567',
                'adresse' => 'Tanger, Maroc',
                'score_global' => 78.0,
                'delai_moyen_livraison' => 8,
                'taux_conformite' => 90,
                'est_actif' => true,
            ],
            [
                'nom' => 'Maintenance Pro',
                'email_contact' => 'contact@maintenancepro.ma',
                'telephone' => '0522-345678',
                'adresse' => 'Rabat, Maroc',
                'score_global' => 92.0,
                'delai_moyen_livraison' => 3,
                'taux_conformite' => 98,
                'est_actif' => true,
            ],
        ];

        foreach ($fournisseurs as $fournisseur) {
            Fournisseur::updateOrCreate(['nom' => $fournisseur['nom']], $fournisseur);
        }
    }
}