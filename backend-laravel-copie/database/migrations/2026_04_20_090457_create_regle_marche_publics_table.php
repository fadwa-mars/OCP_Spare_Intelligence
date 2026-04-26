<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('regle_marche_publics', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('libelle');
            $table->integer('nb_min_fournisseurs')->default(3);
            $table->integer('delai_min_reponse')->default(7);
            $table->decimal('seuil_appel_offres', 10, 2)->default(50000);
            $table->decimal('ponderation_prix', 5, 2)->default(60);
            $table->decimal('ponderation_delai', 5, 2)->default(25);
            $table->decimal('ponderation_qualite', 5, 2)->default(15);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('regle_marche_publics');
    }
};