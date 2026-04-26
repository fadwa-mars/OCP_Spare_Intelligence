<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mouvement_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->onDelete('set null');
            $table->enum('type_mouvement', ['entree', 'sortie', 'reservation', 'annulation']);
            $table->decimal('quantite', 10, 2);
            $table->string('reference_externe')->nullable();
            $table->text('commentaire')->nullable();
            $table->dateTime('date_mouvement');
            $table->timestamps();
            
            $table->index('article_id');
            $table->index('user_id');
            $table->index('type_mouvement');
            $table->index('date_mouvement');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};