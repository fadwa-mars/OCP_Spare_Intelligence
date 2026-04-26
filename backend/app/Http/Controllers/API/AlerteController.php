<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    /**
     * Liste des alertes
     */
    public function index(Request $request)
    {
        $query = Alerte::with(['article', 'commande']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('niveau')) {
            $query->where('niveau', $request->niveau);
        }

        if ($request->has('est_traitee')) {
            $query->where('est_traitee', $request->est_traitee);
        }

        if ($request->has('non_traitees')) {
            $query->where('est_traitee', false);
        }

        $alertes = $query->orderBy('date_creation', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $alertes
        ]);
    }

    /**
     * Afficher une alerte
     */
    public function show($id)
    {
        $alerte = Alerte::with(['article', 'commande', 'userTraitement'])->find($id);

        if (!$alerte) {
            return response()->json([
                'success' => false,
                'message' => 'Alerte non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $alerte
        ]);
    }

    /**
     * Marquer une alerte comme traitée
     */
    public function markAsTreated($id, Request $request)
    {
        $alerte = Alerte::find($id);

        if (!$alerte) {
            return response()->json([
                'success' => false,
                'message' => 'Alerte non trouvée'
            ], 404);
        }

        $alerte->est_traitee = true;
        $alerte->date_traitement = now();
        $alerte->user_traitement_id = $request->user()->id;
        $alerte->save();

        return response()->json([
            'success' => true,
            'message' => 'Alerte marquée comme traitée',
            'data' => $alerte
        ]);
    }

    /**
     * Alertes non traitées (urgence)
     */
    public function urgent()
    {
        $alertes = Alerte::where('est_traitee', false)
            ->whereIn('niveau', ['rouge', 'jaune'])
            ->orderBy('date_creation', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alertes
        ]);
    }

    /**
     * Compter les alertes non traitées
     */
    public function count()
    {
        $count = Alerte::where('est_traitee', false)->count();
        $countRouge = Alerte::where('est_traitee', false)->where('niveau', 'rouge')->count();
        $countJaune = Alerte::where('est_traitee', false)->where('niveau', 'jaune')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $count,
                'rouge' => $countRouge,
                'jaune' => $countJaune
            ]
        ]);
    }

    /**
     * Créer une alerte (système)
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:rupture,seuil_min,seuil_max,stock_mort,anomalie,retard_livraison',
            'niveau' => 'required|in:info,jaune,rouge',
            'message' => 'required|string',
            'article_id' => 'nullable|exists:articles,id',
            'commande_id' => 'nullable|exists:commandes,id',
        ]);

        $alerte = Alerte::create([
            'type' => $request->type,
            'niveau' => $request->niveau,
            'message' => $request->message,
            'article_id' => $request->article_id,
            'commande_id' => $request->commande_id,
            'date_creation' => now(),
            'est_traitee' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alerte créée',
            'data' => $alerte
        ], 201);
    }
}