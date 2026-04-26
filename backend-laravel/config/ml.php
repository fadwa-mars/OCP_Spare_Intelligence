<?php

return [
    'enabled' => env('ML_ENABLED', false),
    'api_url' => env('ML_API_URL', 'http://localhost:8001'),
    'timeout' => 30,
];