<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminVoucherController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function toItem(Voucher $v): array
    {
        return [
            'id' => (string) $v->id,
            'code' => $v->code,
            'type' => $v->type,
            'discount' => (int) $v->discount,
            'minPurchase' => (int) $v->min_purchase,
            'description' => $v->description,
            'validFrom' => $v->valid_from?->format('Y-m-d'),
            'validTo' => $v->valid_to?->format('Y-m-d'),
            'usageLimit' => $v->usage_limit,
            'usedCount' => (int) $v->used_count,
            'isActive' => (bool) $v->is_active,
        ];
    }

    /**
     * Daftar voucher. Query: search (optional), type (optional).
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = Voucher::query()->orderBy('created_at', 'desc');

        $search = $request->input('search');
        if ($search && is_string($search)) {
            $term = trim($search);
            if ($term !== '') {
                $query->where(function ($q) use ($term) {
                    $q->where('code', 'like', '%'.$term.'%')
                        ->orWhere('description', 'like', '%'.$term.'%');
                });
            }
        }

        $type = $request->input('type');
        if ($type && in_array($type, ['percentage', 'fixed', 'free_shipping'], true)) {
            $query->where('type', $type);
        }

        $data = $query->get()->map(fn (Voucher $v) => $this->toItem($v));

        return response()->json(['data' => $data]);
    }

    /**
     * Buat voucher baru.
     */
    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:vouchers,code', 'regex:/^[A-Z0-9_]+$/i'],
            'type' => ['required', Rule::in(['percentage', 'fixed', 'free_shipping'])],
            'discount' => ['required', 'integer', 'min:0'],
            'minPurchase' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'validFrom' => ['nullable', 'date'],
            'validTo' => ['nullable', 'date', 'after_or_equal:validFrom'],
            'usageLimit' => ['nullable', 'integer', 'min:1'],
            'isActive' => ['boolean'],
        ]);

        $voucher = new Voucher;
        $voucher->code = strtoupper(trim($validated['code']));
        $voucher->type = $validated['type'];
        $voucher->discount = (int) $validated['discount'];
        $voucher->min_purchase = (int) $validated['minPurchase'];
        $voucher->description = $validated['description'] ?? null;
        $voucher->valid_from = isset($validated['validFrom']) ? $validated['validFrom'] : null;
        $voucher->valid_to = isset($validated['validTo']) ? $validated['validTo'] : null;
        $voucher->usage_limit = $validated['usageLimit'] ?? null;
        $voucher->is_active = $validated['isActive'] ?? true;
        $voucher->save();

        return response()->json(['data' => $this->toItem($voucher)], 201);
    }

    /**
     * Update voucher (termasuk toggle isActive).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $voucher = Voucher::find($id);
        if (! $voucher) {
            abort(404, 'Voucher tidak ditemukan.');
        }

        $rules = [
            'type' => [Rule::in(['percentage', 'fixed', 'free_shipping'])],
            'discount' => ['integer', 'min:0'],
            'minPurchase' => ['integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'validFrom' => ['nullable', 'date'],
            'validTo' => ['nullable', 'date'],
            'usageLimit' => ['nullable', 'integer', 'min:1'],
            'isActive' => ['boolean'],
        ];

        $validated = $request->validate($rules);

        if (array_key_exists('type', $validated)) {
            $voucher->type = $validated['type'];
        }
        if (array_key_exists('discount', $validated)) {
            $voucher->discount = (int) $validated['discount'];
        }
        if (array_key_exists('minPurchase', $validated)) {
            $voucher->min_purchase = (int) $validated['minPurchase'];
        }
        if (array_key_exists('description', $validated)) {
            $voucher->description = $validated['description'];
        }
        if (array_key_exists('validFrom', $validated)) {
            $voucher->valid_from = $validated['validFrom'] ?: null;
        }
        if (array_key_exists('validTo', $validated)) {
            $voucher->valid_to = $validated['validTo'] ?: null;
        }
        if (array_key_exists('usageLimit', $validated)) {
            $voucher->usage_limit = $validated['usageLimit'] ?? null;
        }
        if (array_key_exists('isActive', $validated)) {
            $voucher->is_active = (bool) $validated['isActive'];
        }

        $voucher->save();

        return response()->json(['data' => $this->toItem($voucher)]);
    }

    /**
     * Hapus voucher.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $voucher = Voucher::find($id);
        if (! $voucher) {
            abort(404, 'Voucher tidak ditemukan.');
        }

        $voucher->delete();

        return response()->json(['message' => 'Voucher dihapus.']);
    }
}
