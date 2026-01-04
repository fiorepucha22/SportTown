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
}


