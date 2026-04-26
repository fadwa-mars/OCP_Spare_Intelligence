<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('historique_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->decimal('stock_avant', 10, 2);
            $table->decimal('stock_apres', 10, 2);
            $table->decimal('quantite_change', 10, 2);
            $table->enum('type_mouvement', ['entree', 'sortie', 'reservation', 'annulation']);
            $table->string('reference')->nullable();
            $table->dateTime('date_mouvement');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('article_id');
            $table->index('date_mouvement');
            $table->index('type_mouvement');
        });
    }

    public function down()
    {
        Schema::dropIfExists('historique_stocks');
    }
};