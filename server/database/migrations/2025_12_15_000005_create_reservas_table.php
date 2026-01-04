<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instalacion_id')->constrained('instalaciones')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->decimal('precio_total', 8, 2);
            $table->string('estado')->default('pendiente')->index();
            $table->timestamps();

            $table->index(['instalacion_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};


