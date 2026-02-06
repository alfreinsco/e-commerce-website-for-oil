<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AdminAccountController extends Controller
{
    /**
     * Admin login: returns token and user (untuk integrasi Next.js).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => ['Akun ini bukan admin.'],
            ]);
        }

        $token = Str::random(80);
        $user->forceFill(['api_token' => $token])->save();

        return response()->json([
            'token' => $token,
            'user' => $this->userResource($user),
        ]);
    }

    /**
     * Get current admin profile (Bearer token).
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureAdmin($user);

        return response()->json(['user' => $this->userResource($user)]);
    }

    /**
     * Update admin profile (full name only).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureAdmin($user);

        $request->validate([
            'full_name' => 'required|string|max:255',
        ]);

        $user->update(['name' => $request->full_name]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $this->userResource($user),
        ]);
    }

    /**
     * Change admin password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureAdmin($user);

        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'confirmed', Password::min(6)],
        ], [
            'password.min' => 'Password baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sama.',
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    /**
     * Logout: invalidate token (optional, clear token on server).
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->forceFill(['api_token' => null])->save();
        }

        return response()->json(['message' => 'Berhasil logout']);
    }

    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function userResource(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'email' => $user->email,
            'fullName' => $user->name,
            'role' => $user->role ?? 'admin',
            'createdAt' => $user->created_at?->toIso8601String(),
        ];
    }
}
