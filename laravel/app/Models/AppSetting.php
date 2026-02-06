<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $table = 'app_settings';

    protected $fillable = [
        'site_name',
        'site_description',
        'site_tagline',
        'contact_email',
        'contact_phone',
        'address',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'whatsapp_number',
        'email_notifications',
        'order_notifications',
        'low_stock_notifications',
        'payment_notifications',
        'customer_notifications',
        'free_shipping_threshold',
        'default_shipping_cost',
        'tax_rate',
        'tax_enabled',
        'maintenance_mode',
        'maintenance_message',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'order_notifications' => 'boolean',
        'low_stock_notifications' => 'boolean',
        'payment_notifications' => 'boolean',
        'customer_notifications' => 'boolean',
        'free_shipping_threshold' => 'integer',
        'default_shipping_cost' => 'integer',
        'tax_rate' => 'float',
        'tax_enabled' => 'boolean',
        'maintenance_mode' => 'boolean',
    ];
}
