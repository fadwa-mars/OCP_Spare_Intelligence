<?php

return [
    'roles' => [
        'magasinier' => [
            'name' => 'Magasinier',
            'permissions' => ['view_stock', 'create_movement', 'view_articles', 'receive_order', 'view_alerts'],
        ],
        'acheteur' => [
            'name' => 'Acheteur',
            'permissions' => ['create_demande', 'manage_tender', 'select_offer', 'create_order', 'manage_supplier', 'view_reports'],
        ],
        'planificateur' => [
            'name' => 'Planificateur PI',
            'permissions' => ['view_all_stock', 'forecast_consumption', 'validate_thresholds', 'view_reports', 'manage_classification'],
        ],
        'admin' => [
            'name' => 'Administrateur',
            'permissions' => ['manage_users', 'manage_roles', 'view_audit_logs', 'configure_system', 'all_permissions'],
        ],
    ],
];