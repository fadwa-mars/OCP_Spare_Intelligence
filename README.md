<div align="center">

# ⚙️ OCP Spare Intelligence

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![License](https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Statut-En%20Production-brightgreen?style=for-the-badge)]()

<br/>

> **Système intelligent de gestion des pièces de rechange**  
> Développé pour **OCP Group** — Office Chérifien des Phosphates

<br/>

*Un projet de stage alliant gestion opérationnelle et intelligence artificielle pour optimiser la chaîne d'approvisionnement en pièces de rechange.*

</div>

---

## 📌 Aperçu du projet

**OCP Spare Intelligence** est une solution full-stack de gestion intelligente des pièces de rechange, conçue spécialement pour répondre aux besoins opérationnels de l'**OCP Group** (Office Chérifien des Phosphates).

Ce système intègre trois couches technologiques complémentaires :

- 🔵 **Backend Laravel** — API RESTful sécurisée avec gestion multi-rôles
- 🟢 **Frontend React** — Interface utilisateur moderne et réactive
- 🟡 **Service IA Python** — Moteur de prédiction, classification et détection d'anomalies

### 🎯 Objectifs

| Objectif | Description |
|----------|-------------|
| 📉 Réduire les ruptures de stock | Alertes automatiques sur les seuils minimum |
| 📈 Optimiser les commandes | Prédictions de consommation par modèle ML |
| 🔍 Détecter les anomalies | Surveillance continue des mouvements de stock |
| 📊 Classifier les articles | Matrice ABC/XYZ pour prioriser les achats |
| ⚡ Automatiser les workflows | Appels d'offres, soumissions, commandes automatiques |

---

## ✨ Fonctionnalités détaillées

### 🔐 1. Authentification & Sécurité
- Authentification JWT + Laravel Sanctum
- Gestion multi-rôles avec permissions granulaires
- Sessions sécurisées et protection CSRF
- Connexion par email/mot de passe

### 📦 2. Gestion des Stocks
- Suivi en temps réel des quantités disponibles
- Alertes automatiques sur les seuils minimum configurables
- Historique complet des mouvements (entrées/sorties)
- Fiches articles détaillées (référence, désignation, unité, fournisseur)

### 🔄 3. Workflow Demandes d'Achat
- Création de demandes par le **Planificateur PI**
- Validation et traitement par l'**Acheteur**
- Suivi du statut en temps réel (En attente → Validée → Commandée)
- Notifications de changement d'état

### 📢 4. Appels d'Offres & Soumissions
- Création d'appels d'offres multi-fournisseurs
- Soumission d'offres par les fournisseurs via leur interface dédiée
- Comparaison automatique des offres (prix, délai, qualité)
- Sélection et attribution de commandes

### 🛒 5. Gestion des Commandes
- Génération automatique des bons de commande
- Suivi des livraisons et réceptions
- Rapprochement commande/livraison par le Magasinier
- Mise à jour automatique du stock à la réception

### 📊 6. Classification ABC/XYZ
- **Classe ABC** : classification par valeur de consommation (A=critique, B=intermédiaire, C=faible)
- **Classe XYZ** : classification par régularité de consommation (X=régulier, Y=variable, Z=irrégulier)
- Matrice combinée ABC/XYZ pour une vision stratégique complète
- Recalcul périodique automatique

### 🤖 7. Intelligence Artificielle
- **Prédiction de consommation** : anticipation des besoins futurs
- **Score de criticité** : évaluation de l'importance des pièces
- **Détection d'anomalies** : identification des comportements inhabituels
- Dashboard IA dédié au Planificateur PI

### 📈 8. Rapports & Exports
- Rapports hebdomadaires et mensuels (PDF & Excel)
- Export Excel pour toutes les listes de données
- Graphiques de tendance et KPIs visuels
- Tableaux de bord interactifs avec Chart.js

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        OCP SPARE INTELLIGENCE                    │
│                         Architecture Globale                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     HTTP/HTTPS      ┌──────────────────────┐
│                  │  ◄────────────────► │                      │
│  FRONTEND REACT  │                     │   BACKEND LARAVEL    │
│   (Port 5173)    │                     │    API REST          │
│                  │                     │    (Port 8000)       │
│  • React 18      │                     │                      │
│  • Bootstrap 5   │                     │  • Laravel 11        │
│  • Chart.js      │                     │  • PHP 8.2           │
│  • Axios         │                     │  • JWT + Sanctum     │
│                  │                     │  • MySQL             │
└──────────────────┘                     └──────────┬───────────┘
                                                    │
                                          REST API  │
                                                    ▼
                                         ┌──────────────────────┐
                                         │                      │
                                         │   SERVICE IA PYTHON  │
                                         │    FastAPI           │
                                         │    (Port 8001)       │
                                         │                      │
                                         │  • Gradient Boosting │
                                         │  • Random Forest     │
                                         │  • Isolation Forest  │
                                         │  • Pandas / NumPy    │
                                         └──────────────────────┘

                    ┌──────────────────────────────────────┐
                    │          BASE DE DONNÉES             │
                    │              MySQL                   │
                    │                                      │
                    │  users │ articles │ stocks           │
                    │  commandes │ fournisseurs │ offres   │
                    └──────────────────────────────────────┘

