<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseGroup extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
