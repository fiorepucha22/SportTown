<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Lista todos los usuarios registrados';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->info('No hay usuarios registrados.');
            return Command::SUCCESS;
        }

        $this->info("Total de usuarios: {$users->count()}\n");
        
        $tableData = $users->map(function ($user) {
            return [
                'ID' => $user->id,
                'Nombre' => $user->name,
                'Email' => $user->email,
                'Admin' => $user->is_admin ? 'Sí' : 'No',
                'Socio' => $user->es_socio ? 'Sí' : 'No',
                'Registrado' => $user->created_at->format('Y-m-d H:i'),
            ];
        })->toArray();

        $this->table(
            ['ID', 'Nombre', 'Email', 'Admin', 'Socio', 'Registrado'],
            $tableData
        );

        return Command::SUCCESS;
    }
}