```

### 🔄 Flux de données typique

```
Utilisateur (Browser)
      │
      ▼
[React Frontend] ──── Requête Axios ────► [Laravel API]
                                               │
                                    ┌──────────┼──────────┐
                                    │          │          │
                                    ▼          ▼          ▼
                                 [MySQL]  [Service IA] [Fichiers]
                                             Python
```

---

## 🛠️ Technologies utilisées

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Laravel | 11.x | Framework PHP principal |
| PHP | 8.2 | Langage serveur |
| MySQL | 8.x | Base de données relationnelle |
| JWT Auth | — | Authentification par tokens JWT |
| Laravel Sanctum | — | Gestion des sessions API |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.2.5 | Framework JavaScript UI |
| React DOM | 19.2.5 | Rendu DOM React |
| React Router DOM | 7.14.1 | Navigation SPA |
| Bootstrap | 5.3.8 | Framework CSS / composants |
| Bootstrap Icons | 1.13.1 | Bibliothèque d'icônes |
| Chart.js | 4.5.1 | Graphiques et visualisations |
| React Chartjs 2 | 5.3.1 | Wrapper React pour Chart.js |
| Axios | 1.15.1 | Client HTTP pour les appels API |
| React Toastify | 11.1.0 | Notifications toast |
| XLSX | 0.18.5 | Export Excel |
| React Icons | 5.6.0 | Icônes supplémentaires |
| React Hook Form | 7.73.1 | Gestion des formulaires |
| Vite | 8.0.9 | Bundler / serveur de développement |

### Service IA

| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.14 | Langage du service IA |
| FastAPI | — | Framework API Python performant |
| Scikit-learn | — | Modèles de machine learning |
| Pandas | — | Manipulation et analyse de données |
| NumPy | — | Calcul numérique et matrices |

### Outils & DevOps

| Outil | Rôle |
|-------|------|
| Composer | Gestionnaire de dépendances PHP |
| NPM / Vite | Gestionnaire de dépendances JS + bundler |
| pip | Gestionnaire de dépendances Python |
| n8n *(optionnel)* | Automatisation des workflows |
| Postman | Documentation et test des API |

---

## 📦 Installation

### Prérequis

Assurez-vous d'avoir installé les outils suivants sur votre machine :

- ✅ **PHP** >= 8.2 ([télécharger](https://www.php.net/downloads))
- ✅ **Composer** >= 2.x ([télécharger](https://getcomposer.org))
- ✅ **Node.js** >= 18.x + NPM ([télécharger](https://nodejs.org))
- ✅ **MySQL** >= 8.x ([télécharger](https://dev.mysql.com/downloads/))
- ✅ **Python** >= 3.11 ([télécharger](https://www.python.org/downloads/))
- ✅ **Git** ([télécharger](https://git-scm.com))

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/votre-username/ocp-spare-intelligence.git
cd ocp-spare-intelligence
```

---

### Étape 2 — Installation du Backend Laravel

```bash
# Naviguer dans le dossier backend
cd backend-laravel

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application Laravel
php artisan key:generate

# Générer la clé JWT
php artisan jwt:secret
```

Configurer le fichier `.env` avec vos paramètres de base de données :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ocp_spare_intelligence
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

# URL du service IA
AI_SERVICE_URL=http://localhost:8001
```

```bash
# Créer la base de données et exécuter les migrations
php artisan migrate

# Peupler la base de données avec les données de test
php artisan db:seed
```

---

### Étape 3 — Installation du Frontend React

```bash
# Naviguer dans le dossier frontend
cd ../frontend-react

# Installer les dépendances Node.js
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Configurer `.env` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_AI_SERVICE_URL=http://localhost:8001
```

---

### Étape 4 — Installation du Service IA Python

```bash
# Naviguer dans le dossier IA
cd ../ai-service

# Créer un environnement virtuel Python
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows :
venv\Scripts\activate
# Sur Linux/macOS :
source venv/bin/activate

# Installer les dépendances Python
pip install -r requirements.txt
```

---

## 🚀 Démarrage

Ouvrez **trois terminaux** distincts et lancez chaque service :

### Terminal 1 — Backend Laravel

```bash
cd backend-laravel
php artisan serve
```
> 🟢 API disponible sur : **http://localhost:8000**

---

### Terminal 2 — Frontend React

```bash
cd frontend-react
npm run dev
```
> 🟢 Interface disponible sur : **http://localhost:5173**

---

### Terminal 3 — Service IA Python

```bash
cd ai-service
# Activer l'environnement virtuel si nécessaire
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows

