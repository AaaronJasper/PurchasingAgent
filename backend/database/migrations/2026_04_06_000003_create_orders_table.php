<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_group_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->foreignId('platform_id')->constrained();
            $table->decimal('deposit', 10, 2)->nullable();
            $table->string('account_last5', 5)->nullable();
            $table->foreignId('shipping_method_id')->constrained();
            $table->string('shipping_number')->nullable();
            $table->string('shipping_status')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
