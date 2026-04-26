<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassificationSeeder extends Seeder
{
    // database/seeders/ClassificationSeeder.php
    public function run()
    {
        $service = new \App\Services\Inventory\ClassificationABCXYZService();
        $service->generate();
    }
}