python main.py
```
> 🟢 Service IA disponible sur : **http://localhost:8001**

---

### 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 👑 Admin | admin@ocp.com | `password` |
| 🛒 Acheteur | acheteur@ocp.com | `password` |
| 📊 Planificateur PI | planificateur@ocp.com | `password` |
| 🏭 Magasinier | magasinier@ocp.com | `password` |
| 🤝 Fournisseur | fournisseur@ocp.com | `password123` |

---

## 📡 Documentation API

> 📬 Collection Postman disponible dans `/Livrables/API_Documentation.postman_collection.json`

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/login` | Connexion utilisateur | ❌ |
| `POST` | `/api/logout` | Déconnexion | ✅ |
| `GET` | `/api/me` | Profil utilisateur connecté | ✅ |
| `POST` | `/api/refresh` | Rafraîchir le token JWT | ✅ |

### 📦 Articles & Stock

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/articles` | Liste tous les articles | Tous |
| `POST` | `/api/articles` | Créer un article | Admin, Planificateur |
| `GET` | `/api/articles/{id}` | Détail d'un article | Tous |
| `PUT` | `/api/articles/{id}` | Modifier un article | Admin, Planificateur |
| `DELETE` | `/api/articles/{id}` | Supprimer un article | Admin |
| `GET` | `/api/stocks` | Consulter les stocks | Tous |
| `GET` | `/api/stocks/alertes` | Articles sous seuil minimum | Planificateur, Admin |

### 🔄 Demandes d'Achat

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/demandes` | Liste des demandes | Planificateur, Acheteur |
| `POST` | `/api/demandes` | Créer une demande | Planificateur |
| `PUT` | `/api/demandes/{id}/valider` | Valider une demande | Acheteur |
| `PUT` | `/api/demandes/{id}/rejeter` | Rejeter une demande | Acheteur |

### 📢 Appels d'Offres

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/appels-offres` | Liste des appels d'offres | Acheteur, Fournisseur |
| `POST` | `/api/appels-offres` | Créer un appel d'offres | Acheteur |
| `POST` | `/api/appels-offres/{id}/soumettre` | Soumettre une offre | Fournisseur |
| `GET` | `/api/appels-offres/{id}/offres` | Voir les offres reçues | Acheteur |

### 🛒 Commandes

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/commandes` | Liste des commandes | Acheteur, Magasinier |
| `POST` | `/api/commandes` | Générer une commande | Acheteur |
| `PUT` | `/api/commandes/{id}/recevoir` | Confirmer réception | Magasinier |

### 📊 Classification

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/classifications` | Résultats ABC/XYZ | Planificateur |
| `POST` | `/api/classifications/recalculer` | Relancer la classification | Planificateur |

### 📈 Rapports

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| `GET` | `/api/rapports/hebdomadaire` | Rapport hebdomadaire PDF/Excel | Admin, Planificateur |
| `GET` | `/api/rapports/mensuel` | Rapport mensuel PDF/Excel | Admin, Planificateur |
| `GET` | `/api/export/{entite}` | Export Excel d'une liste | Tous |

> **Format de réponse standard :**
> ```json
> {
>   "success": true,
>   "message": "Opération réussie",
>   "data": { ... },
>   "meta": { "total": 100, "page": 1 }
> }
> ```

---

## 🤖 Service IA

Le service IA est exposé via **FastAPI** sur le port `8001`. Il est consommé par le backend Laravel pour enrichir les données affichées dans le Dashboard IA du Planificateur.

### 🔗 Endpoints IA

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/predict/consommation` | `POST` | Prédiction de consommation future |
| `/predict/criticite` | `POST` | Calcul du score de criticité |
| `/detect/anomalies` | `POST` | Détection d'anomalies de stock |
| `/health` | `GET` | Vérification de l'état du service |
| `/docs` | `GET` | Documentation Swagger auto-générée |

---

### 📐 Modèles Machine Learning

#### 1. 📈 Gradient Boosting — Prédiction de Consommation
```
Modèle   : GradientBoostingRegressor (Scikit-learn)
Objectif : Prédire les quantités consommées dans les semaines/mois à venir
Features : historique de consommation, saisonnalité, catégorie ABC, délai fournisseur
Output   : quantité prédite + intervalle de confiance
```

#### 2. 🎯 Random Forest — Score de Criticité
```
Modèle   : RandomForestClassifier (Scikit-learn)
Objectif : Attribuer un score de criticité à chaque pièce (0 à 100)
Features : fréquence d'utilisation, coût, délai approvisionnement, classe ABC/XYZ
Output   : score numérique + niveau (Critique / Important / Standard)
```

