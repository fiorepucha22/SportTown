<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            // Los torneos se celebran dentro del polideportivo: la provincia ya no es obligatoria.
            $table->string('provincia')->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->string('provincia')->nullable(false)->change();
        });
    }
};
