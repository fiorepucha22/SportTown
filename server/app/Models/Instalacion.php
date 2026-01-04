<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instalacion extends Model
{
    use HasFactory;

    protected $table = 'instalaciones';

    protected $fillable = [
        'nombre',
        'tipo',
        'descripcion',
        'ubicacion',
        'precio_por_hora',
        'imagen_url',
        'activa',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
            'precio_por_hora' => 'decimal:2',
        ];
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}


