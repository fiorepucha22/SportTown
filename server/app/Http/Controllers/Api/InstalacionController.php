<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instalacion;
use Illuminate\Http\Request;

class InstalacionController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $tipo = trim((string) $request->query('tipo', ''));

        $items = Instalacion::query()
            ->where('activa', true)
            ->when($tipo !== '', fn ($query) => $query->where('tipo', $tipo))
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('nombre', 'like', "%{$q}%")
                        ->orWhere('descripcion', 'like', "%{$q}%")
                        ->orWhere('ubicacion', 'like', "%{$q}%");
                });
            })
            ->orderBy('tipo')
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function show(Instalacion $instalacion)
    {
        if (! $instalacion->activa) {
            return response()->json([
                'message' => 'No encontrado',
            ], 404);
        }

        return response()->json([
            'data' => $instalacion,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
            'precio_por_hora' => ['required', 'numeric', 'min:0'],
            'imagen_url' => ['nullable', 'string', 'max:500'],
            'activa' => ['boolean'],
        ]);

        $instalacion = Instalacion::create([
            'nombre' => $data['nombre'],
            'tipo' => $data['tipo'],
            'descripcion' => $data['descripcion'] ?? null,
            'ubicacion' => $data['ubicacion'] ?? null,
            'precio_por_hora' => $data['precio_por_hora'],
            'imagen_url' => $data['imagen_url'] ?? null,
            'activa' => $data['activa'] ?? true,
        ]);

        return response()->json([
            'data' => $instalacion,
            'message' => 'Instalación creada correctamente',
        ], 201);
    }

    public function update(Request $request, Instalacion $instalacion)
    {
        $user = $request->user();

        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'tipo' => ['sometimes', 'required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
            'precio_por_hora' => ['sometimes', 'required', 'numeric', 'min:0'],
            'imagen_url' => ['nullable', 'string', 'max:500'],
            'activa' => ['sometimes', 'boolean'],
        ]);

        $instalacion->update($data);

        return response()->json([
            'data' => $instalacion->fresh(),
            'message' => 'Instalación actualizada correctamente',
        ]);
    }

    public function destroy(Request $request, Instalacion $instalacion)
    {
        $user = $request->user();

        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        // Verificar si hay reservas asociadas
        if ($instalacion->reservas()->whereIn('estado', ['confirmada', 'pendiente'])->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar una instalación con reservas activas',
            ], 422);
        }

        $instalacion->delete();

        return response()->json([
            'message' => 'Instalación eliminada correctamente',
        ]);
    }
}


