<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ClassificationAbcXyz;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassificationController extends Controller
{
    /**
     * Liste des classifications
     */
    public function index(Request $request)
    {
        $query = ClassificationAbcXyz::with('article');

        if ($request->has('classe_abc')) {
            $query->where('classe_abc', $request->classe_abc);
        }

        if ($request->has('classe_xyz')) {
            $query->where('classe_xyz', $request->classe_xyz);
        }

        $classifications = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $classifications
        ]);
    }

    /**
     * Afficher une classification
     */
    public function show($id)
    {
        $classification = ClassificationAbcXyz::with('article')->find($id);

        if (!$classification) {
            return response()->json([
                'success' => false,
                'message' => 'Classification non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $classification
        ]);
    }

    /**
     * Générer la classification ABC/XYZ pour tous les articles
     */
    public function generate(Request $request)
    {
        $dateCalcul = now();

        // 1. Calculer la consommation annuelle par article
        $consommations = MouvementStock::where('type_mouvement', 'sortie')
            ->whereYear('date_mouvement', date('Y'))
            ->select('article_id', DB::raw('SUM(quantite) as consommation_totale'))
            ->groupBy('article_id')
            ->get();

        $totalConsommation = $consommations->sum('consommation_totale');

        // 2. Trier les articles par consommation décroissante
        $articlesTries = $consommations->sortByDesc('consommation_totale');

        // 3. Calculer le pourcentage cumulé
        $pourcentageCumule = 0;
        $classifications = [];

        foreach ($articlesTries as $item) {
            $pourcentage = ($item->consommation_totale / $totalConsommation) * 100;
            $pourcentageCumule += $pourcentage;

            // Déterminer la classe ABC
            if ($pourcentageCumule <= 70) {
                $classeAbc = 'A';
            } elseif ($pourcentageCumule <= 90) {
                $classeAbc = 'B';
            } else {
                $classeAbc = 'C';
            }

            // Calculer le coefficient de variation pour XYZ (simplifié)
            $mouvements = MouvementStock::where('article_id', $item->article_id)
                ->where('type_mouvement', 'sortie')
                ->whereYear('date_mouvement', date('Y'))
                ->select(DB::raw('MONTH(date_mouvement) as mois'), DB::raw('SUM(quantite) as consommation_mensuelle'))
                ->groupBy('mois')
                ->get();

            if ($mouvements->count() > 0) {
                $moyenne = $mouvements->avg('consommation_mensuelle');
                $ecartType = $mouvements->map(function($m) use ($moyenne) {
                    return pow($m->consommation_mensuelle - $moyenne, 2);
                })->avg();
                $cv = sqrt($ecartType) / $moyenne;

                if ($cv < 0.5) {
                    $classeXyz = 'X';
                } elseif ($cv < 1) {
                    $classeXyz = 'Y';
                } else {
                    $classeXyz = 'Z';
                }
            } else {
                $classeXyz = 'Z';
            }

            $classifications[] = [
                'article_id' => $item->article_id,
                'classe_abc' => $classeAbc,
                'classe_xyz' => $classeXyz,
                'valeur_consommation' => $item->consommation_totale,
                'date_calcul' => $dateCalcul,
            ];
        }

        // 4. Supprimer les anciennes classifications
        ClassificationAbcXyz::truncate();

        // 5. Insérer les nouvelles classifications
        foreach ($classifications as $classification) {
            ClassificationAbcXyz::create($classification);
        }

        return response()->json([
            'success' => true,
            'message' => 'Classification ABC/XYZ générée avec succès',
            'data' => [
                'total_articles_classes' => count($classifications),
                'date_calcul' => $dateCalcul,
                'repartition_abc' => [
                    'A' => ClassificationAbcXyz::where('classe_abc', 'A')->count(),
                    'B' => ClassificationAbcXyz::where('classe_abc', 'B')->count(),
                    'C' => ClassificationAbcXyz::where('classe_abc', 'C')->count(),
                ],
                'repartition_xyz' => [
                    'X' => ClassificationAbcXyz::where('classe_xyz', 'X')->count(),
                    'Y' => ClassificationAbcXyz::where('classe_xyz', 'Y')->count(),
                    'Z' => ClassificationAbcXyz::where('classe_xyz', 'Z')->count(),
                ]
            ]
        ]);
    }

    /**
     * Classification par article
     */
    public function byArticle($articleId)
    {
        $article = Article::find($articleId);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }

        $classification = ClassificationAbcXyz::where('article_id', $articleId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article,
                'classification' => $classification
            ]
        ]);
    }

    /**
     * Résumé de la classification
     */
    public function summary()
    {
        $summary = [
            'total_articles' => Article::count(),
            'articles_classes' => ClassificationAbcXyz::count(),
            'repartition_abc' => [
                'A' => ClassificationAbcXyz::where('classe_abc', 'A')->count(),
                'B' => ClassificationAbcXyz::where('classe_abc', 'B')->count(),
                'C' => ClassificationAbcXyz::where('classe_abc', 'C')->count(),
            ],
            'repartition_xyz' => [
                'X' => ClassificationAbcXyz::where('classe_xyz', 'X')->count(),
                'Y' => ClassificationAbcXyz::where('classe_xyz', 'Y')->count(),
                'Z' => ClassificationAbcXyz::where('classe_xyz', 'Z')->count(),
            ],
            'matrice_complete' => [
                'AX' => ClassificationAbcXyz::where('classe_abc', 'A')->where('classe_xyz', 'X')->count(),
                'AY' => ClassificationAbcXyz::where('classe_abc', 'A')->where('classe_xyz', 'Y')->count(),
                'AZ' => ClassificationAbcXyz::where('classe_abc', 'A')->where('classe_xyz', 'Z')->count(),
                'BX' => ClassificationAbcXyz::where('classe_abc', 'B')->where('classe_xyz', 'X')->count(),
                'BY' => ClassificationAbcXyz::where('classe_abc', 'B')->where('classe_xyz', 'Y')->count(),
                'BZ' => ClassificationAbcXyz::where('classe_abc', 'B')->where('classe_xyz', 'Z')->count(),
                'CX' => ClassificationAbcXyz::where('classe_abc', 'C')->where('classe_xyz', 'X')->count(),
                'CY' => ClassificationAbcXyz::where('classe_abc', 'C')->where('classe_xyz', 'Y')->count(),
                'CZ' => ClassificationAbcXyz::where('classe_abc', 'C')->where('classe_xyz', 'Z')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    /**
     * Recommandations basées sur la classification
     */
    public function recommendations()
    {
        $recommendations = [];

        // Articles AX : Forte valeur + consommation régulière
        $axArticles = ClassificationAbcXyz::where('classe_abc', 'A')->where('classe_xyz', 'X')
            ->with('article')
            ->get();
        foreach ($axArticles as $item) {
            $recommendations[] = [
                'article' => $item->article->designation,
                'type' => 'AX',
                'recommandation' => 'Stock de sécurité optimal, réapprovisionnement automatique',
                'priorite' => 'haute'
            ];
        }

        // Articles AZ : Forte valeur + consommation irrégulière
        $azArticles = ClassificationAbcXyz::where('classe_abc', 'A')->where('classe_xyz', 'Z')
            ->with('article')
            ->get();
        foreach ($azArticles as $item) {
            $recommendations[] = [
                'article' => $item->article->designation,
                'type' => 'AZ',
                'recommandation' => 'Prévoir un stock de sécurité élevé, suivi rapproché',
                'priorite' => 'haute'
            ];
        }

        // Articles C : Faible valeur
        $cArticles = ClassificationAbcXyz::where('classe_abc', 'C')
            ->with('article')
            ->get();
        foreach ($cArticles as $item) {
            $recommendations[] = [
                'article' => $item->article->designation,
                'type' => 'C' . $item->classe_xyz,
                'recommandation' => 'Gestion simplifiée, commandes groupées',
                'priorite' => 'basse'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }
}