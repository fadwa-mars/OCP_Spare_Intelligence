<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('demande_achats', function (Blueprint $table) {
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->onDelete('set null');
            $table->foreignId('appel_offre_id')->nullable()->constrained('appel_offres')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('demande_achats', function (Blueprint $table) {
            $table->dropForeign(['commande_id']);
            $table->dropForeign(['appel_offre_id']);
            $table->dropColumn(['commande_id', 'appel_offre_id']);
        });
    }
};