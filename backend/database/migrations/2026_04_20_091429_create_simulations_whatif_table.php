<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('simulations_whatif', function (Blueprint $table) {
            $table->id();
            $table->string('nom_simulation');
            $table->text('description')->nullable();
            $table->json('parametres');
            $table->json('resultats')->nullable();
            $table->enum('statut', ['brouillon', 'en_cours', 'terminee', 'echec'])->default('brouillon');
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('set null');
            $table->foreignId('cree_par')->constrained('users')->onDelete('cascade');
            $table->dateTime('date_execution')->nullable();
            $table->timestamps();
            
            $table->index('statut');
            $table->index('cree_par');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('simulations_whatif');
    }
};