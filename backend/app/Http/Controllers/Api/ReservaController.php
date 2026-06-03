<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instalacion;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    /**
     * Availability for an instalacion on a given date.
     * Public endpoint used by the client to disable already-booked slots.
     */
    public function disponibilidad(Request $request, Instalacion $instalacion)
    {
        if (! $instalacion->activa) {
            return response()->json([
                'message' => 'No encontrado',
            ], 404);
        }

        $data = $request->validate([
            'fecha' => ['required', 'date'],
        ]);

        $reservas = Reserva::query()
            ->where('instalacion_id', $instalacion->id)
            ->whereDate('fecha', $data['fecha'])
            ->whereIn('estado', ['confirmada', 'pendiente'])
            ->orderBy('hora_inicio')
            ->get(['hora_inicio', 'hora_fin', 'estado']);

        return response()->json([
            'data' => [
                'instalacion_id' => $instalacion->id,
                'fecha' => $data['fecha'],
                'reservas' => $reservas,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $reservas = Reserva::query()
            ->with(['instalacion:id,nombre,tipo,precio_por_hora'])
            ->where('user_id', $user?->id)
            ->orderByDesc('fecha')
            ->orderByDesc('hora_inicio')
            ->get()
            ->map(function ($reserva) {
                // Determinar si la reserva está completada (fecha y hora ya pasaron)
                $fechaReserva = Carbon::parse($reserva->fecha);
                $horaFin = Carbon::createFromFormat('H:i:s', $reserva->hora_fin);
                $fechaHoraFin = $fechaReserva->copy()->setTimeFromTimeString($reserva->hora_fin);
                
                // Si la fecha y hora de fin ya pasaron, marcar como completada
                if ($reserva->estado === 'confirmada' && $fechaHoraFin->isPast()) {
                    $reserva->estado = 'completada';
                    $reserva->save();
                }
                
                return $reserva;
            });

        return response()->json([
            'data' => $reservas,
        ]);
    }

    /**
     * Obtener información de reembolso para una reserva (sin cancelarla)
     */
    public function infoReembolso(Request $request, Reserva $reserva)
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario
        if ($reserva->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Verificar que la reserva no esté ya cancelada
        if ($reserva->estado === 'cancelada') {
            return response()->json([
                'message' => 'Esta reserva ya está cancelada',
            ], 422);
        }

        // Calcular el reembolso según si es socio o no
        $precioPagado = (float) $reserva->precio_total;
        $esSocio = $user->esSocioActivo();
        
        // Si es socio: 100% de reembolso, si no: 50% de reembolso
        $montoReembolso = $esSocio ? $precioPagado : ($precioPagado * 0.5);

        return response()->json([
            'data' => [
                'precio_pagado' => round($precioPagado, 2),
                'monto_reembolso' => round($montoReembolso, 2),
                'porcentaje_reembolso' => $esSocio ? 100 : 50,
                'es_socio' => $esSocio,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Los administradores no pueden reservar instalaciones
        if ($user->is_admin) {
            return response()->json([
                'message' => 'Los administradores no pueden reservar instalaciones',
            ], 403);
        }

        $data = $request->validate([
            'instalacion_id' => ['required', 'integer', 'exists:instalaciones,id'],
            'fecha' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i'],
        ]);

        $start = Carbon::createFromFormat('H:i', $data['hora_inicio']);
        $end = Carbon::createFromFormat('H:i', $data['hora_fin']);

        if ($end->lessThanOrEqualTo($start)) {
            return response()->json([
                'message' => 'La hora de fin debe ser mayor que la de inicio',
            ], 422);
        }

        /** @var Instalacion $instalacion */
        $instalacion = Instalacion::query()->findOrFail($data['instalacion_id']);

        if (! $instalacion->activa) {
            return response()->json([
                'message' => 'No encontrado',
            ], 404);
        }

        $conflict = Reserva::query()
            ->where('instalacion_id', $instalacion->id)
            ->whereDate('fecha', $data['fecha'])
            ->where('hora_inicio', '<', $data['hora_fin'])
            ->where('hora_fin', '>', $data['hora_inicio'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Ya existe una reserva en ese horario',
            ], 409);
        }

        $minutes = $start->diffInMinutes($end);
        $hours = $minutes / 60;
        $precioBase = (float) $instalacion->precio_por_hora * $hours;
        
        // Aplicar descuento del 15% si el usuario es socio activo
        $descuento = 0;
        $precioTotal = $precioBase;
        
        if ($user->esSocioActivo()) {
            $descuento = $precioBase * 0.15; // 15% de descuento
            $precioTotal = $precioBase - $descuento;
        }

        $reserva = Reserva::create([
            'instalacion_id' => $instalacion->id,
            'user_id' => $user?->id,
            'fecha' => $data['fecha'],
            'hora_inicio' => $data['hora_inicio'],
            'hora_fin' => $data['hora_fin'],
            'precio_total' => round($precioTotal, 2),
            'estado' => 'confirmada',
        ]);

        return response()->json([
            'data' => $reserva,
            'meta' => [
                'precio_base' => round($precioBase, 2),
                'descuento_socio' => round($descuento, 2),
                'precio_final' => round($precioTotal, 2),
                'es_socio' => $user->esSocioActivo(),
            ],
        ], 201);
    }

    /**
     * Cancelar una reserva
     */
    public function cancelar(Request $request, Reserva $reserva)
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario
        if ($reserva->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Verificar que la reserva no esté ya cancelada
        if ($reserva->estado === 'cancelada') {
            return response()->json([
                'message' => 'Esta reserva ya está cancelada',
            ], 422);
        }

        // Calcular el reembolso según si es socio o no
        $precioPagado = (float) $reserva->precio_total;
        $esSocio = $user->esSocioActivo();
        
        // Si es socio: 100% de reembolso, si no: 50% de reembolso
        $montoReembolso = $esSocio ? $precioPagado : ($precioPagado * 0.5);

        // Actualizar el estado de la reserva
        $reserva->estado = 'cancelada';
        $reserva->save();

        return response()->json([
            'message' => $esSocio 
                ? 'Reserva cancelada. Se te reembolsará el 100% del monto pagado.'
                : 'Reserva cancelada. Se te reembolsará el 50% del monto pagado.',
            'data' => [
                'reserva' => $reserva,
                'precio_pagado' => round($precioPagado, 2),
                'monto_reembolso' => round($montoReembolso, 2),
                'porcentaje_reembolso' => $esSocio ? 100 : 50,
                'es_socio' => $esSocio,
            ],
        ]);
    }

    /**
     * Eliminar una reserva (solo canceladas o completadas)
     */
    public function destroy(Request $request, Reserva $reserva)
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario
        if ($reserva->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Solo se pueden eliminar reservas canceladas o completadas
        if (!in_array($reserva->estado, ['cancelada', 'completada'])) {
            return response()->json([
                'message' => 'Solo se pueden eliminar reservas canceladas o completadas',
            ], 422);
        }

        $reserva->delete();

        return response()->json([
            'message' => 'Reserva eliminada exitosamente',
        ]);
    }
}


