# OCP Spare Intelligence — AI Service

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?logo=fastapi)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-orange?logo=scikitlearn)
![Prophet](https://img.shields.io/badge/Prophet-1.1-blue?logo=meta)
![XGBoost](https://img.shields.io/badge/XGBoost-2.0-red)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-lightgrey)

</div>

## 📋 Description

OCP Spare Intelligence AI Service est un microservice Python FastAPI dédié à l'intelligence artificielle. Il expose quatre modèles de machine learning consommés par le backend Laravel pour optimiser la gestion des pièces de rechange : prévision de consommation, optimisation des coûts (EOQ/TCO), évaluation de la criticité et détection d'anomalies.

## 🎯 Objectifs

- Prévoir la consommation future des pièces de rechange
- Calculer dynamiquement les quantités économiques de commande (EOQ)
- Évaluer automatiquement la criticité de chaque pièce
- Détecter les anomalies de consommation en temps réel
- Réduire les coûts de possession de stock entre 10 et 25%

## 🤖 Modèles IA disponibles

| Modèle | Algorithme | Endpoint | Gain estimé |
|--------|------------|----------|-------------|
| **Prévision consommation** | Prophet + XGBoost | `/forecast` | 85% |
| **Optimisation EOQ/TCO** | EOQ dynamique + TCO | `/eoq` | 10–25% |
| **Criticité pièces** | Random Forest | `/criticality` | 70% |
| **Détection anomalies** | Isolation Forest | `/anomalies` | 60% |

## 🛠️ Stack technique

### Core

- **Python 3.10+** — Langage principal
- **FastAPI** — Framework API asynchrone
- **Uvicorn** — Serveur ASGI

### Bibliothèques ML

| Bibliothèque | Utilisation |
|--------------|-------------|
| `prophet` | Prévision de séries temporelles (consommation) |
| `xgboost` | Boosting gradient pour améliorer les prévisions |
| `scikit-learn` | Random Forest (criticité) + Isolation Forest (anomalies) |
| `pandas` | Manipulation des données |
| `numpy` | Calculs numériques |

## 📁 Structure du projet

```
ai-service/
├── main.py                    # Point d'entrée FastAPI — routes et configuration
├── requirements.txt           # Dépendances Python
├── models/                    # Modèles ML par domaine
│   ├── __init__.py
│   ├── forecast.py            # Prévision consommation (Prophet + XGBoost)
│   ├── anomaly.py             # Détection anomalies (Isolation Forest)
│   └── criticality.py        # Score criticité (Random Forest)
└── ai-service/
    └── models/
        └── forecast.py        # Version alternative du modèle de prévision
```

## 🚀 Installation

### Prérequis

- Python 3.10 ou supérieur
- pip

### Étapes d'installation

```bash
# 1. Accéder au dossier du microservice
cd ai-service

# 2. Créer un environnement virtuel
python -m venv venv

# 3. Activer l'environnement virtuel
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Démarrer le microservice
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Le microservice est accessible sur `http://localhost:8001`

La documentation interactive Swagger est disponible sur `http://localhost:8001/docs`

## 🔐 Authentification

Le microservice est sécurisé par une clé API configurée côté backend Laravel :

```
X-API-Key: <ML_API_KEY>
```

La clé est définie dans le `.env` du backend :

```env
ML_SERVICE_URL=http://localhost:8001
ML_API_KEY=votre_cle_api_secrete
```

## 📊 Endpoints disponibles

### Santé du service

```
GET  /               → Vérification que le service est actif
GET  /health         → État détaillé du service et des modèles
```

### Prévision de consommation

```
POST /forecast
```

Corps de la requête :

```json
{
  "article_id": "SAP-10492",
  "historique": [
    { "date": "2025-01-01", "quantite": 12 },
    { "date": "2025-02-01", "quantite": 8 }
  ],
  "horizon_jours": 90
}
```

Réponse :

```json
{
  "article_id": "SAP-10492",
  "previsions": [
    { "date": "2025-04-01", "quantite_prevue": 10.5, "intervalle_min": 7, "intervalle_max": 14 }
  ],
  "modele": "prophet+xgboost",
  "confiance": 0.87
}
```

### Optimisation EOQ / TCO

```
POST /eoq
```

Corps de la requête :

```json
{
  "article_id": "SAP-10492",
  "demande_annuelle": 120,
  "cout_commande": 250,
  "cout_stockage_unitaire": 15,
  "delai_approvisionnement": 7,
  "prix_unitaire": 450
}
```

Réponse :

```json
{
  "article_id": "SAP-10492",
  "eoq": 28,
  "stock_securite": 5,
  "point_reappro": 12,
  "cout_total_annuel": 8420.5,
  "economies_estimees_pct": 18.3
}
```

### Score de criticité

```
POST /criticality
```

Corps de la requête :

```json
{
  "articles": [
    {
      "article_id": "SAP-10492",
      "categorie": "Mécanique",
      "frequence_utilisation": 12,
      "impact_arret_production": 5,
      "delai_approvisionnement": 7,
      "fournisseurs_alternatifs": 2,
      "cout_unitaire": 450
    }
  ]
}
```

Réponse :

```json
{
  "resultats": [
    {
      "article_id": "SAP-10492",
      "score_criticite": 0.87,
      "classe": "A",
      "recommandation": "Stock de sécurité élevé recommandé"
    }
  ]
}
```

### Détection d'anomalies

```
POST /anomalies
```

Corps de la requête :

```json
{
  "article_id": "SAP-10492",
  "mouvements": [
    { "date": "2025-03-01", "quantite": 5 },
    { "date": "2025-03-15", "quantite": 42 }
  ]
}
```

Réponse :

```json
{
  "article_id": "SAP-10492",
  "anomalies": [
    {
      "date": "2025-03-15",
      "quantite": 42,
      "score_anomalie": -0.73,
      "est_anomalie": true,
      "severite": "haute"
    }
  ],
  "nb_anomalies": 1
}
```

## 📦 Dépendances (requirements.txt)

```txt
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
prophet>=1.1.5
xgboost>=2.0.3
scikit-learn>=1.4.0
pandas>=2.2.0
numpy>=1.26.0
pydantic>=2.6.0
python-dotenv>=1.0.0
httpx>=0.27.0
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du microservice :

```env
# Serveur
HOST=0.0.0.0
PORT=8001
ENV=development

# Sécurité
API_KEY=votre_cle_api_secrete

# Paramètres des modèles
FORECAST_HORIZON_DEFAULT=90
ANOMALY_CONTAMINATION=0.05
CRITICALITY_N_ESTIMATORS=100

# Logging
LOG_LEVEL=INFO
```

## 📈 Logique des modèles

### Prévision consommation (Prophet + XGBoost)

Prophet analyse les tendances et saisonnalités des séries temporelles de consommation. XGBoost enrichit la prévision avec des features supplémentaires (catégorie, emplacement, équipement concerné). La combinaison des deux modèles améliore la précision de 85% par rapport à une simple moyenne mobile.

### Optimisation EOQ / TCO

Le modèle EOQ (Economic Order Quantity) calcule dynamiquement la quantité optimale à commander pour minimiser les coûts totaux de possession (TCO = coût d'achat + coût de stockage + coût de rupture). Le stock de sécurité et le point de réapprovisionnement sont recalculés à chaque mise à jour de la demande.

### Score de criticité (Random Forest)

Un modèle Random Forest entraîné sur l'historique OCP évalue la criticité de chaque pièce sur 5 critères : fréquence d'utilisation, impact sur la production en cas de rupture, délai d'approvisionnement, nombre de fournisseurs alternatifs et coût unitaire. Le résultat est un score entre 0 et 1 classant chaque pièce en catégorie A, B ou C.

### Détection d'anomalies (Isolation Forest)

L'algorithme Isolation Forest détecte les mouvements de stock anormaux (consommation inhabituelle, sortie massive, pic inexpliqué) en isolant statistiquement les points aberrants. Un score d'anomalie négatif proche de -1 indique une forte anomalie.

## 🧪 Tests

```bash
# Lancer les tests
pytest

# Avec couverture
pytest --cov=models --cov-report=html

# Tester un endpoint spécifique
pytest tests/test_forecast.py
pytest tests/test_anomaly.py
pytest tests/test_criticality.py
```

## 📦 Scripts disponibles

```bash
# Développement avec rechargement automatique
uvicorn main:app --reload --port 8001

# Production
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4

# Vérifier les dépendances installées
pip list

# Mettre à jour les dépendances
pip install -r requirements.txt --upgrade

# Générer un fichier requirements à jour
pip freeze > requirements.txt
```

## 🤝 Intégration avec le backend Laravel

Le backend Laravel communique avec ce microservice via `MLClientService.php`. Chaque appel est authentifié par la clé API et retourne une réponse JSON standardisée. En cas d'indisponibilité du microservice, le backend renvoie les dernières valeurs calculées depuis le cache.

## 🤝 Contribution

1. Créer une branche pour votre modèle (`feature/model-nom`)
2. Ajouter le fichier du modèle dans `models/`
3. Exposer l'endpoint correspondant dans `main.py`
4. Écrire les tests dans `tests/`
5. Mettre à jour `requirements.txt`
6. Créer une Pull Request

## 📄 Licence

Ce projet est confidentiel et propriété du Groupe OCP. Hébergement strictement on-premise.

## 👨‍💻 Auteur

Développé par **Mars Fadwa** — Stage OCP Séchage Béni Idir · Khouribga · Avril–Mai 2026

## 📞 Support

Pour toute question ou assistance technique, contacter l'administrateur système OCP.

---

**Version : 1.0.0**
**Dernière mise à jour : Mai 2026**