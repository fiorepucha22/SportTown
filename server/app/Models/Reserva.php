<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'reservas';

    protected $fillable = [
        'instalacion_id',
        'user_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'precio_total',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'precio_total' => 'decimal:2',
        ];
    }

    public function instalacion(): BelongsTo
    {
        return $this->belongsTo(Instalacion::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}


