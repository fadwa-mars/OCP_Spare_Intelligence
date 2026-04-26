<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email_contact')->nullable();
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->decimal('score_global', 5, 2)->default(0);
            $table->integer('nb_commandes')->default(0);
            $table->integer('nb_livraisons_retard')->default(0);
            $table->integer('delai_moyen_livraison')->default(0);
            $table->decimal('taux_conformite', 5, 2)->default(100);
            $table->boolean('est_actif')->default(true);
            $table->date('date_derniere_evaluation')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fournisseurs');
    }
};