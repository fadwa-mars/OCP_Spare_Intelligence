<?php

namespace App\Listeners;

use App\Events\DemandeAchatSubmitted;
use App\Events\DemandeAchatApproved;
use App\Mail\ApprovalRequestMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendApprovalEmail
{
    public function handleSubmitted(DemandeAchatSubmitted $event)
    {
        $approvers = User::whereIn('role', ['planificateur', 'admin'])
            ->where('is_active', true)
            ->get();

        foreach ($approvers as $approver) {
            Mail::to($approver->email)->send(new ApprovalRequestMail($event->demande));
        }
    }

    public function handleApproved(DemandeAchatApproved $event)
    {
        $demandeur = $event->demande->user;
        
        Mail::to($demandeur->email)->send(new ApprovalRequestMail($event->demande, 'approved'));
    }
}