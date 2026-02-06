<?php

use App\Http\Controllers\Api\AdminAccountController;
use App\Http\Controllers\Api\AdminAddressController;
use App\Http\Controllers\Api\AdminPaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Admin (Account + Address)
|--------------------------------------------------------------------------
*/

Route::middleware('cors.api')->group(function () {
    Route::post('/admin/login', [AdminAccountController::class, 'login']);

    Route::middleware('auth.admin.api')->prefix('admin')->group(function () {
        Route::get('/profile', [AdminAccountController::class, 'profile']);
        Route::put('/profile', [AdminAccountController::class, 'updateProfile']);
        Route::put('/password', [AdminAccountController::class, 'updatePassword']);
        Route::post('/logout', [AdminAccountController::class, 'logout']);

        // Pengaturan Alamat
        Route::prefix('address')->group(function () {
            Route::get('/provinces', [AdminAddressController::class, 'indexProvinces']);
            Route::post('/provinces', [AdminAddressController::class, 'storeProvince']);
            Route::put('/provinces/{id}', [AdminAddressController::class, 'updateProvince']);
            Route::delete('/provinces/{id}', [AdminAddressController::class, 'destroyProvince']);

            Route::get('/regencies', [AdminAddressController::class, 'indexRegencies']);
            Route::post('/regencies', [AdminAddressController::class, 'storeRegency']);
            Route::put('/regencies/{id}', [AdminAddressController::class, 'updateRegency']);
            Route::delete('/regencies/{id}', [AdminAddressController::class, 'destroyRegency']);

            Route::get('/districts', [AdminAddressController::class, 'indexDistricts']);
            Route::post('/districts', [AdminAddressController::class, 'storeDistrict']);
            Route::put('/districts/{id}', [AdminAddressController::class, 'updateDistrict']);
            Route::delete('/districts/{id}', [AdminAddressController::class, 'destroyDistrict']);

            Route::get('/villages', [AdminAddressController::class, 'indexVillages']);
            Route::post('/villages', [AdminAddressController::class, 'storeVillage']);
            Route::post('/villages/from-wilayah', [AdminAddressController::class, 'storeVillageFromWilayah']);
            Route::put('/villages/{id}', [AdminAddressController::class, 'updateVillage']);
            Route::delete('/villages/{id}', [AdminAddressController::class, 'destroyVillage']);
        });

        // Pengaturan Pembayaran
        Route::prefix('payment')->group(function () {
            Route::get('/settings', [AdminPaymentController::class, 'show']);
            Route::put('/settings', [AdminPaymentController::class, 'update']);
        });
    });
});
