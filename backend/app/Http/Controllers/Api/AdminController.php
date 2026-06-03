<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Instalacion;
use App\Models\Torneo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Estadísticas generales
        $totalReservas = Reserva::where('estado', 'confirmada')->count();
        $totalGanancias = Reserva::where('estado', 'confirmada')->sum('precio_total');
        
        // Reservas por día (últimos 30 días)
        $reservasPorDia = Reserva::where('estado', 'confirmada')
            ->where('fecha', '>=', Carbon::now()->subDays(30))
            ->select(
                DB::raw('DATE(fecha) as dia'),
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(precio_total) as ganancias')
            )
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        // Reservas por instalación
        $reservasPorInstalacion = Reserva::where('estado', 'confirmada')
            ->with('instalacion:id,nombre')
            ->select(
                'instalacion_id',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(precio_total) as ganancias')
            )
            ->groupBy('instalacion_id')
            ->get()
            ->map(function ($item) {
                return [
                    'instalacion' => $item->instalacion?->nombre ?? 'Desconocida',
                    'cantidad' => $item->cantidad,
                    'ganancias' => (float) $item->ganancias,
                ];
            });

        // Ganancias por mes (últimos 12 meses)
        // Usar funciones MySQL/MariaDB (YEAR y MONTH)
        $gananciasPorMes = Reserva::where('estado', 'confirmada')
            ->where('fecha', '>=', Carbon::now()->subMonths(12))
            ->select(
                DB::raw('YEAR(fecha) as año'),
                DB::raw('MONTH(fecha) as mes'),
                DB::raw('SUM(precio_total) as ganancias')
            )
            ->groupBy('año', 'mes')
            ->orderBy('año')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'periodo' => Carbon::create($item->año, $item->mes, 1)->format('Y-m'),
                    'ganancias' => (float) $item->ganancias,
                ];
            });

        // Todas las reservas con detalles
        $todasReservas = Reserva::with(['instalacion:id,nombre,tipo', 'user:id,name,email'])
            ->orderByDesc('fecha')
            ->orderByDesc('hora_inicio')
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id,
                    'instalacion' => $reserva->instalacion?->nombre ?? 'Desconocida',
                    'tipo' => $reserva->instalacion?->tipo ?? 'N/A',
                    'usuario' => $reserva->user?->name ?? 'Desconocido',
                    'email' => $reserva->user?->email ?? 'N/A',
                    'fecha' => $reserva->fecha->format('Y-m-d'),
                    'hora_inicio' => $reserva->hora_inicio,
                    'hora_fin' => $reserva->hora_fin,
                    'precio_total' => (float) $reserva->precio_total,
                    'estado' => $reserva->estado,
                    'created_at' => $reserva->created_at->toISOString(),
                ];
            });

        return response()->json([
            'data' => [
                'total_reservas' => $totalReservas,
                'total_ganancias' => (float) $totalGanancias,
                'reservas_por_dia' => $reservasPorDia,
                'reservas_por_instalacion' => $reservasPorInstalacion,
                'ganancias_por_mes' => $gananciasPorMes,
                'todas_reservas' => $todasReservas,
            ],
        ]);
    }

    public function inscripcionesTorneos(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Obtener todas las inscripciones con información de torneo y usuario
        $inscripciones = DB::table('torneo_user')
            ->join('torneos', 'torneo_user.torneo_id', '=', 'torneos.id')
            ->join('users', 'torneo_user.user_id', '=', 'users.id')
            ->select(
                'torneo_user.id as inscripcion_id',
                'torneos.id as torneo_id',
                'torneos.nombre as torneo_nombre',
                'torneos.deporte',
                'torneos.categoria',
                'torneos.fecha_inicio',
                'torneos.fecha_fin',
                'torneos.provincia',
                'torneos.ciudad',
                'torneos.estado as torneo_estado',
                'users.id as user_id',
                'users.name as user_name',
                'users.email as user_email',
                'torneo_user.created_at as fecha_inscripcion'
            )
            ->orderByDesc('torneo_user.created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'inscripcion_id' => $item->inscripcion_id,
                    'torneo' => [
                        'id' => $item->torneo_id,
                        'nombre' => $item->torneo_nombre,
                        'deporte' => $item->deporte,
                        'categoria' => $item->categoria,
                        'fecha_inicio' => $item->fecha_inicio,
                        'fecha_fin' => $item->fecha_fin,
                        'provincia' => $item->provincia,
                        'ciudad' => $item->ciudad,
                        'estado' => $item->torneo_estado,
                    ],
                    'usuario' => [
                        'id' => $item->user_id,
                        'name' => $item->user_name,
                        'email' => $item->user_email,
                    ],
                    'fecha_inscripcion' => Carbon::parse($item->fecha_inscripcion)->toISOString(),
                ];
            });

        // Estadísticas
        $totalInscripciones = $inscripciones->count();
        $inscripcionesPorTorneo = $inscripciones->groupBy('torneo.id')->map(function ($group) {
            return [
                'torneo' => $group->first()['torneo'],
                'total_inscritos' => $group->count(),
            ];
        })->values();

        return response()->json([
            'data' => [
                'total_inscripciones' => $totalInscripciones,
                'inscripciones' => $inscripciones,
                'inscripciones_por_torneo' => $inscripcionesPorTorneo,
            ],
        ]);
    }

    public function indexTorneos(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $hoy = now()->startOfDay();
        
        $torneos = Torneo::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($torneo) use ($hoy) {
                $inscritosReales = $torneo->users()->count();
                
                // Calcular estado basado en fechas
                $fechaInicio = $torneo->fecha_inicio->startOfDay();
                $fechaFin = $torneo->fecha_fin->startOfDay();
                $estadoFinal = $torneo->estado;
                
                // Si la fecha de fin ya pasó, el torneo está finalizado
                if ($fechaFin < $hoy) {
                    $estadoFinal = 'finalizado';
                }
                // Si la fecha de inicio ya pasó pero la fecha fin no, cerrar inscripciones
                elseif ($fechaInicio <= $hoy && $estadoFinal === 'abierto') {
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
                    'activo' => $torneo->activo,
                    'created_at' => $torneo->created_at->toISOString(),
                    'updated_at' => $torneo->updated_at->toISOString(),
                ];
            });

        return response()->json([
            'data' => $torneos,
        ]);
    }

    public function storeTorneo(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'deporte' => 'required|string|max:255',
            'categoria' => 'nullable|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'provincia' => 'required|string|max:255',
            'ciudad' => 'required|string|max:255',
            'sede' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'cupo' => 'required|integer|min:1',
        ]);

        // Al crear, siempre comienza como 'abierto'
        $torneo = Torneo::create([
            'nombre' => $validated['nombre'],
            'deporte' => $validated['deporte'],
            'categoria' => $validated['categoria'] ?? null,
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'provincia' => $validated['provincia'],
            'ciudad' => $validated['ciudad'],
            'sede' => $validated['sede'] ?? null,
            'descripcion' => $validated['descripcion'] ?? null,
            'cupo' => $validated['cupo'],
            'inscritos' => 0,
            'estado' => 'abierto',
            'activo' => true,
        ]);

        return response()->json([
            'data' => $torneo,
            'message' => 'Torneo creado correctamente',
        ], 201);
    }

    public function updateTorneo(Request $request, Torneo $torneo)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'deporte' => 'sometimes|required|string|max:255',
            'categoria' => 'nullable|string|max:255',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'provincia' => 'sometimes|required|string|max:255',
            'ciudad' => 'sometimes|required|string|max:255',
            'sede' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'cupo' => 'sometimes|required|integer|min:1',
            'activo' => 'sometimes|boolean',
        ]);

        // No permitir actualizar el estado manualmente - se calcula automáticamente
        unset($validated['estado']);

        $torneo->update($validated);

        // Sincronizar inscritos reales
        $inscritosReales = $torneo->users()->count();
        $torneo->inscritos = $inscritosReales;
        
        // Calcular estado automáticamente basado en fechas y plazas
        $hoy = now()->startOfDay();
        $fechaInicio = $torneo->fecha_inicio->startOfDay();
        $fechaFin = $torneo->fecha_fin->startOfDay();
        
        // Si la fecha de fin ya pasó, el torneo está finalizado
        if ($fechaFin < $hoy) {
            $torneo->estado = 'finalizado';
        }
        // Si la fecha de inicio ya pasó pero la fecha fin no, cerrar inscripciones
        elseif ($fechaInicio <= $hoy && $torneo->estado === 'abierto') {
            $torneo->estado = 'cerrado';
        }
        // Si se llenaron las plazas, cerrar
        elseif ($inscritosReales >= $torneo->cupo && $torneo->estado === 'abierto') {
            $torneo->estado = 'cerrado';
        }
        
        $torneo->save();

        return response()->json([
            'data' => $torneo->fresh(),
            'message' => 'Torneo actualizado correctamente',
        ]);
    }

    public function destroyTorneo(Request $request, Torneo $torneo)
    {
        $user = $request->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Eliminar todas las inscripciones relacionadas
        $torneo->users()->detach();

        // Eliminar el torneo
        $torneo->delete();

        return response()->json([
            'message' => 'Torneo eliminado correctamente',
        ]);
    }
}
