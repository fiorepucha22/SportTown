<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instalaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo')->index();
            $table->text('descripcion')->nullable();
            $table->string('ubicacion')->nullable();
            $table->decimal('precio_por_hora', 8, 2);
            $table->string('imagen_url')->nullable();
            $table->boolean('activa')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instalaciones');
    }
};


