<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Changer le type de la colonne role de ENUM à VARCHAR
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('planificateur')->change();
        });
    }

    public function down(): void
    {
        // Revenir à ENUM (optionnel, peut être complexe)
        // Il est plus simple de garder VARCHAR en cas de rollback
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('planificateur')->change();
        });
    }
};