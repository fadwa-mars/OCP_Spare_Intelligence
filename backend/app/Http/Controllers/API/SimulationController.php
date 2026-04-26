<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SimulationWhatIf;
use App\Models\Article;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SimulationController extends Controller
{
    /**
     * Liste des simulations
     */
    public function index(Request $request)
    {
        $query = SimulationWhatIf::with(['article', 'creePar']);

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $simulations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $simulations
        ]);
    }

    /**
     * Afficher une simulation
     */
    public function show($id)
    {
        $simulation = SimulationWhatIf::with(['article', 'creePar'])->find($id);

        if (!$simulation) {
            return response()->json([
                'success' => false,
                'message' => 'Simulation non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $simulation
        ]);
    }

    /**
     * Créer une simulation
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom_simulation' => 'required|string',
            'description' => 'nullable|string',
            'parametres' => 'required|array',
            'article_id' => 'nullable|exists:articles,id',
        ]);

        $simulation = SimulationWhatIf::create([
            'nom_simulation' => $request->nom_simulation,
            'description' => $request->description,
            'parametres' => $request->parametres,
            'statut' => 'brouillon',
            'article_id' => $request->article_id,
            'cree_par' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Simulation créée',
            'data' => $simulation
        ], 201);
    }

    /**
     * Mettre à jour une simulation
     */
    public function update(Request $request, $id)
    {
        $simulation = SimulationWhatIf::find($id);

        if (!$simulation) {
            return response()->json([
                'success' => false,
                'message' => 'Simulation non trouvée'
            ], 404);
        }

        $request->validate([
            'nom_simulation' => 'sometimes|string',
            'description' => 'nullable|string',
            'parametres' => 'sometimes|array',
        ]);

        $simulation->update($request->only(['nom_simulation', 'description', 'parametres']));

        return response()->json([
            'success' => true,
            'message' => 'Simulation mise à jour',
            'data' => $simulation
        ]);
    }

    /**
     * Exécuter une simulation
     */
    public function execute($id, Request $request)
    {
        $simulation = SimulationWhatIf::find($id);

        if (!$simulation) {
            return response()->json([
                'success' => false,
                'message' => 'Simulation non trouvée'
            ], 404);
        }

        $parametres = $simulation->parametres;
        $resultats = [];

        // Simulation de stock (prévision de rupture)
        if (isset($parametres['stock_initial']) && isset($parametres['consommation_mensuelle'])) {
            $resultats['stock'] = $this->simulerStock($parametres);
        }

        // Simulation de coût (EOQ)
        if (isset($parametres['demande_annuelle']) && isset($parametres['cout_passe'])) {
            $resultats['cout'] = $this->simulerCout($parametres);
        }

        // Simulation de délai fournisseur
        if (isset($parametres['delai_moyen']) && isset($parametres['ecart_type'])) {
            $resultats['delai'] = $this->simulerDelai($parametres);
        }

        // Simulation de demande aléatoire
        if (isset($parametres['demande_min']) && isset($parametres['demande_max'])) {
            $resultats['demande'] = $this->simulerDemande($parametres);
        }

        $simulation->resultats = $resultats;
        $simulation->statut = 'terminee';
        $simulation->date_execution = now();
        $simulation->save();

        return response()->json([
            'success' => true,
            'message' => 'Simulation exécutée avec succès',
            'data' => $simulation
        ]);
    }

    /**
     * Simuler l'évolution du stock
     */
    private function simulerStock($parametres)
    {
        $stockInitial = $parametres['stock_initial'];
        $consommationMensuelle = $parametres['consommation_mensuelle'];
        $delaiApprovisionnement = $parametres['delai_approvisionnement'] ?? 30;
        $seuilAlerte = $parametres['seuil_alerte'] ?? $stockInitial * 0.2;
        $quantiteCommande = $parametres['quantite_commande'] ?? $consommationMensuelle * 2;
        $jours = $parametres['jours_simulation'] ?? 180;

        $evolution = [];
        $stock = $stockInitial;
        $commandes = [];
        $ruptures = 0;
        $joursRestants = 0;

        for ($jour = 1; $jour <= $jours; $jour++) {
            // Consommation journalière
            $consommationJour = $consommationMensuelle / 30;
            $stock -= $consommationJour;

            // Vérifier les livraisons
            if (isset($commandes[$jour])) {
                $stock += $commandes[$jour];
            }

            // Détection rupture
            if ($stock < 0) {
                $ruptures++;
                $stock = 0;
            }

            // Alerte seuil
            if ($stock <= $seuilAlerte && $joursRestants <= 0) {
                $joursRestants = $delaiApprovisionnement;
                $dateLivraison = $jour + $delaiApprovisionnement;
                $commandes[$dateLivraison] = ($commandes[$dateLivraison] ?? 0) + $quantiteCommande;
            }

            if ($joursRestants > 0) {
                $joursRestants--;
            }

            $evolution[] = [
                'jour' => $jour,
                'stock' => round($stock, 2),
                'alerte' => $stock <= $seuilAlerte,
                'rupture' => $stock <= 0
            ];
        }

        return [
            'evolution' => $evolution,
            'jours_rupture' => $ruptures,
            'taux_rupture' => round(($ruptures / $jours) * 100, 2),
            'stock_moyen' => round(collect($evolution)->avg('stock'), 2),
            'stock_final' => round($stock, 2),
            'nombre_commandes' => count($commandes)
        ];
    }

    /**
     * Simuler les coûts (EOQ)
     */
    private function simulerCout($parametres)
    {
        $demandeAnnuelle = $parametres['demande_annuelle'];
        $coutPasse = $parametres['cout_passe'];
        $coutStockage = $parametres['cout_stockage'] ?? 0.25;
        $prixUnitaire = $parametres['prix_unitaire'] ?? 100;

        // EOQ (Quantité économique de commande)
        $eoq = sqrt((2 * $demandeAnnuelle * $coutPasse) / ($coutStockage * $prixUnitaire));

        // Nombre de commandes par an
        $nbCommandes = ceil($demandeAnnuelle / $eoq);

        // Coût total
        $coutTotal = ($demandeAnnuelle / $eoq) * $coutPasse + ($eoq / 2) * $coutStockage * $prixUnitaire;

        // Comparaison avec différentes quantités
        $scenarios = [];
        foreach ([0.5, 0.75, 1, 1.25, 1.5] as $facteur) {
            $qte = $eoq * $facteur;
            $cout = ($demandeAnnuelle / $qte) * $coutPasse + ($qte / 2) * $coutStockage * $prixUnitaire;
            $scenarios[] = [
                'facteur' => $facteur,
                'quantite' => round($qte, 0),
                'cout_total' => round($cout, 2),
                'economie' => round($coutTotal - $cout, 2)
            ];
        }

        return [
            'eoq' => round($eoq, 0),
            'nombre_commandes_an' => $nbCommandes,
            'cout_total_optimal' => round($coutTotal, 2),
            'frequence_commandes_jours' => round(365 / $nbCommandes, 0),
            'scenarios' => $scenarios
        ];
    }

    /**
     * Simuler les délais fournisseurs
     */
    private function simulerDelai($parametres)
    {
        $delaiMoyen = $parametres['delai_moyen'];
        $ecartType = $parametres['ecart_type'];
        $nbSimulations = $parametres['nb_simulations'] ?? 1000;

        $delais = [];
        $retards = 0;

        for ($i = 0; $i < $nbSimulations; $i++) {
            // Génération aléatoire (loi normale)
            $delai = $delaiMoyen + $ecartType * $this->randomNormal();
            $delai = max(1, round($delai));
            $delais[] = $delai;

            if ($delai > $delaiMoyen * 1.5) {
                $retards++;
            }
        }

        return [
            'delai_moyen_simule' => round(collect($delais)->avg(), 1),
            'delai_max' => max($delais),
            'delai_min' => min($delais),
            'probabilite_retard' => round(($retards / $nbSimulations) * 100, 2),
            'percentile_95' => round(collect($delais)->percentile(95), 1)
        ];
    }

    /**
     * Simuler la demande aléatoire
     */
    private function simulerDemande($parametres)
    {
        $demandeMin = $parametres['demande_min'];
        $demandeMax = $parametres['demande_max'];
        $nbJours = $parametres['nb_jours'] ?? 365;

        $demandes = [];
        $total = 0;

        for ($i = 0; $i < $nbJours; $i++) {
            $demande = rand($demandeMin, $demandeMax);
            $demandes[] = $demande;
            $total += $demande;
        }

        return [
            'demande_moyenne_journaliere' => round($total / $nbJours, 2),
            'demande_annuelle' => $total,
            'demande_max_journaliere' => max($demandes),
            'demande_min_journaliere' => min($demandes),
            'ecart_type' => round(collect($demandes)->stdev(), 2)
        ];
    }

    /**
     * Générer un nombre aléatoire selon la loi normale
     */
    private function randomNormal()
    {
        $u = mt_rand() / mt_getrandmax();
        $v = mt_rand() / mt_getrandmax();
        return sqrt(-2 * log($u)) * cos(2 * M_PI * $v);
    }

    /**
     * Supprimer une simulation
     */
    public function destroy($id)
    {
        $simulation = SimulationWhatIf::find($id);

        if (!$simulation) {
            return response()->json([
                'success' => false,
                'message' => 'Simulation non trouvée'
            ], 404);
        }

        $simulation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Simulation supprimée'
        ]);
    }

    /**
     * Dupliquer une simulation
     */
    public function duplicate($id, Request $request)
    {
        $original = SimulationWhatIf::find($id);

        if (!$original) {
            return response()->json([
                'success' => false,
                'message' => 'Simulation non trouvée'
            ], 404);
        }

        $nouvelle = SimulationWhatIf::create([
            'nom_simulation' => $original->nom_simulation . ' (copie)',
            'description' => $original->description,
            'parametres' => $original->parametres,
            'statut' => 'brouillon',
            'article_id' => $original->article_id,
            'cree_par' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Simulation dupliquée',
            'data' => $nouvelle
        ], 201);
    }

    /**
     * Comparer plusieurs simulations
     */
    public function compare(Request $request)
    {
        $request->validate([
            'simulation_ids' => 'required|array|min:2',
            'simulation_ids.*' => 'exists:simulations_whatif,id'
        ]);

        $simulations = SimulationWhatIf::whereIn('id', $request->simulation_ids)
            ->with('creePar')
            ->get();

        $comparaison = [
            'simulations' => $simulations->map(function ($sim) {
                return [
                    'id' => $sim->id,
                    'nom' => $sim->nom_simulation,
                    'statut' => $sim->statut,
                    'date_creation' => $sim->created_at,
                    'date_execution' => $sim->date_execution,
                    'parametres' => $sim->parametres,
                    'resultats' => $sim->resultats
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'data' => $comparaison
        ]);
    }

    /**
     * Templates de simulations prédéfinis
     */
    public function templates()
    {
        $templates = [
            [
                'nom' => 'Optimisation du stock de sécurité',
                'description' => 'Calcule le stock de sécurité optimal basé sur la variabilité de la demande',
                'parametres' => [
                    'consommation_mensuelle' => 100,
                    'delai_approvisionnement' => 30,
                    'ecart_type_demande' => 20,
                    'niveau_service' => 95
                ]
            ],
            [
                'nom' => 'Analyse EOQ',
                'description' => 'Calcule la quantité économique de commande',
                'parametres' => [
                    'demande_annuelle' => 1200,
                    'cout_passe' => 50,
                    'cout_stockage' => 0.25,
                    'prix_unitaire' => 100
                ]
            ],
            [
                'nom' => 'Simulation de rupture',
                'description' => 'Simule le risque de rupture sur une période donnée',
                'parametres' => [
                    'stock_initial' => 500,
                    'consommation_mensuelle' => 200,
                    'delai_approvisionnement' => 15,
                    'jours_simulation' => 180
                ]
            ],
            [
                'nom' => 'Prévision de demande',
                'description' => 'Simule la demande future basée sur des données historiques',
                'parametres' => [
                    'demande_min' => 50,
                    'demande_max' => 150,
                    'nb_jours' => 365
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Créer une simulation à partir d'un template
     */
    public function createFromTemplate(Request $request)
    {
        $request->validate([
            'template_nom' => 'required|string',
            'nom_simulation' => 'required|string',
            'parametres' => 'required|array',
        ]);

        $simulation = SimulationWhatIf::create([
            'nom_simulation' => $request->nom_simulation,
            'description' => 'Simulation basée sur le template: ' . $request->template_nom,
            'parametres' => $request->parametres,
            'statut' => 'brouillon',
            'cree_par' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Simulation créée à partir du template',
            'data' => $simulation
        ], 201);
    }
}