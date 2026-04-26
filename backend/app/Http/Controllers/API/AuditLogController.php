<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Liste des logs d'audit
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->has('table_name')) {
            $query->where('table_name', $request->table_name);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Afficher un log
     */
    public function show($id)
    {
        $log = AuditLog::with('user')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }

    /**
     * Actions par utilisateur
     */
    public function byUser($userId, Request $request)
    {
        $query = AuditLog::where('user_id', $userId);

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Statistiques des logs
     */
    public function stats(Request $request)
    {
        $dateDebut = $request->date_debut ?? now()->subDays(30);
        $dateFin = $request->date_fin ?? now();

        $stats = [
            'total_actions' => AuditLog::whereBetween('created_at', [$dateDebut, $dateFin])->count(),
            'par_action' => AuditLog::whereBetween('created_at', [$dateDebut, $dateFin])
                ->select('action', DB::raw('COUNT(*) as total'))
                ->groupBy('action')
                ->get(),
            'par_table' => AuditLog::whereBetween('created_at', [$dateDebut, $dateFin])
                ->select('table_name', DB::raw('COUNT(*) as total'))
                ->whereNotNull('table_name')
                ->groupBy('table_name')
                ->get(),
            'top_utilisateurs' => AuditLog::whereBetween('created_at', [$dateDebut, $dateFin])
                ->select('user_id', DB::raw('COUNT(*) as total'))
                ->with('user')
                ->groupBy('user_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}