<?php

return [
    'enabled' => env('N8N_ENABLED', false),
    'webhook_url' => env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook'),
];