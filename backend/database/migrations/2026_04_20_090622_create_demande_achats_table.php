<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('demande_achats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('quantite', 10, 2);
            $table->date('date_demande');
            $table->date('date_besoin');
            $table->enum('urgence', ['basse', 'moyenne', 'haute', 'critique'])->default('moyenne');
            $table->enum('statut', ['brouillon', 'soumise', 'approuvee', 'rejetee', 'transformee_en_commande'])->default('brouillon');
            $table->timestamps();
            
            $table->index('article_id');
            $table->index('user_id');
            $table->index('statut');
        });
    }

    public function down()
    {
        Schema::dropIfExists('demande_achats');
    }
};