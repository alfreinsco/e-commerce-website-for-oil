<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAppController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function defaultRow(): array
    {
        return [
            'site_name' => 'E-Commerce Lamahang',
            'site_description' => 'Toko online minyak kayu putih premium dari Desa Lamahang',
            'site_tagline' => 'Produk Alami untuk Kesehatan Keluarga',
            'contact_email' => 'info@lamahang.com',
            'contact_phone' => '+62 812-3456-7890',
            'address' => 'Desa Lamahang, Kec. Waplau, Kab. Buru, Maluku',
            'facebook_url' => '',
            'instagram_url' => '',
            'twitter_url' => '',
            'whatsapp_number' => '',
            'email_notifications' => true,
            'order_notifications' => true,
            'low_stock_notifications' => true,
            'payment_notifications' => true,
            'customer_notifications' => false,
            'free_shipping_threshold' => 100000,
            'default_shipping_cost' => 20000,
            'tax_rate' => 11,
            'tax_enabled' => true,
            'maintenance_mode' => false,
            'maintenance_message' => 'Situs sedang dalam maintenance. Kami akan kembali segera.',
            'meta_title' => 'E-Commerce Lamahang - Minyak Kayu Putih Premium',
            'meta_description' => 'Toko online minyak kayu putih premium dari Desa Lamahang, Kecamatan Waplau, Kabupaten Buru, Maluku',
            'meta_keywords' => 'minyak kayu putih, lamahang, produk alami, kesehatan',
        ];
    }

    private function toResource(AppSetting $s): array
    {
        return [
            'siteName' => (string) $s->site_name,
            'siteDescription' => (string) ($s->site_description ?? ''),
            'siteTagline' => (string) ($s->site_tagline ?? ''),
            'contactEmail' => (string) ($s->contact_email ?? ''),
            'contactPhone' => (string) ($s->contact_phone ?? ''),
            'address' => (string) ($s->address ?? ''),
            'facebookUrl' => (string) ($s->facebook_url ?? ''),
            'instagramUrl' => (string) ($s->instagram_url ?? ''),
            'twitterUrl' => (string) ($s->twitter_url ?? ''),
            'whatsappNumber' => (string) ($s->whatsapp_number ?? ''),
            'emailNotifications' => (bool) $s->email_notifications,
            'orderNotifications' => (bool) $s->order_notifications,
            'lowStockNotifications' => (bool) $s->low_stock_notifications,
            'paymentNotifications' => (bool) $s->payment_notifications,
            'customerNotifications' => (bool) $s->customer_notifications,
            'freeShippingThreshold' => (int) $s->free_shipping_threshold,
            'defaultShippingCost' => (int) $s->default_shipping_cost,
            'taxRate' => (float) $s->tax_rate,
            'taxEnabled' => (bool) $s->tax_enabled,
            'maintenanceMode' => (bool) $s->maintenance_mode,
            'maintenanceMessage' => (string) ($s->maintenance_message ?? ''),
            'metaTitle' => (string) ($s->meta_title ?? ''),
            'metaDescription' => (string) ($s->meta_description ?? ''),
            'metaKeywords' => (string) ($s->meta_keywords ?? ''),
        ];
    }

    /**
     * GET /admin/app/settings
     */
    public function show(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        try {
            $setting = AppSetting::first();

            if (! $setting) {
                $setting = AppSetting::create($this->defaultRow());
            }

            return response()->json(['data' => $this->toResource($setting)]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal mengambil pengaturan aplikasi.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * PUT /admin/app/settings
     */
    public function update(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'siteName' => 'sometimes|string|max:255',
            'siteDescription' => 'sometimes|nullable|string',
            'siteTagline' => 'sometimes|nullable|string|max:255',
            'contactEmail' => 'sometimes|nullable|string|email|max:255',
            'contactPhone' => 'sometimes|nullable|string|max:50',
            'address' => 'sometimes|nullable|string',
            'facebookUrl' => 'sometimes|nullable|string|max:500',
            'instagramUrl' => 'sometimes|nullable|string|max:500',
            'twitterUrl' => 'sometimes|nullable|string|max:500',
            'whatsappNumber' => 'sometimes|nullable|string|max:50',
            'emailNotifications' => 'sometimes|boolean',
            'orderNotifications' => 'sometimes|boolean',
            'lowStockNotifications' => 'sometimes|boolean',
            'paymentNotifications' => 'sometimes|boolean',
            'customerNotifications' => 'sometimes|boolean',
            'freeShippingThreshold' => 'sometimes|integer|min:0',
            'defaultShippingCost' => 'sometimes|integer|min:0',
            'taxRate' => 'sometimes|numeric|min:0|max:100',
            'taxEnabled' => 'sometimes|boolean',
            'maintenanceMode' => 'sometimes|boolean',
            'maintenanceMessage' => 'sometimes|nullable|string',
            'metaTitle' => 'sometimes|nullable|string|max:255',
            'metaDescription' => 'sometimes|nullable|string',
            'metaKeywords' => 'sometimes|nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $setting = AppSetting::first();

            if (! $setting) {
                $setting = AppSetting::create($this->defaultRow());
            }

            $map = [
                'siteName' => 'site_name',
                'siteDescription' => 'site_description',
                'siteTagline' => 'site_tagline',
                'contactEmail' => 'contact_email',
                'contactPhone' => 'contact_phone',
                'address' => 'address',
                'facebookUrl' => 'facebook_url',
                'instagramUrl' => 'instagram_url',
                'twitterUrl' => 'twitter_url',
                'whatsappNumber' => 'whatsapp_number',
                'emailNotifications' => 'email_notifications',
                'orderNotifications' => 'order_notifications',
                'lowStockNotifications' => 'low_stock_notifications',
                'paymentNotifications' => 'payment_notifications',
                'customerNotifications' => 'customer_notifications',
                'freeShippingThreshold' => 'free_shipping_threshold',
                'defaultShippingCost' => 'default_shipping_cost',
                'taxRate' => 'tax_rate',
                'taxEnabled' => 'tax_enabled',
                'maintenanceMode' => 'maintenance_mode',
                'maintenanceMessage' => 'maintenance_message',
                'metaTitle' => 'meta_title',
                'metaDescription' => 'meta_description',
                'metaKeywords' => 'meta_keywords',
            ];

            foreach ($map as $camel => $snake) {
                if (array_key_exists($camel, $validated)) {
                    $value = $validated[$camel];
                    if (in_array($camel, ['freeShippingThreshold', 'defaultShippingCost'], true)) {
                        $value = (int) $value;
                    }
                    if ($camel === 'taxRate') {
                        $value = (float) $value;
                    }
                    $setting->setAttribute($snake, $value);
                }
            }

            $setting->save();

            DB::commit();

            return response()->json(['data' => $this->toResource($setting->fresh())]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            throw $e;
        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return response()->json([
                'message' => 'Gagal menyimpan pengaturan aplikasi.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
