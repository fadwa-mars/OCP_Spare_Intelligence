<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ligne_commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->foreignId('offre_id')->nullable()->constrained('offres')->onDelete('set null');
            $table->decimal('quantite', 10, 2);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('montant_ligne', 10, 2);
            $table->timestamps();
            
            $table->index('commande_id');
            $table->index('article_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ligne_commandes');
    }
};