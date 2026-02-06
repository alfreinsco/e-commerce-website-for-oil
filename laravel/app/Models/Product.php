<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'category',
        'stock',
        'supports_cod',
        'is_active',
        'rating',
        'reviews',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'supports_cod' => 'boolean',
            'is_active' => 'boolean',
            'reviews' => 'integer',
            'rating' => 'float',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }
}
