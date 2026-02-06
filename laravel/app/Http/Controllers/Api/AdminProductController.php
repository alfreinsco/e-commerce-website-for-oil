<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function imageUrl(string $path): string
    {
        $base = rtrim(config('app.url', request()->getSchemeAndHttpHost()), '/');
        return $base.'/storage/'.ltrim($path, '/');
    }

    private function toItem(Product $p): array
    {
        $p->loadMissing('images');
        $images = $p->images->map(function (ProductImage $img) {
            return [
                'id' => (string) $img->id,
                'url' => $this->imageUrl($img->path),
            ];
        })->values()->all();

        return [
            'id' => (string) $p->id,
            'name' => $p->name,
            'price' => (int) $p->price,
            'description' => $p->description,
            'category' => $p->category,
            'stock' => (int) $p->stock,
            'supportsCod' => (bool) $p->supports_cod,
            'isActive' => (bool) $p->is_active,
            'rating' => $p->rating !== null ? (float) $p->rating : null,
            'reviews' => $p->reviews !== null ? (int) $p->reviews : null,
            'images' => $images,
        ];
    }

    /**
     * Daftar produk. Query: search (optional).
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = Product::query()->with('images')->orderBy('created_at', 'desc');

        $search = $request->input('search');
        if ($search && is_string($search)) {
            $term = trim($search);
            if ($term !== '') {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', '%'.$term.'%')
                        ->orWhere('category', 'like', '%'.$term.'%')
                        ->orWhere('description', 'like', '%'.$term.'%');
                });
            }
        }

        $data = $query->get()->map(fn (Product $p) => $this->toItem($p));

        return response()->json(['data' => $data]);
    }

    /**
     * Buat produk baru. Accepts JSON or multipart (with images[]).
     */
    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'stock' => ['required', 'integer', 'min:0'],
            'supports_cod' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews' => ['nullable', 'integer', 'min:0'],
        ];
        if ($request->hasFile('images')) {
            $rules['images'] = ['nullable', 'array'];
            $rules['images.*'] = ['image', 'max:5120'];
        }

        $validated = $request->validate($rules);

        $supportsCod = isset($validated['supports_cod'])
            ? (bool) $validated['supports_cod']
            : true;
        if (array_key_exists('supports_cod', $validated) && is_string($validated['supports_cod'])) {
            $supportsCod = in_array(strtolower($validated['supports_cod']), ['1', 'true', 'yes'], true);
        }
        $isActive = ! array_key_exists('is_active', $validated) || $validated['is_active'];
        if (array_key_exists('is_active', $validated) && is_string($validated['is_active'])) {
            $isActive = in_array(strtolower($validated['is_active']), ['1', 'true', 'yes'], true);
        } elseif (array_key_exists('is_active', $validated)) {
            $isActive = (bool) $validated['is_active'];
        }

        $product = Product::create([
            'name' => $validated['name'],
            'price' => (int) $validated['price'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'stock' => (int) $validated['stock'],
            'supports_cod' => $supportsCod,
            'is_active' => $isActive,
            'rating' => isset($validated['rating']) ? (float) $validated['rating'] : null,
            'reviews' => $validated['reviews'] ?? null,
        ]);

        $files = $request->file('images');
        if (is_array($files)) {
            $sortOrder = 0;
            foreach ($files as $file) {
                if (! $file->isValid()) {
                    continue;
                }
                $path = $file->store('product-images', 'public');
                $product->images()->create(['path' => $path, 'sort_order' => $sortOrder++]);
            }
        }

        return response()->json(['data' => $this->toItem($product->fresh())], 201);
    }

    /**
     * Update produk. Accepts JSON or multipart (images[], delete_image_ids[]).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $product = Product::find($id);
        if (! $product) {
            abort(404, 'Produk tidak ditemukan.');
        }

        $rules = [
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'description' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string', 'max:100'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'supports_cod' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews' => ['nullable', 'integer', 'min:0'],
        ];
        if ($request->hasFile('images')) {
            $rules['images'] = ['nullable', 'array'];
            $rules['images.*'] = ['image', 'max:5120'];
        }
        $validated = $request->validate($rules);

        if (array_key_exists('name', $validated)) {
            $product->name = $validated['name'];
        }
        if (array_key_exists('price', $validated)) {
            $product->price = (int) $validated['price'];
        }
        if (array_key_exists('description', $validated)) {
            $product->description = $validated['description'];
        }
        if (array_key_exists('category', $validated)) {
            $product->category = $validated['category'];
        }
        if (array_key_exists('stock', $validated)) {
            $product->stock = (int) $validated['stock'];
        }
        if (array_key_exists('supports_cod', $validated)) {
            $v = $validated['supports_cod'];
            $product->supports_cod = is_bool($v) ? $v : in_array(strtolower((string) $v), ['1', 'true', 'yes'], true);
        }
        if (array_key_exists('is_active', $validated)) {
            $v = $validated['is_active'];
            $product->is_active = is_bool($v) ? $v : in_array(strtolower((string) $v), ['1', 'true', 'yes'], true);
        }
        if (array_key_exists('rating', $validated)) {
            $product->rating = $validated['rating'] !== null ? (float) $validated['rating'] : null;
        }
        if (array_key_exists('reviews', $validated)) {
            $product->reviews = $validated['reviews'] ?? null;
        }
        $product->save();

        $deleteIds = $request->input('delete_image_ids');
        if (is_array($deleteIds)) {
            $images = $product->images()->whereIn('id', $deleteIds)->get();
            foreach ($images as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        $files = $request->file('images');
        if (is_array($files)) {
            $maxOrder = (int) $product->images()->max('sort_order');
            $sortOrder = $maxOrder + 1;
            foreach ($files as $file) {
                if (! $file->isValid()) {
                    continue;
                }
                $path = $file->store('product-images', 'public');
                $product->images()->create(['path' => $path, 'sort_order' => $sortOrder++]);
            }
        }

        return response()->json(['data' => $this->toItem($product->fresh())]);
    }

    /**
     * Hapus produk.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $product = Product::find($id);
        if (! $product) {
            abort(404, 'Produk tidak ditemukan.');
        }

        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->path);
        }
        $product->delete();

        return response()->json(['message' => 'Produk dihapus.']);
    }
}
