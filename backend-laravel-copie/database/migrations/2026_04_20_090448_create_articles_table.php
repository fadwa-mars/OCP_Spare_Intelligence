<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('code_sap')->unique();
            $table->string('designation');
            $table->string('categorie')->nullable();
            $table->enum('etat', ['actif', 'inactif', 'obsolète'])->default('actif');
            $table->decimal('seuil_min', 10, 2)->default(0);
            $table->decimal('seuil_securite', 10, 2)->default(0);
            $table->string('unite_mesure')->nullable();
            $table->decimal('poids', 10, 2)->nullable();
            $table->integer('delai_approvisionnement')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('articles');
    }
};