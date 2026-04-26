<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('offres', function (Blueprint $table) {
            $table->enum('statut', ['soumise', 'acceptee', 'rejetee'])->default('soumise')->after('date_soumission');
        });
    }

    public function down()
    {
        Schema::table('offres', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};