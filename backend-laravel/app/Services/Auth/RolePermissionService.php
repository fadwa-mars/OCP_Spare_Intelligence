<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionService
{
    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole(User $user, $role)
    {
        return $user->role === $role;
    }

    /**
     * Vérifier si l'utilisateur a une permission spécifique
     */
    public function hasPermission(User $user, $permission)
    {
        // Récupérer les permissions du rôle de l'utilisateur
        $rolePermissions = $this->getRolePermissions($user->role);
        return in_array($permission, $rolePermissions);
    }

    /**
     * Obtenir les permissions d'un rôle
     */
    public function getRolePermissions($role)
    {
        $permissions = [
            'magasinier' => [
                'view_stock',
                'create_movement',
                'view_articles',
                'receive_order',
                'view_alerts',
            ],
            'acheteur' => [
                'create_demande',
                'manage_tender',
                'select_offer',
                'create_order',
                'manage_supplier',
                'view_reports',
            ],
            'planificateur' => [
                'view_all_stock',
                'forecast_consumption',
                'validate_thresholds',
                'view_reports',
                'manage_classification',
            ],
            'admin' => [
                'manage_users',
                'manage_roles',
                'view_audit_logs',
                'configure_system',
                'all_permissions',
            ],
        ];

        return $permissions[$role] ?? [];
    }

    /**
     * Obtenir tous les rôles disponibles
     */
    public function getAllRoles()
    {
        return ['magasinier', 'acheteur', 'planificateur', 'admin'];
    }

    /**
     * Vérifier si l'utilisateur est actif
     */
    public function isActive(User $user)
    {
        return $user->is_active === true;
    }

    /**
     * Obtenir le niveau d'accès (pour affichage)
     */
    public function getAccessLevel($role)
    {
        $levels = [
            'magasinier' => 1,
            'acheteur' => 2,
            'planificateur' => 3,
            'admin' => 4,
        ];
        return $levels[$role] ?? 0;
    }

    /**
     * Vérifier si l'utilisateur a accès à une ressource
     */
    public function canAccess(User $user, $resource, $action = 'view')
    {
        $permission = $action . '_' . $resource;
        return $this->hasPermission($user, $permission);
    }

    /**
     * Obtenir le menu pour un rôle
     */
    public function getMenuForRole($role)
    {
        $menu = [
            'magasinier' => [
                ['name' => 'Dashboard', 'icon' => 'home', 'route' => 'dashboard'],
                ['name' => 'Stock', 'icon' => 'box', 'route' => 'stock.index'],
                ['name' => 'Articles', 'icon' => 'package', 'route' => 'articles.index'],
                ['name' => 'Alertes', 'icon' => 'bell', 'route' => 'alerts.index'],
            ],
            'acheteur' => [
                ['name' => 'Dashboard', 'icon' => 'home', 'route' => 'dashboard'],
                ['name' => 'Demandes', 'icon' => 'file', 'route' => 'demandes.index'],
                ['name' => 'Appels d\'offres', 'icon' => 'tender', 'route' => 'appels-offres.index'],
                ['name' => 'Commandes', 'icon' => 'cart', 'route' => 'commandes.index'],
                ['name' => 'Fournisseurs', 'icon' => 'truck', 'route' => 'fournisseurs.index'],
            ],
            'planificateur' => [
                ['name' => 'Dashboard', 'icon' => 'home', 'route' => 'dashboard'],
                ['name' => 'Prévisions', 'icon' => 'chart', 'route' => 'forecasts.index'],
                ['name' => 'Classifications', 'icon' => 'tag', 'route' => 'classifications.index'],
                ['name' => 'Rapports', 'icon' => 'report', 'route' => 'reports.index'],
            ],
            'admin' => [
                ['name' => 'Dashboard', 'icon' => 'home', 'route' => 'dashboard'],
                ['name' => 'Utilisateurs', 'icon' => 'users', 'route' => 'users.index'],
                ['name' => 'Configuration', 'icon' => 'settings', 'route' => 'settings.index'],
                ['name' => 'Audit Logs', 'icon' => 'history', 'route' => 'audit-logs.index'],
            ],
        ];

        return $menu[$role] ?? [];
    }
}