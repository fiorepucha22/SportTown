<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SocioController extends Controller
{
    /**
     * Hacerse socio (suscripción mensual)
     */
    public function hacerseSocio(Request $request)
    {
        $user = $request->user();

        // Los administradores no pueden hacerse socios
        if ($user->is_admin) {
            return response()->json([
                'message' => 'Los administradores no pueden hacerse socios',
            ], 403);
        }

        $data = $request->validate([
            'payment_id' => ['required', 'string'],
        ]);

        // Si ya es socio activo, extender la suscripción
        $fechaInicio = now();
        $fechaFin = now()->addMonth();

        // Si ya tiene una suscripción activa, extender desde la fecha de fin
        if ($user->es_socio && $user->fecha_fin_socio && $user->fecha_fin_socio->isFuture()) {
            $fechaInicio = $user->fecha_fin_socio;
            $fechaFin = $fechaInicio->copy()->addMonth();
        }

        $user->es_socio = true;
        $user->fecha_inicio_socio = $fechaInicio;
        $user->fecha_fin_socio = $fechaFin;
        $user->suscripcion_cancelada = false; // Reactivar la suscripción si estaba cancelada
        $user->save();

        return response()->json([
            'message' => 'Te has convertido en socio exitosamente. Disfruta de descuentos exclusivos en todas las instalaciones.',
            'data' => [
                'es_socio' => $user->es_socio,
                'fecha_inicio_socio' => $user->fecha_inicio_socio->format('Y-m-d'),
                'fecha_fin_socio' => $user->fecha_fin_socio->format('Y-m-d'),
                'es_socio_activo' => $user->esSocioActivo(),
                'payment_id' => $data['payment_id'],
            ],
        ]);
    }

    /**
     * Obtener el estado de socio del usuario actual
     */
    public function estado(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'es_socio' => $user->es_socio,
                'fecha_inicio_socio' => $user->fecha_inicio_socio ? $user->fecha_inicio_socio->format('Y-m-d') : null,
                'fecha_fin_socio' => $user->fecha_fin_socio ? $user->fecha_fin_socio->format('Y-m-d') : null,
                'es_socio_activo' => $user->esSocioActivo(),
                'suscripcion_cancelada' => $user->suscripcion_cancelada ?? false,
                'puede_hacerse_socio' => !$user->is_admin,
            ],
        ]);
    }

    /**
     * Cancelar suscripción de socio
     */
    public function cancelarSuscripcion(Request $request)
    {
        $user = $request->user();

        // Los administradores no pueden cancelar suscripciones
        if ($user->is_admin) {
            return response()->json([
                'message' => 'Los administradores no pueden cancelar suscripciones',
            ], 403);
        }

        if (!$user->es_socio) {
            return response()->json([
                'message' => 'No eres socio, no hay suscripción que cancelar',
            ], 422);
        }

        // Marcar la suscripción como cancelada
        // El usuario mantendrá los beneficios hasta que expire la fecha_fin_socio
        $user->suscripcion_cancelada = true;
        $user->save();

        return response()->json([
            'message' => 'Suscripción cancelada. Podrás seguir disfrutando de los beneficios hasta que expire tu suscripción actual.',
            'data' => [
                'es_socio' => $user->es_socio,
                'fecha_fin_socio' => $user->fecha_fin_socio ? $user->fecha_fin_socio->format('Y-m-d') : null,
                'es_socio_activo' => $user->esSocioActivo(),
                'suscripcion_cancelada' => true,
            ],
        ]);
    }
}
