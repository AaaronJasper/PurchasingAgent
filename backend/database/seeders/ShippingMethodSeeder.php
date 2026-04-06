<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = ['交便貨', '店到店', '面交'];

        foreach ($methods as $name) {
            DB::table('shipping_methods')->insert([
                'name' => $name,
                'available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
