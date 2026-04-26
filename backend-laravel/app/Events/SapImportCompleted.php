<?php

namespace App\Events;

use App\Models\SapImportLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SapImportCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $importLog;
    public $status;

    public function __construct(SapImportLog $importLog, $status)
    {
        $this->importLog = $importLog;
        $this->status = $status;
    }
}