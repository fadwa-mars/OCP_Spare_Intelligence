<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->foreignId('demande_achat_id')->nullable()->constrained('demande_achats')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['demande_achat_id']);
            $table->dropColumn('demande_achat_id');
        });
    }
};