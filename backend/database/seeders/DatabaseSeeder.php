<?php

namespace Database\Seeders;

use App\Models\Instalacion;
use App\Models\Torneo;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Idempotente: evita romper el seed si ya existe el usuario.
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
            'name' => 'Test User',
                // El modelo castea 'password' como 'hashed'
                'password' => 'password',
                'is_admin' => false,
            ],
        );

        // Crear usuario administrador
        User::firstOrCreate(
            ['email' => 'admin@sporttown.com'],
            [
                'name' => 'Administrador',
                'password' => 'admin123',
                'is_admin' => true,
            ],
        );

        if (Instalacion::query()->count() === 0) {
            Instalacion::query()->insert([
                [
                    'nombre' => 'Pista de Pádel 1',
                    'tipo' => 'padel',
                    'descripcion' => 'Pista cubierta con iluminación LED.',
                    'ubicacion' => 'Zona Norte',
                    'precio_por_hora' => 12.00,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Pista de Pádel 2',
                    'tipo' => 'padel',
                    'descripcion' => 'Pista exterior, perfecta para tardes.',
                    'ubicacion' => 'Zona Norte',
                    'precio_por_hora' => 10.00,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Pista de Tenis Central',
                    'tipo' => 'tenis',
                    'descripcion' => 'Superficie rápida, con grada.',
                    'ubicacion' => 'Zona Centro',
                    'precio_por_hora' => 15.00,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Campo Fútbol Sala',
                    'tipo' => 'futbol_sala',
                    'descripcion' => 'Pabellón climatizado, marcadores digitales.',
                    'ubicacion' => 'Pabellón 1',
                    'precio_por_hora' => 28.00,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Piscina Cubierta',
                    'tipo' => 'piscina',
                    'descripcion' => 'Calles de nado, vestuarios renovados.',
                    'ubicacion' => 'Edificio Principal',
                    'precio_por_hora' => 8.00,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Gimnasio Funcional',
                    'tipo' => 'gimnasio',
                    'descripcion' => 'Zona de fuerza, cardio y clases.',
                    'ubicacion' => 'Planta 2',
                    'precio_por_hora' => 6.50,
                    'imagen_url' => null,
                    'activa' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        if (Torneo::query()->count() === 0) {
            Torneo::query()->insert([
                [
                    'nombre' => 'Open Pádel Valencia',
                    'deporte' => 'padel',
                    'categoria' => 'mixto',
                    'fecha_inicio' => now()->addDays(10)->toDateString(),
                    'fecha_fin' => now()->addDays(12)->toDateString(),
                    'provincia' => 'Valencia',
                    'ciudad' => 'València',
                    'sede' => 'Polideportivo Municipal',
                    'descripcion' => 'Torneo amateur abierto. Plazas limitadas.',
                    'cupo' => 32,
                    'inscritos' => 0,
                    'estado' => 'abierto',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Circuito Tenis Alicante',
                    'deporte' => 'tenis',
                    'categoria' => 'masculino',
                    'fecha_inicio' => now()->addDays(18)->toDateString(),
                    'fecha_fin' => now()->addDays(21)->toDateString(),
                    'provincia' => 'Alicante',
                    'ciudad' => 'Alicante',
                    'sede' => 'Club de Tenis Costa Blanca',
                    'descripcion' => 'Fase de grupos + eliminatorias. Nivel intermedio.',
                    'cupo' => 24,
                    'inscritos' => 0,
                    'estado' => 'abierto',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Liga Fútbol Sala Castellón',
                    'deporte' => 'futbol_sala',
                    'categoria' => 'mixto',
                    'fecha_inicio' => now()->addDays(7)->toDateString(),
                    'fecha_fin' => now()->addDays(40)->toDateString(),
                    'provincia' => 'Castellón',
                    'ciudad' => 'Castelló de la Plana',
                    'sede' => 'Pabellón Central',
                    'descripcion' => 'Liga por jornadas. Equipos de 10-12 jugadores.',
                    'cupo' => 12,
                    'inscritos' => 0,
                    'estado' => 'abierto',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'Torneo Express Pádel (Alicante)',
                    'deporte' => 'padel',
                    'categoria' => 'femenino',
                    'fecha_inicio' => now()->addDays(3)->toDateString(),
                    'fecha_fin' => now()->addDays(3)->toDateString(),
                    'provincia' => 'Alicante',
                    'ciudad' => 'Elche',
                    'sede' => 'Centro Deportivo Elx',
                    'descripcion' => 'Formato rápido en un solo día. Premios para finalistas.',
                    'cupo' => 16,
                    'inscritos' => 0,
                    'estado' => 'abierto',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}
