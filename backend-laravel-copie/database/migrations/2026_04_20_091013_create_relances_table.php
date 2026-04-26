<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('relances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('niveau');
            $table->enum('type_relance', ['email', 'telephone', 'reunion']);
            $table->text('message');
            $table->dateTime('date_envoi');
            $table->boolean('reponse_recue')->default(false);
            $table->text('reponse_detail')->nullable();
            $table->timestamps();
            
            $table->index('commande_id');
            $table->index('niveau');
            $table->index('date_envoi');
        });
    }

    public function down()
    {
        Schema::dropIfExists('relances');
    }
};