<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        $platforms = ['社群', '臉書', '親友', '其他'];

        foreach ($platforms as $name) {
            DB::table('platforms')->insert([
                'name' => $name,
                'available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
