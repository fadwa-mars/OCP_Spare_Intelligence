<?php

return [
    'notify_roles' => ['admin', 'planificateur'],
    'retention_days' => 30,
    'real_time_broadcast' => env('ALERT_REAL_TIME', true),
];