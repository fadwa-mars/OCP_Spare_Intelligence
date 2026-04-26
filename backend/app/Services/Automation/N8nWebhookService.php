<?php

namespace App\Services\Automation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nWebhookService
{
    protected $webhookUrl;
    protected $enabled;

    public function __construct()
    {
        $this->webhookUrl = config('n8n.webhook_url', 'http://localhost:5678/webhook');
        $this->enabled = config('n8n.enabled', false);
    }

    /**
     * Déclencher un webhook n8n
     */
    public function trigger($workflow, $data)
    {
        if (!$this->enabled) {
            Log::info('n8n webhook simulation', ['workflow' => $workflow, 'data' => $data]);
            return ['success' => true, 'simulated' => true];
        }

        try {
            $response = Http::timeout(30)->post($this->webhookUrl . '/' . $workflow, $data);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::warning('n8n webhook failed', [
                'workflow' => $workflow,
                'status' => $response->status(),
            ]);
            
            return ['success' => false, 'error' => 'Webhook failed'];
        } catch (\Exception $e) {
            Log::error('n8n webhook error', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Déclencher la relance fournisseur
     */
    public function triggerSupplierReminder($commandeId, $supplierEmail, $niveau)
    {
        return $this->trigger('supplier-reminder', [
            'commande_id' => $commandeId,
            'supplier_email' => $supplierEmail,
            'niveau' => $niveau,
            'date' => now()->toIso8601String(),
        ]);
    }

    /**
     * Déclencher l'envoi de rapport
     */
    public function triggerReportGeneration($reportType, $recipients)
    {
        return $this->trigger('generate-report', [
            'type' => $reportType,
            'recipients' => $recipients,
            'date' => now()->toIso8601String(),
        ]);
    }

    /**
     * Déclencher la synchronisation SAP
     */
    public function triggerSapSync()
    {
        return $this->trigger('sap-sync', [
            'triggered_at' => now()->toIso8601String(),
        ]);
    }
}