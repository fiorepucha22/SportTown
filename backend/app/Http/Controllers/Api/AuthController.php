<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Reglas para una contraseña segura:
     * mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.
     */
    private function passwordRules(bool $required = true): array
    {
        $rules = [
            'string',
            'min:8',
            'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
        ];

        array_unshift($rules, $required ? 'required' : 'nullable');

        return $rules;
    }

    private function passwordMessages(): array
    {
        return [
            'password.regex' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
        ];
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
        ], $this->passwordMessages());

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $token = Str::random(60);
        $user->forceFill(['api_token' => $token])->save();

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas',
            ], 422);
        }

        $token = Str::random(60);
        $user->forceFill(['api_token' => $token])->save();

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Actualizar el perfil del usuario autenticado (nombre, email y/o contraseña).
     */
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => ['nullable', 'string'],
            'password' => $this->passwordRules(false),
        ], $this->passwordMessages());

        // Si quiere cambiar la contraseña, verificar la actual
        if (! empty($data['password'])) {
            if (empty($data['current_password']) || ! Hash::check($data['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual no es correcta.',
                ], 422);
            }

            $user->password = $data['password'];
        }

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user) {
            $user->forceFill(['api_token' => null])->save();
        }

        return response()->json([
            'ok' => true,
        ]);
    }
}
