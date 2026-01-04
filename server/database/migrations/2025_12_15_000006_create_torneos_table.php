<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('torneos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('deporte')->index(); // padel, tenis, futbol_sala, etc.
            $table->string('categoria')->nullable()->index(); // masculino, femenino, mixto, sub18...
            $table->date('fecha_inicio')->index();
            $table->date('fecha_fin')->index();
            $table->string('provincia')->index(); // Valencia, Alicante, Castellón
            $table->string('ciudad')->index();
            $table->string('sede')->nullable();
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('cupo')->default(16);
            $table->unsignedInteger('inscritos')->default(0);
            $table->string('estado')->default('abierto')->index(); // abierto, cerrado, finalizado
            $table->boolean('activo')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('torneos');
    }
};


