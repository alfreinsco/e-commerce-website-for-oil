<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPaymentController extends Controller
{
    private function ensureAdmin(?User $user): void
    {
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Akses hanya untuk admin.');
        }
    }

    private function defaultEWalletMethods(): array
    {
        return [
            ['id' => 'gopay', 'name' => 'GoPay', 'enabled' => true, 'feePercent' => 2],
            ['id' => 'qris', 'name' => 'QRIS', 'enabled' => true, 'feePercent' => 0.7],
            ['id' => 'shopee_pay', 'name' => 'ShopeePay', 'enabled' => true, 'feePercent' => 2],
            ['id' => 'dana', 'name' => 'Dana', 'enabled' => true, 'feePercent' => 1.5],
        ];
    }

    private function toResource(PaymentSetting $s): array
    {
        $methods = $s->e_wallet_methods;
        if (! is_array($methods) || empty($methods)) {
            $methods = $this->defaultEWalletMethods();
        }

        return [
            'eWalletEnabled' => (bool) $s->e_wallet_enabled,
            'eWalletMethods' => $methods,
            'codEnabled' => (bool) $s->cod_enabled,
            'codMinOrder' => (int) $s->cod_min_order,
            'codMaxOrder' => (int) $s->cod_max_order,
            'codFee' => (int) $s->cod_fee,
            'virtualAccountEnabled' => (bool) $s->virtual_account_enabled,
            'virtualAccountFee' => (int) $s->virtual_account_fee,
            'midtransServerKey' => (string) $s->midtrans_server_key,
            'midtransClientKey' => (string) $s->midtrans_client_key,
            'midtransIsProduction' => (bool) $s->midtrans_is_production,
            'paymentTimeout' => (int) $s->payment_timeout,
            'autoApprovePayment' => (bool) $s->auto_approve_payment,
            'requirePaymentProof' => (bool) $s->require_payment_proof,
            'paymentProofRequired' => (bool) $s->payment_proof_required,
        ];
    }

    /**
     * GET /admin/payment/settings
     */
    public function show(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        try {
            $setting = PaymentSetting::first();

            if (! $setting) {
                $setting = PaymentSetting::create([
                    'e_wallet_enabled' => true,
                    'e_wallet_methods' => $this->defaultEWalletMethods(),
                    'cod_enabled' => true,
                    'cod_min_order' => 50000,
                    'cod_max_order' => 5000000,
                    'cod_fee' => 0,
                    'virtual_account_enabled' => true,
                    'virtual_account_fee' => 4000,
                    'midtrans_server_key' => '',
                    'midtrans_client_key' => '',
                    'midtrans_is_production' => false,
                    'payment_timeout' => 24,
                    'auto_approve_payment' => false,
                    'require_payment_proof' => true,
                    'payment_proof_required' => true,
                ]);
            }

            return response()->json(['data' => $this->toResource($setting)]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal mengambil pengaturan pembayaran.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * PUT /admin/payment/settings
     */
    public function update(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'eWalletEnabled' => 'sometimes|boolean',
            'eWalletMethods' => 'sometimes|array',
            'eWalletMethods.*.id' => 'required_with:eWalletMethods|string',
            'eWalletMethods.*.name' => 'required_with:eWalletMethods|string',
            'eWalletMethods.*.enabled' => 'sometimes|boolean',
            'eWalletMethods.*.feePercent' => 'sometimes|numeric|min:0|max:100',
            'codEnabled' => 'sometimes|boolean',
            'codMinOrder' => 'sometimes|integer|min:0',
            'codMaxOrder' => 'sometimes|integer|min:0',
            'codFee' => 'sometimes|integer|min:0',
            'virtualAccountEnabled' => 'sometimes|boolean',
            'virtualAccountFee' => 'sometimes|integer|min:0',
            'midtransServerKey' => 'sometimes|string|max:500',
            'midtransClientKey' => 'sometimes|string|max:500',
            'midtransIsProduction' => 'sometimes|boolean',
            'paymentTimeout' => 'sometimes|integer|min:1|max:10080',
            'autoApprovePayment' => 'sometimes|boolean',
            'requirePaymentProof' => 'sometimes|boolean',
            'paymentProofRequired' => 'sometimes|boolean',
        ]);

        try {
            DB::beginTransaction();

            $setting = PaymentSetting::first();

            if (! $setting) {
                $setting = new PaymentSetting;
            }

            if (array_key_exists('eWalletEnabled', $validated)) {
                $setting->e_wallet_enabled = $validated['eWalletEnabled'];
            }
            if (array_key_exists('eWalletMethods', $validated)) {
                $setting->e_wallet_methods = $validated['eWalletMethods'];
            }
            if (array_key_exists('codEnabled', $validated)) {
                $setting->cod_enabled = $validated['codEnabled'];
            }
            if (array_key_exists('codMinOrder', $validated)) {
                $setting->cod_min_order = (int) $validated['codMinOrder'];
            }
            if (array_key_exists('codMaxOrder', $validated)) {
                $setting->cod_max_order = (int) $validated['codMaxOrder'];
            }
            if (array_key_exists('codFee', $validated)) {
                $setting->cod_fee = (int) $validated['codFee'];
            }
            if (array_key_exists('virtualAccountEnabled', $validated)) {
                $setting->virtual_account_enabled = $validated['virtualAccountEnabled'];
            }
            if (array_key_exists('virtualAccountFee', $validated)) {
                $setting->virtual_account_fee = (int) $validated['virtualAccountFee'];
            }
            if (array_key_exists('midtransServerKey', $validated)) {
                $setting->midtrans_server_key = (string) $validated['midtransServerKey'];
            }
            if (array_key_exists('midtransClientKey', $validated)) {
                $setting->midtrans_client_key = (string) $validated['midtransClientKey'];
            }
            if (array_key_exists('midtransIsProduction', $validated)) {
                $setting->midtrans_is_production = $validated['midtransIsProduction'];
            }
            if (array_key_exists('paymentTimeout', $validated)) {
                $setting->payment_timeout = (int) $validated['paymentTimeout'];
            }
            if (array_key_exists('autoApprovePayment', $validated)) {
                $setting->auto_approve_payment = $validated['autoApprovePayment'];
            }
            if (array_key_exists('requirePaymentProof', $validated)) {
                $setting->require_payment_proof = $validated['requirePaymentProof'];
            }
            if (array_key_exists('paymentProofRequired', $validated)) {
                $setting->payment_proof_required = $validated['paymentProofRequired'];
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
                'message' => 'Gagal menyimpan pengaturan pembayaran.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
