<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('classification_abcxyz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->enum('classe_abc', ['A', 'B', 'C'])->nullable();
            $table->enum('classe_xyz', ['X', 'Y', 'Z'])->nullable();
            $table->decimal('valeur_consommation', 10, 2)->nullable();
            $table->decimal('valeur_stock', 10, 2)->nullable();
            $table->date('date_calcul');
            $table->timestamps();
            
            $table->index('article_id');
            $table->index('classe_abc');
            $table->index('classe_xyz');
            $table->index('date_calcul');
        });
    }

    public function down()
    {
        Schema::dropIfExists('classification_abcxyz');
    }
};