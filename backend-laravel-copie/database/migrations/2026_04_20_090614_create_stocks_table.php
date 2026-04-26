<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->decimal('stock_actuel', 10, 2)->default(0);
            $table->decimal('stock_reserve', 10, 2)->default(0);
            $table->decimal('stock_disponible', 10, 2)->default(0);
            $table->string('emplacement')->nullable();
            $table->date('date_dernier_mouvement')->nullable();
            $table->timestamps();
            
            $table->index('article_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stocks');
    }
};