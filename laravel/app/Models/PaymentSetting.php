<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $table = 'payment_settings';

    protected $fillable = [
        'e_wallet_enabled',
        'e_wallet_methods',
        'cod_enabled',
        'cod_min_order',
        'cod_max_order',
        'cod_fee',
        'virtual_account_enabled',
        'virtual_account_fee',
        'midtrans_server_key',
        'midtrans_client_key',
        'midtrans_is_production',
        'payment_timeout',
        'auto_approve_payment',
        'require_payment_proof',
        'payment_proof_required',
    ];

    protected $casts = [
        'e_wallet_enabled' => 'boolean',
        'e_wallet_methods' => 'array',
        'cod_enabled' => 'boolean',
        'cod_min_order' => 'integer',
        'cod_max_order' => 'integer',
        'cod_fee' => 'integer',
        'virtual_account_enabled' => 'boolean',
        'virtual_account_fee' => 'integer',
        'midtrans_is_production' => 'boolean',
        'payment_timeout' => 'integer',
        'auto_approve_payment' => 'boolean',
        'require_payment_proof' => 'boolean',
        'payment_proof_required' => 'boolean',
    ];
}
