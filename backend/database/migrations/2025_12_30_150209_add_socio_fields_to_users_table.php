<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('es_socio')->default(false)->after('is_admin');
            $table->date('fecha_inicio_socio')->nullable()->after('es_socio');
            $table->date('fecha_fin_socio')->nullable()->after('fecha_inicio_socio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['es_socio', 'fecha_inicio_socio', 'fecha_fin_socio']);
        });
    }
};