#### 3. 🔎 Isolation Forest — Détection d'Anomalies
```
Modèle   : IsolationForest (Scikit-learn)
Objectif : Identifier les mouvements de stock anormaux
Features : quantité, date, type de mouvement, historique
Output   : label (Normal / Anomalie) + score d'anomalie
```

### 🧪 Exemple d'appel au Service IA

```python
# Requête de prédiction de consommation
import requests

payload = {
    "article_id": 42,
    "historique": [120, 135, 98, 142, 110],
    "horizon": 4  # semaines
}

response = requests.post(
    "http://localhost:8001/predict/consommation",
    json=payload
)

print(response.json())
# {"prediction": [118, 125, 130, 122], "confiance": 0.87}
```

---

## 📁 Structure du projet

```
ocp-spare-intelligence/
│
├── 📂 backend-laravel/              # API Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/         # Contrôleurs API
│   │   │   └── Middleware/          # Middlewares (auth, rôles)
│   │   ├── Models/                  # Modèles Eloquent
│   │   └── Services/                # Services métier
│   ├── database/
│   │   ├── migrations/              # Migrations SQL
│   │   └── seeders/                 # Données de test
│   ├── routes/
│   │   └── api.php                  # Routes de l'API
│   └── .env.example
│
├── 📂 frontend-react/               # Interface React 18
│   ├── src/
│   │   ├── components/              # Composants réutilisables
│   │   ├── pages/                   # Pages par rôle
│   │   │   ├── Admin/
│   │   │   ├── Acheteur/
│   │   │   ├── Planificateur/
│   │   │   ├── Magasinier/
│   │   │   └── Fournisseur/
│   │   ├── services/                # Appels API (Axios)
│   │   ├── context/                 # Contextes React (Auth)
│   │   └── utils/                   # Fonctions utilitaires
│   ├── public/
│   └── .env.example
│
├── 📂 ai-service/                   # Service IA Python
│   ├── models/                      # Modèles ML entraînés (.pkl)
│   ├── routers/                     # Routes FastAPI
│   │   ├── consommation.py
│   │   ├── criticite.py
│   │   └── anomalies.py
│   ├── services/                    # Logique d'inférence
│   ├── data/                        # Données d'entraînement
│   ├── main.py                      # Point d'entrée FastAPI
│   └── requirements.txt
│
├── 📂 Livrables/                    # Documentation fournie
│   ├── Guide_Installation.pdf
│   ├── Guide_Utilisateur.pdf
│   ├── API_Documentation.postman_collection.json
│   ├── Rapport_de_Stage.pdf
│   └── Presentation_PowerPoint.pptx
│
│
└── 📄 README.md
```

---

## 👥 Rôles et permissions

| Fonctionnalité | 👑 Admin | 🛒 Acheteur | 📊 Planificateur | 🏭 Magasinier | 🤝 Fournisseur |
|----------------|:--------:|:-----------:|:----------------:|:-------------:|:--------------:|
| Gestion utilisateurs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supervision globale | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter le stock | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gérer les articles | ✅ | ❌ | ✅ | ❌ | ❌ |
| Créer demandes d'achat | ❌ | ❌ | ✅ | ❌ | ❌ |
| Valider demandes d'achat | ❌ | ✅ | ❌ | ❌ | ❌ |
| Créer appels d'offres | ❌ | ✅ | ❌ | ❌ | ❌ |
| Soumettre des offres | ❌ | ❌ | ❌ | ❌ | ✅ |
| Générer des commandes | ❌ | ✅ | ❌ | ❌ | ❌ |
| Réceptionner commandes | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mouvements de stock | ❌ | ❌ | ❌ | ✅ | ❌ |
| Classification ABC/XYZ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Dashboard IA | ❌ | ❌ | ✅ | ❌ | ❌ |
| Rapports PDF/Excel | ✅ | ✅ | ✅ | ❌ | ❌ |
| Consulter ses commandes | ❌ | ❌ | ❌ | ❌ | ✅ |


---

## 👤 Auteurs

<div align="center">

| | Informations |
|--|-------------|
| **Nom** | *Mars Fadwa* |
| **Formation** | *Technicien spécialisée en développement digital option fullstack* |
| **Email** | *mars.f@oultook.fr* |


</div>

---

## 📄 Licence

Ce projet est développé dans le cadre d'un **stage académique** pour **OCP Group**.

```
Copyright © 2024-2025 — Mars Fadwa / OCP Group
Tous droits réservés.

Ce code est fourni à des fins académiques et professionnelles.
Toute reproduction ou utilisation commerciale sans autorisation est interdite.
```

---

<div align="center">

---

*Développé avec ❤️ pour OCP Group*

[![OCP](https://img.shields.io/badge/OCP-Office%20Chérifien%20des%20Phosphates-004B8D?style=for-the-badge)](https://www.ocpgroup.ma)

</div>