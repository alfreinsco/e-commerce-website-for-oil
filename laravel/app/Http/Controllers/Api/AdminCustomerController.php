<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    /**
     * Daftar pelanggan (user dengan role customer). Query: search (optional).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureAdmin($user);

        $query = User::query()
            ->where(function ($q) {
                $q->where('role', 'customer')
                    ->orWhereNull('role')
                    ->orWhere('role', '');
            });

        $search = $request->input('search');
        if ($search && is_string($search)) {
            $term = trim($search);
            if ($term !== '') {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', '%'.$term.'%')
                        ->orWhere('email', 'like', '%'.$term.'%')
                        ->orWhere('phone', 'like', '%'.$term.'%');
                });
            }
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        $data = $users->map(function (User $u) {
            return [
                'id' => (string) $u->id,
                'email' => $u->email,
                'fullName' => $u->name ?? '',
                'phone' => $u->phone ?? null,
                'role' => 'customer',
                'createdAt' => $u->created_at?->toDateTimeString(),
                'totalOrders' => 0,
                'totalSpent' => 0,
            ];
        });

        return response()->json(['data' => $data]);
    }
}
