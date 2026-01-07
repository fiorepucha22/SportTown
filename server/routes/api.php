<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InstalacionController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\SocioController;
use App\Http\Controllers\Api\TorneoController;

Route::get('/ping', function (Request $request) {
    return response()->json([
        'ok' => true,
        'message' => 'pong',
        'time' => now()->toISOString(),
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('token')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/instalaciones', [InstalacionController::class, 'index']);
Route::get('/instalaciones/{instalacion}', [InstalacionController::class, 'show']);
Route::get('/instalaciones/{instalacion}/disponibilidad', [ReservaController::class, 'disponibilidad']);

Route::middleware('token')->group(function () {
    // Admin CRUD instalaciones
    Route::post('/instalaciones', [InstalacionController::class, 'store']);
    Route::put('/instalaciones/{instalacion}', [InstalacionController::class, 'update']);
    Route::delete('/instalaciones/{instalacion}', [InstalacionController::class, 'destroy']);
});

Route::get('/torneos', [TorneoController::class, 'index']);
Route::get('/torneos/{torneo}', [TorneoController::class, 'show']);
Route::get('/torneos/{torneo}/ranking', [TorneoController::class, 'ranking']);
Route::get('/torneos/{torneo}/bracket', [TorneoController::class, 'bracket']);

Route::middleware('token')->group(function () {
    // Esta ruta debe ir ANTES de las rutas con {torneo} para evitar conflictos
    Route::get('/torneos/mis-torneos', [TorneoController::class, 'misTorneos']);
    Route::post('/torneos/{torneo}/inscribir', [TorneoController::class, 'inscribir']);
    Route::post('/torneos/{torneo}/desinscribir', [TorneoController::class, 'desinscribir']);
});

Route::middleware('token')->group(function () {
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::post('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
    Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy']);
    
    // Socio routes
    Route::get('/socio/estado', [SocioController::class, 'estado']);
    Route::post('/socio/hacerse-socio', [SocioController::class, 'hacerseSocio']);
    Route::post('/socio/cancelar-suscripcion', [SocioController::class, 'cancelarSuscripcion']);
    
    // Admin routes
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/inscripciones-torneos', [AdminController::class, 'inscripcionesTorneos']);
    
    // Admin CRUD torneos
    Route::get('/admin/torneos', [AdminController::class, 'indexTorneos']);
    Route::post('/admin/torneos', [AdminController::class, 'storeTorneo']);
    Route::put('/admin/torneos/{torneo}', [AdminController::class, 'updateTorneo']);
    Route::delete('/admin/torneos/{torneo}', [AdminController::class, 'destroyTorneo']);
});


