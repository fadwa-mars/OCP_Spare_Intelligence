<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('appel_offres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_achat_id')->constrained('demande_achats')->onDelete('cascade');
            $table->foreignId('acheteur_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('date_lancement');
            $table->dateTime('date_cloture');
            $table->string('objet');
            $table->enum('statut', ['brouillon', 'publie', 'en_cours', 'cloture', 'annule', 'attribue'])->default('brouillon');
            $table->timestamps();
            
            $table->index('demande_achat_id');
            $table->index('acheteur_id');
            $table->index('statut');
        });
    }

    public function down()
    {
        Schema::dropIfExists('appel_offres');
    }
};