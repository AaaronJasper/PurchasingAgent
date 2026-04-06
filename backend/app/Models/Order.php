<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'purchase_group_id',
        'customer_name',
        'platform_id',
        'deposit',
        'account_last5',
        'shipping_method_id',
        'shipping_number',
        'shipping_status',
        'is_finished',
        'note',
        'ordered_at',
    ];

    protected function casts(): array
    {
        return [
            'deposit' => 'decimal:2',
            'shipping_status' => 'boolean',
            'is_finished' => 'boolean',
            'ordered_at' => 'date',
        ];
    }

    public function purchaseGroup()
    {
        return $this->belongsTo(PurchaseGroup::class);
    }

    public function platform()
    {
        return $this->belongsTo(Platform::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
