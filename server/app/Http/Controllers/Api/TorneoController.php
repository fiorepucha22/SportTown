<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Torneo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TorneoController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $deporte = trim((string) $request->query('deporte', ''));
        $provincia = trim((string) $request->query('provincia', ''));
        $estado = trim((string) $request->query('estado', ''));
        
        $hoy = now()->startOfDay();

        $items = Torneo::query()
            ->where('activo', true)
            // Filtrar torneos que ya pasaron (fecha_fin < hoy)
            ->where('fecha_fin', '>=', $hoy)
            ->when($deporte !== '', fn ($query) => $query->where('deporte', $deporte))
            ->when($provincia !== '', fn ($query) => $query->where('provincia', $provincia))
            ->when($estado !== '', fn ($query) => $query->where('estado', $estado))
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('nombre', 'like', "%{$q}%")
                        ->orWhere('ciudad', 'like', "%{$q}%")
                        ->orWhere('sede', 'like', "%{$q}%");
                });
            })
            ->orderBy('fecha_inicio')
            ->orderBy('provincia')
            ->orderBy('ciudad')
            ->get()
            ->map(function ($torneo) use ($request, $hoy) {
                // Intentar obtener el usuario del token si está presente
                $user = null;
                $header = (string) $request->header('Authorization', '');
                if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
                    $token = trim((string) ($matches[1] ?? ''));
                    if ($token !== '') {
                        $user = \App\Models\User::query()->where('api_token', $token)->first();
                    }
                }
                
                $isInscrito = $user ? $torneo->users()->where('user_id', $user->id)->exists() : false;
                // Calcular inscritos reales desde la relación, no del campo que puede estar desincronizado
                $inscritosReales = $torneo->users()->count();
                
                // Si la fecha de inicio ya pasó o es hoy, cerrar inscripciones
                $fechaInicio = $torneo->fecha_inicio->startOfDay();
                $estadoFinal = $torneo->estado;
                if ($fechaInicio <= $hoy && $estadoFinal === 'abierto') {
                    $estadoFinal = 'cerrado';
                }
                
                return [
                    'id' => $torneo->id,
                    'nombre' => $torneo->nombre,
                    'deporte' => $torneo->deporte,
                    'categoria' => $torneo->categoria,
                    'fecha_inicio' => $torneo->fecha_inicio->format('Y-m-d'),
                    'fecha_fin' => $torneo->fecha_fin->format('Y-m-d'),
                    'provincia' => $torneo->provincia,
                    'ciudad' => $torneo->ciudad,
                    'sede' => $torneo->sede,
                    'descripcion' => $torneo->descripcion,
                    'cupo' => $torneo->cupo,
                    'inscritos' => $inscritosReales,
                    'estado' => $estadoFinal,
                    'is_inscrito' => $isInscrito,
                ];
            });

        return response()->json([
            'data' => $items,
        ]);
    }

    public function show(Request $request, $torneo)
    {
        // Si el parámetro es "mis-torneos", no es un ID válido
        if ($torneo === 'mis-torneos') {
            return response()->json([
                'message' => 'No encontrado',
            ], 404);
        }

        $torneoModel = Torneo::where('id', $torneo)->where('activo', true)->first();

        if (! $torneoModel) {
            return response()->json([
                'message' => 'No encontrado',
            ], 404);
        }

        // Calcular inscritos reales desde la relación y actualizar el modelo
        $inscritosReales = $torneoModel->users()->count();
        $torneoModel->inscritos = $inscritosReales;
        
        // Si la fecha de inicio ya pasó o es hoy, cerrar inscripciones
        $hoy = now()->startOfDay();
        $fechaInicio = $torneoModel->fecha_inicio->startOfDay();
        if ($fechaInicio <= $hoy && $torneoModel->estado === 'abierto') {
            $torneoModel->estado = 'cerrado';
        }

        return response()->json([
            'data' => $torneoModel,
        ]);
    }

    public function inscribir(Request $request, Torneo $torneo)
    {
        $user = $request->user();

        // Los administradores no pueden inscribirse a torneos
        if ($user->is_admin) {
            return response()->json([
                'message' => 'Los administradores no pueden inscribirse a torneos',
            ], 403);
        }

        if (! $torneo->activo) {
            return response()->json([
                'message' => 'Torneo no disponible',
            ], 404);
        }

        // Verificar que la fecha de inicio no haya pasado
        $hoy = now()->startOfDay();
        $fechaInicio = $torneo->fecha_inicio->startOfDay();
        if ($fechaInicio <= $hoy) {
            return response()->json([
                'message' => 'Las inscripciones están cerradas. El torneo ya comenzó o es hoy.',
            ], 422);
        }

        if ($torneo->estado !== 'abierto') {
            return response()->json([
                'message' => 'El torneo no está abierto para inscripciones',
            ], 422);
        }

        // Verificar si el usuario ya está inscrito
        if ($torneo->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Ya estás inscrito en este torneo',
            ], 409);
        }

        // Calcular inscritos reales desde la relación
        $inscritosReales = $torneo->users()->count();
        if ($inscritosReales >= $torneo->cupo) {
            // Actualizar estado a cerrado si está lleno
            $torneo->estado = 'cerrado';
            $torneo->save();

            return response()->json([
                'message' => 'El torneo está completo',
            ], 409);
        }

        // Crear la inscripción en la tabla pivot
        $torneo->users()->attach($user->id);

        // Sincronizar el campo inscritos con la realidad
        $inscritosReales = $torneo->users()->count();
        $torneo->inscritos = $inscritosReales;
        $torneo->save();

        // Si se llenó, cerrar automáticamente
        if ($inscritosReales >= $torneo->cupo) {
            $torneo->estado = 'cerrado';
            $torneo->save();
        }

        return response()->json([
            'data' => $torneo->fresh(),
            'message' => 'Inscripción realizada correctamente',
        ], 200);
    }

    public function desinscribir(Request $request, Torneo $torneo)
    {
        $user = $request->user();

        if (! $torneo->activo) {
            return response()->json([
                'message' => 'Torneo no disponible',
            ], 404);
        }

        // Verificar si el usuario está inscrito
        if (! $torneo->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'No estás inscrito en este torneo',
            ], 404);
        }

        // Eliminar la inscripción
        $torneo->users()->detach($user->id);

        // Sincronizar el campo inscritos con la realidad
        $inscritosReales = $torneo->users()->count();
        $torneo->inscritos = $inscritosReales;
        $torneo->save();

        // Si estaba cerrado y ahora hay plazas, reabrir
        if ($torneo->estado === 'cerrado' && $inscritosReales < $torneo->cupo) {
            $torneo->estado = 'abierto';
            $torneo->save();
        }

        return response()->json([
            'data' => $torneo->fresh(),
            'message' => 'Desinscripción realizada correctamente',
        ], 200);
    }

    public function misTorneos(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'No autorizado',
            ], 401);
        }

        try {
            $torneos = $user->torneos()
                ->where('torneos.activo', true)
                ->orderBy('torneos.fecha_inicio')
                ->get()
                ->map(function ($torneo) {
                    // Calcular inscritos reales desde la relación
                    $inscritosReales = $torneo->users()->count();
                    return [
                        'id' => $torneo->id,
                        'nombre' => $torneo->nombre,
                        'deporte' => $torneo->deporte,
                        'categoria' => $torneo->categoria,
                        'fecha_inicio' => $torneo->fecha_inicio->format('Y-m-d'),
                        'fecha_fin' => $torneo->fecha_fin->format('Y-m-d'),
                        'provincia' => $torneo->provincia,
                        'ciudad' => $torneo->ciudad,
                        'sede' => $torneo->sede,
                        'descripcion' => $torneo->descripcion,
                        'cupo' => $torneo->cupo,
                        'inscritos' => $inscritosReales,
                        'estado' => $torneo->estado,
                    ];
                });

            return response()->json([
                'data' => $torneos,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en misTorneos: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Error al cargar torneos: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }
}


