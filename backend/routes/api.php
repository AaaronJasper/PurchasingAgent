<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseGroupController;
use App\Models\Platform;
use App\Models\ShippingMethod;
use Illuminate\Support\Facades\Route;

Route::apiResource('products', ProductController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('purchase-groups', PurchaseGroupController::class);

Route::get('platforms', fn() => response()->json(Platform::where('available', true)->get()));
Route::get('shipping-methods', fn() => response()->json(ShippingMethod::where('available', true)->get()));
