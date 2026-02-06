<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAddressController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function provinceResource(Province $p): array
    {
        return [
            'id' => (string) $p->id,
            'code' => $p->code,
            'name' => $p->name,
        ];
    }

    private function regencyResource(Regency $r): array
    {
        return [
            'id' => (string) $r->id,
            'code' => $r->code,
            'name' => $r->name,
            'provinceCode' => $r->province_code,
            'provinceName' => $r->province?->name ?? '',
        ];
    }

    private function districtResource(District $d): array
    {
        return [
            'id' => (string) $d->id,
            'code' => $d->code,
            'name' => $d->name,
            'regencyCode' => $d->regency_code,
            'regencyName' => $d->regency?->name ?? '',
        ];
    }

    private function villageResource(Village $v): array
    {
        $district = $v->district;
        $regency = $district?->regency;

        return [
            'id' => (string) $v->id,
            'code' => $v->code,
            'name' => $v->name,
            'districtCode' => $v->district_code,
            'districtName' => $district?->name ?? '',
            'regencyCode' => $regency?->code ?? '',
            'regencyName' => $regency?->name ?? '',
            'supportsCOD' => (bool) $v->supports_cod,
        ];
    }

    // --- Provinces ---
    public function indexProvinces(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = Province::query()->orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
            });
        }
        $items = $query->get()->map(fn ($p) => $this->provinceResource($p));

        return response()->json(['data' => $items]);
    }

    public function storeProvince(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $request->validate([
            'code' => 'required|string|max:10|unique:provinces,code',
            'name' => 'required|string|max:255',
        ]);

        $p = Province::create($request->only('code', 'name'));

        return response()->json(['data' => $this->provinceResource($p)], 201);
    }

    public function updateProvince(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $p = Province::findOrFail($id);
        $request->validate([
            'code' => 'sometimes|string|max:10|unique:provinces,code,' . $p->id,
            'name' => 'sometimes|string|max:255',
        ]);

        $p->update($request->only(['code', 'name']));

        return response()->json(['data' => $this->provinceResource($p->fresh())]);
    }

    public function destroyProvince(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        Province::findOrFail($id)->delete();

        return response()->json(['message' => 'Provinsi dihapus']);
    }

    // --- Regencies ---
    public function indexRegencies(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = Regency::query()->with('province')->orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
            });
        }
        if ($request->filled('province_code')) {
            $query->where('province_code', $request->province_code);
        }
        $items = $query->get()->map(fn ($r) => $this->regencyResource($r));

        return response()->json(['data' => $items]);
    }

    public function storeRegency(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $request->validate([
            'code' => 'required|string|max:10|unique:regencies,code',
            'name' => 'required|string|max:255',
            'province_code' => 'required|string|exists:provinces,code',
        ]);

        $r = Regency::create($request->only('code', 'name', 'province_code'));

        return response()->json(['data' => $this->regencyResource($r->load('province'))], 201);
    }

    public function updateRegency(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $r = Regency::findOrFail($id);
        $request->validate([
            'code' => 'sometimes|string|max:10|unique:regencies,code,' . $r->id,
            'name' => 'sometimes|string|max:255',
            'province_code' => 'sometimes|string|exists:provinces,code',
        ]);

        $r->update($request->only(['code', 'name', 'province_code']));

        return response()->json(['data' => $this->regencyResource($r->fresh()->load('province'))]);
    }

    public function destroyRegency(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        Regency::findOrFail($id)->delete();

        return response()->json(['message' => 'Kabupaten dihapus']);
    }

    // --- Districts ---
    public function indexDistricts(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = District::query()->with('regency')->orderBy('name');
        if ($request->filled('regency_code')) {
            $query->where('regency_code', $request->regency_code);
        }
        $items = $query->get()->map(fn ($d) => $this->districtResource($d));

        return response()->json(['data' => $items]);
    }

    public function storeDistrict(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $request->validate([
            'code' => 'required|string|max:10|unique:districts,code',
            'name' => 'required|string|max:255',
            'regency_code' => 'required|string|exists:regencies,code',
        ]);

        $d = District::create($request->only('code', 'name', 'regency_code'));

        return response()->json(['data' => $this->districtResource($d->load('regency'))], 201);
    }

    public function updateDistrict(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $d = District::findOrFail($id);
        $request->validate([
            'code' => 'sometimes|string|max:10|unique:districts,code,' . $d->id,
            'name' => 'sometimes|string|max:255',
            'regency_code' => 'sometimes|string|exists:regencies,code',
        ]);

        $d->update($request->only(['code', 'name', 'regency_code']));

        return response()->json(['data' => $this->districtResource($d->fresh()->load('regency'))]);
    }

    public function destroyDistrict(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        District::findOrFail($id)->delete();

        return response()->json(['message' => 'Kecamatan dihapus']);
    }

    // --- Villages ---
    public function indexVillages(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = Village::query()->with(['district.regency'])->orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
            });
        }
        if ($request->filled('regency_code')) {
            $query->whereHas('district', fn ($q) => $q->where('regency_code', $request->regency_code));
        }
        if ($request->filled('district_code')) {
            $query->where('district_code', $request->district_code);
        }
        $items = $query->get()->map(fn ($v) => $this->villageResource($v));

        return response()->json(['data' => $items]);
    }

    public function storeVillage(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $request->validate([
            'code' => 'required|string|max:15|unique:villages,code',
            'name' => 'required|string|max:255',
            'district_code' => 'required|string|exists:districts,code',
            'supports_cod' => 'sometimes|boolean',
        ]);

        $v = Village::create([
            'code' => $request->code,
            'name' => $request->name,
            'district_code' => $request->district_code,
            'supports_cod' => $request->boolean('supports_cod'),
        ]);

        return response()->json(['data' => $this->villageResource($v->load(['district.regency']))], 201);
    }

    public function updateVillage(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $v = Village::findOrFail($id);
        $request->validate([
            'code' => 'sometimes|string|max:15|unique:villages,code,' . $v->id,
            'name' => 'sometimes|string|max:255',
            'district_code' => 'sometimes|string|exists:districts,code',
            'supports_cod' => 'sometimes|boolean',
        ]);

        $v->update([
            'code' => $request->input('code', $v->code),
            'name' => $request->input('name', $v->name),
            'district_code' => $request->input('district_code', $v->district_code),
            'supports_cod' => $request->boolean('supports_cod'),
        ]);

        return response()->json(['data' => $this->villageResource($v->fresh()->load(['district.regency']))]);
    }

    public function destroyVillage(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        Village::findOrFail($id)->delete();

        return response()->json(['message' => 'Desa dihapus']);
    }

    /**
     * Simpan desa beserta provinsi, kabupaten, kecamatan dari data wilayah.id.
     * Kode mengikuti API wilayah.id. Provinsi/kabupaten/kecamatan di-updateOrCreate bila belum ada.
     */
    public function storeVillageFromWilayah(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $request->validate([
            'province' => 'required|array',
            'province.code' => 'required|string|max:10',
            'province.name' => 'required|string|max:255',
            'regency' => 'required|array',
            'regency.code' => 'required|string|max:10',
            'regency.name' => 'required|string|max:255',
            'district' => 'required|array',
            'district.code' => 'required|string|max:10',
            'district.name' => 'required|string|max:255',
            'village' => 'required|array',
            'village.code' => 'required|string|max:15',
            'village.name' => 'required|string|max:255',
        ]);

        $province = Province::updateOrCreate(
            ['code' => $request->input('province.code')],
            ['name' => $request->input('province.name')]
        );

        $regency = Regency::updateOrCreate(
            ['code' => $request->input('regency.code')],
            [
                'name' => $request->input('regency.name'),
                'province_code' => $province->code,
            ]
        );

        $district = District::updateOrCreate(
            ['code' => $request->input('district.code')],
            [
                'name' => $request->input('district.name'),
                'regency_code' => $regency->code,
            ]
        );

        $village = Village::updateOrCreate(
            ['code' => $request->input('village.code')],
            [
                'name' => $request->input('village.name'),
                'district_code' => $district->code,
                'supports_cod' => $request->input('village.supports_cod', false),
            ]
        );

        return response()->json([
            'data' => $this->villageResource($village->load(['district.regency'])),
        ], 201);
    }
}
