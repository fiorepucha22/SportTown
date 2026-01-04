<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Torneo extends Model
{
    use HasFactory;

    protected $table = 'torneos';

    protected $fillable = [
        'nombre',
        'deporte',
        'categoria',
        'fecha_inicio',
        'fecha_fin',
        'provincia',
        'ciudad',
        'sede',
        'descripcion',
        'cupo',
        'inscritos',
        'estado',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'activo' => 'boolean',
        ];
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'torneo_user')->withTimestamps();
    }
}


