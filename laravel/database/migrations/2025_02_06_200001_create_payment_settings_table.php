<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('e_wallet_enabled')->default(true);
            $table->json('e_wallet_methods')->nullable();
            $table->boolean('cod_enabled')->default(true);
            $table->unsignedBigInteger('cod_min_order')->default(50000);
            $table->unsignedBigInteger('cod_max_order')->default(5000000);
            $table->unsignedBigInteger('cod_fee')->default(0);
            $table->boolean('virtual_account_enabled')->default(true);
            $table->unsignedBigInteger('virtual_account_fee')->default(4000);
            $table->string('midtrans_server_key')->default('');
            $table->string('midtrans_client_key')->default('');
            $table->boolean('midtrans_is_production')->default(false);
            $table->unsignedSmallInteger('payment_timeout')->default(24);
            $table->boolean('auto_approve_payment')->default(false);
            $table->boolean('require_payment_proof')->default(true);
            $table->boolean('payment_proof_required')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
