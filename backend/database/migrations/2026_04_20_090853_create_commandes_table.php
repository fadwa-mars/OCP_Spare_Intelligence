<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appel_offre_id')->nullable()->constrained('appel_offres')->onDelete('set null');
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('numero_bc')->unique();
            $table->date('date_commande');
            $table->date('date_livraison_prevue');
            $table->date('date_livraison_reelle')->nullable();
            $table->enum('statut', ['en_attente', 'confirmee', 'expediee', 'recue', 'annulee'])->default('en_attente');
            $table->decimal('montant_total', 10, 2);
            $table->string('conditions_paiement')->nullable();
            $table->timestamps();
            
            $table->index('fournisseur_id');
            $table->index('user_id');
            $table->index('statut');
            $table->index('numero_bc');
        });
    }

    public function down()
    {
        Schema::dropIfExists('commandes');
    }
};