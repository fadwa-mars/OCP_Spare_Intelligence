<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_attente', 'confirmee', 'expediee', 'recue', 'annulee', 'en_cours_livraison') NOT NULL DEFAULT 'en_attente'");
        }
    }

    public function down()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE commandes MODIFY COLUMN statut ENUM('en_attente', 'confirmee', 'expediee', 'recue', 'annulee') NOT NULL DEFAULT 'en_attente'");
        }
    }
};