<?php

namespace App\Services\Reporting;

use App\Models\User;
use App\Mail\WeeklyReportMail;
use App\Mail\MonthlyReportMail;
use Illuminate\Support\Facades\Mail;

class EmailReportService
{
    /**
     * Envoyer un rapport par email
     */
    public function sendReport($report, $recipients, $subject = null)
    {
        if (!is_array($recipients)) {
            $recipients = [$recipients];
        }

        $subject = $subject ?? 'Rapport ' . $report->type . ' du ' . $report->date_generation->format('d/m/Y');

        foreach ($recipients as $recipient) {
            Mail::to($recipient)->send(new WeeklyReportMail($report, $subject));
        }

        return true;
    }

    /**
     * Envoyer le rapport hebdomadaire
     */
    public function sendWeeklyReport($report, $roles = ['admin', 'planificateur', 'acheteur'])
    {
        $users = User::whereIn('role', $roles)
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            Mail::to($user->email)->send(new WeeklyReportMail($report));
        }

        return count($users);
    }

    /**
     * Envoyer le rapport mensuel
     */
    public function sendMonthlyReport($report, $roles = ['admin', 'planificateur'])
    {
        $users = User::whereIn('role', $roles)
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            Mail::to($user->email)->send(new MonthlyReportMail($report));
        }

        return count($users);
    }

    /**
     * Envoyer une alerte par email
     */
    public function sendAlertEmail($subject, $message, $recipients)
    {
        if (!is_array($recipients)) {
            $recipients = [$recipients];
        }

        foreach ($recipients as $recipient) {
            Mail::raw($message, function($mail) use ($recipient, $subject) {
                $mail->to($recipient)
                     ->subject($subject);
            });
        }

        return true;
    }
}