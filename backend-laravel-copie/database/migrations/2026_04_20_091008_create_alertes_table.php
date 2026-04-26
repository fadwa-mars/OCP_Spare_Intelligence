<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['rupture', 'seuil_min', 'seuil_max', 'stock_mort', 'anomalie', 'retard_livraison']);
            $table->enum('niveau', ['info', 'jaune', 'rouge'])->default('info');
            $table->string('message');
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('cascade');
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->onDelete('cascade');
            $table->dateTime('date_creation');
            $table->boolean('est_traitee')->default(false);
            $table->dateTime('date_traitement')->nullable();
            $table->foreignId('user_traitement_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('type');
            $table->index('niveau');
            $table->index('est_traitee');
            $table->index('date_creation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('alertes');
    }
};