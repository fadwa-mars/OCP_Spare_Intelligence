<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Relance;
use App\Models\Commande;
use Illuminate\Http\Request;

class RelanceController extends Controller
{
    /**
     * Liste des relances
     */
    public function index(Request $request)
    {
        $query = Relance::with(['commande.fournisseur', 'user']);

        if ($request->has('commande_id')) {
            $query->where('commande_id', $request->commande_id);
        }

        if ($request->has('reponse_recue')) {
            $query->where('reponse_recue', $request->reponse_recue);
        }

        $relances = $query->orderBy('date_envoi', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $relances
        ]);
    }

    /**
     * Afficher une relance
     */
    public function show($id)
    {
        $relance = Relance::with(['commande.fournisseur', 'user'])->find($id);

        if (!$relance) {
            return response()->json([
                'success' => false,
                'message' => 'Relance non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $relance
        ]);
    }

    /**
     * Créer une relance
     */
    public function store(Request $request)
    {
        $request->validate([
            'commande_id' => 'required|exists:commandes,id',
            'niveau' => 'required|integer|min:1|max:6',
            'type_relance' => 'required|in:email,telephone,reunion',
            'message' => 'required|string',
        ]);

        $relance = Relance::create([
            'commande_id' => $request->commande_id,
            'user_id' => $request->user()->id,
            'niveau' => $request->niveau,
            'type_relance' => $request->type_relance,
            'message' => $request->message,
            'date_envoi' => now(),
            'reponse_recue' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Relance envoyée',
            'data' => $relance
        ], 201);
    }

    /**
     * Marquer une relance comme répondue
     */
    public function markAsAnswered($id, Request $request)
    {
        $relance = Relance::find($id);

        if (!$relance) {
            return response()->json([
                'success' => false,
                'message' => 'Relance non trouvée'
            ], 404);
        }

        $request->validate([
            'reponse_detail' => 'required|string',
        ]);

        $relance->reponse_recue = true;
        $relance->reponse_detail = $request->reponse_detail;
        $relance->save();

        return response()->json([
            'success' => true,
            'message' => 'Réponse enregistrée',
            'data' => $relance
        ]);
    }

    /**
     * Relances par commande
     */
    public function byCommande($commandeId)
    {
        $relances = Relance::where('commande_id', $commandeId)
            ->orderBy('niveau', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $relances
        ]);
    }

    /**
     * Prochaine relance à envoyer (escalade)
     */
    public function nextEscalation($commandeId)
    {
        $commande = Commande::find($commandeId);

        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }

        $dernierNiveau = Relance::where('commande_id', $commandeId)->max('niveau') ?? 0;

        if ($dernierNiveau >= 6) {
            return response()->json([
                'success' => true,
                'message' => 'Niveau maximum atteint',
                'data' => null
            ]);
        }

        $prochainNiveau = $dernierNiveau + 1;

        $messages = [
            1 => 'Première relance : accusé de réception',
            2 => 'Deuxième relance : suivi de commande',
            3 => 'Troisième relance : relance polie',
            4 => 'Quatrième relance : relance ferme',
            5 => 'Cinquième relance : ultimatum',
            6 => 'Sixième relance : escalade hiérarchique',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'niveau' => $prochainNiveau,
                'message' => $messages[$prochainNiveau],
                'commande' => $commande
            ]
        ]);
    }
}