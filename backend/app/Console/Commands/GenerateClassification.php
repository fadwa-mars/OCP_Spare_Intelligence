<?php

namespace App\Console\Commands;

use App\Services\Inventory\ClassificationABCXYZService;
use Illuminate\Console\Command;

class GenerateClassification extends Command
{
    protected $signature = 'classification:generate';
    protected $description = 'Générer la classification ABC/XYZ';

    public function handle(ClassificationABCXYZService $service)
    {
        $this->info('Génération de la classification ABC/XYZ...');
        $service->generate();
        $this->info('Classification générée avec succès !');
    }
}