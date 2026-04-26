<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('offres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appel_offre_id')->constrained('appel_offres')->onDelete('cascade');
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade');
            $table->decimal('prix_unitaire', 10, 2);
            $table->integer('delai_livraison');
            $table->integer('garantie')->nullable();
            $table->decimal('frais_livraison', 10, 2)->default(0);
            $table->decimal('montant_total', 10, 2);
            $table->dateTime('date_soumission');
            $table->decimal('score_calcule', 5, 2)->nullable();
            $table->integer('rang')->nullable();
            $table->boolean('est_laureat')->default(false);
            $table->timestamps();
            
            $table->index('appel_offre_id');
            $table->index('fournisseur_id');
            $table->index('est_laureat');
        });
    }

    public function down()
    {
        Schema::dropIfExists('offres');
    }
};