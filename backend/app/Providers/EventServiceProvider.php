<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        
        // Events personnalisés OCP Spare Intelligence
        \App\Events\StockThresholdExceeded::class => [
            \App\Listeners\SendAlertNotification::class . '@handleStockThreshold',
            \App\Listeners\NotifyStockThreshold::class . '@handleThreshold',
        ],
        
        \App\Events\RuptureImminenteDetected::class => [
            \App\Listeners\SendAlertNotification::class . '@handleRuptureImminente',
            \App\Listeners\NotifyStockThreshold::class . '@handleRupture',
        ],
        
        \App\Events\DemandeAchatSubmitted::class => [
            \App\Listeners\SendApprovalEmail::class . '@handleSubmitted',
        ],
        
        \App\Events\DemandeAchatApproved::class => [
            \App\Listeners\SendApprovalEmail::class . '@handleApproved',
            \App\Listeners\GenerateAutomaticOrder::class,
        ],
        
        \App\Events\OffreRecue::class => [
            // À implémenter plus tard
        ],
        
        \App\Events\OffreSelected::class => [
            // À implémenter plus tard
        ],
        
        \App\Events\SupplierDelayDetected::class => [
            \App\Listeners\UpdateSupplierScore::class . '@handleSupplierDelay',
            \App\Listeners\SendSupplierReminder::class,
        ],
        
        \App\Events\OrderCreated::class => [
            \App\Listeners\UpdateSupplierScore::class . '@handleOrderCreated',
        ],
        
        \App\Events\StockUpdated::class => [
            \App\Listeners\LogStockMovement::class,
        ],
        
        \App\Events\SapImportCompleted::class => [
            \App\Listeners\LogSapImport::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}