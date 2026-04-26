<?php

return [
    'mode' => env('SAP_MODE', 'upload'),
    
    'upload' => [
        'allowed_extensions' => ['csv', 'xlsx', 'xls'],
        'max_file_size' => 10240,
        'watch_directory' => storage_path('app/sap_imports/pending'),
        'processed_directory' => storage_path('app/sap_imports/processed'),
        'failed_directory' => storage_path('app/sap_imports/failed'),
    ],
    
    'mapping' => [
        'code_sap' => 'CODE_SAP',
        'designation' => 'DESIGNATION',
        'categorie' => 'CATEGORIE',
        'stock_actuel' => 'STOCK_ACTUEL',
        'stock_reserve' => 'STOCK_RESERVE',
        'stock_disponible' => 'STOCK_DISPONIBLE',
    ],
    
    'odata' => [
        'base_url' => env('SAP_ODATA_URL', ''),
        'client_id' => env('SAP_CLIENT_ID', ''),
        'client_secret' => env('SAP_CLIENT_SECRET', ''),
        'timeout' => 30,
    ],
];