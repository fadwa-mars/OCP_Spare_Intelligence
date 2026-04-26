<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reportings', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['hebdomadaire', 'mensuel', 'trimestriel', 'personnalise']);
            $table->date('periode_debut');
            $table->date('periode_fin');
            $table->json('contenu');
            $table->dateTime('date_generation');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('type');
            $table->index('date_generation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reportings');
    }
};