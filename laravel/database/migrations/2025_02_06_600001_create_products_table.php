<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('price');
            $table->text('description');
            $table->string('category', 100);
            $table->unsignedInteger('stock')->default(0);
            $table->decimal('rating', 3, 2)->nullable();
            $table->unsignedInteger('reviews')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
