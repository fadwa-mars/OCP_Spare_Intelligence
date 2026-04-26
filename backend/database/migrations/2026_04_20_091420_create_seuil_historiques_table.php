<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('seuil_historiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->decimal('ancien_seuil_min', 10, 2);
            $table->decimal('nouveau_seuil_min', 10, 2);
            $table->decimal('ancien_seuil_securite', 10, 2);
            $table->decimal('nouveau_seuil_securite', 10, 2);
            $table->string('raison_modification')->nullable();
            $table->foreignId('modifie_par')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('article_id');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('seuil_historiques');
    }
};