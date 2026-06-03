<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Torneo;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'api_token',
        'is_admin',
        'es_socio',
        'fecha_inicio_socio',
        'fecha_fin_socio',
        'suscripcion_cancelada',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
      protected function casts(): array
      {
          return [
              'email_verified_at' => 'datetime',
              'password' => 'hashed',
              'is_admin' => 'boolean',
              'es_socio' => 'boolean',
              'fecha_inicio_socio' => 'date',
              'fecha_fin_socio' => 'date',
              'suscripcion_cancelada' => 'boolean',
          ];
      }

      /**
       * Verifica si el usuario es socio activo (tiene membresía vigente)
       */
      public function esSocioActivo(): bool
      {
          if ($this->is_admin) {
              return false; // Los administradores no pueden ser socios
          }

          if (!$this->es_socio) {
              return false;
          }

          // Verificar que la fecha de fin sea futura
          if (!$this->fecha_fin_socio) {
              return false;
          }

          return $this->fecha_fin_socio->isFuture() || $this->fecha_fin_socio->isToday();
      }

      public function torneos()
      {
          return $this->belongsToMany(Torneo::class, 'torneo_user')->withTimestamps();
      }
  }
