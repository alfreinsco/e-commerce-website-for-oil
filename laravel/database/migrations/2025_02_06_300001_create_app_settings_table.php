<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('E-Commerce Lamahang');
            $table->text('site_description')->nullable();
            $table->string('site_tagline')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('address')->nullable();
            $table->string('facebook_url')->default('');
            $table->string('instagram_url')->default('');
            $table->string('twitter_url')->default('');
            $table->string('whatsapp_number')->default('');
            $table->boolean('email_notifications')->default(true);
            $table->boolean('order_notifications')->default(true);
            $table->boolean('low_stock_notifications')->default(true);
            $table->boolean('payment_notifications')->default(true);
            $table->boolean('customer_notifications')->default(false);
            $table->unsignedBigInteger('free_shipping_threshold')->default(100000);
            $table->unsignedBigInteger('default_shipping_cost')->default(20000);
            $table->decimal('tax_rate', 5, 2)->default(11);
            $table->boolean('tax_enabled')->default(true);
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
