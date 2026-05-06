# OCP Spare Intelligence

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Laravel](https://img.shields.io/badge/Laravel-11-red?logo=laravel)
![Python](https://img.shields.io/badge/Python-FastAPI-green?logo=python)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Sanctum-orange?logo=jsonwebtokens)
![n8n](https://img.shields.io/badge/n8n-Automation-red?logo=n8n)
![License](https://img.shields.io/badge/Licence-Confidentiel_OCP-darkgreen)

</div>

<div align="center">

> Plateforme web intelligente de gestion des pièces de rechange — Site Séchage Béni Idir, Groupe OCP, Khouribga

</div>

---

## 📋 Description

OCP Spare Intelligence est une plateforme web complète développée pour moderniser et automatiser la gestion des pièces de rechange sur le site industriel Séchage Béni Idir du Groupe OCP. Elle remplace les extractions manuelles SAP vers Excel par un système centralisé, temps réel et piloté par l'intelligence artificielle.

Le projet suit une démarche **MVP (Minimum Viable Product)** sur quatre semaines, articulée autour de trois services indépendants et complémentaires.

---

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                             │
│   Magasinier · Acheteur · Planificateur PI · Admin · Fournisseur│
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND — React 18                          │
│           SPA · Design System · RBAC côté client               │
│                  http://localhost:5173                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API · JWT Bearer
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND — Laravel 11                           │
│        API REST · JWT · Queue · Events · SAP Import            │
│                  http://localhost:8000                          │
└──────────┬──────────────────────────────┬───────────────────────┘
           │ HTTP + API Key               │ Webhooks
           ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│  AI SERVICE          │      │  n8n Automation       │
│  Python FastAPI      │      │  Relances · Alertes   │
│  Prophet · XGBoost   │      │  Rapports planifiés   │
│  Random Forest       │      │                      │
│  Isolation Forest    │      │  http://localhost:5678│
│  http://localhost:8001│     └──────────────────────┘
└──────────────────────┘
           │
           ▼
┌──────────────────────┐      ┌──────────────────────┐
│  MySQL 8             │      │  SAP MM/PM            │
│  Base de données     │      │  Import CSV/Excel     │
│  principale          │      │  (phase MVP)          │
└──────────────────────┘      └──────────────────────┘
```

---

## 🎯 Objectifs du projet

| Problème actuel | Solution apportée | Gain estimé |
|-----------------|-------------------|-------------|
| Extractions manuelles SAP → Excel | Dashboard temps réel | 80% |
| Stock mort non détecté | Workflow automatisé | 60% |
| Seuils Min/Max figés | Calcul dynamique IA (EOQ) | 70% |
| Aucune optimisation des coûts | Recommandations TCO + EOQ | 10–25% |
| Suivi des commandes dispersé | Pipeline Kanban temps réel | 75% |
| Relances fournisseurs manuelles | Escalade automatique 6 niveaux | 90% |
| Consommation suivie ponctuellement | Reporting hebdo/mensuel automatique | 85% |
| Rapports email manuels | Envoi automatisé 100% | 100% |

---

## 👥 Rôles utilisateurs

| Rôle | Pages | Fonctionnalités principales |
|------|-------|-----------------------------|
| **Magasinier** | 4 pages | Dashboard KPI · Stock · Mouvements · Réceptions |
| **Acheteur** | 5 pages | Dashboard · Demandes achat · Appels d'offres · Commandes · Fournisseurs |
| **Planificateur PI** | 5 pages | Dashboard · Stock & alertes · Seuils Min/Max · Reporting · Stock mort |
| **Admin** | 4 pages | Dashboard · Utilisateurs · Rôles & droits · Logs |
| **Fournisseur** | 4 pages | Dashboard · Appels d'offres · Offres · Commandes |

---

## 🛠️ Stack technique complète

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18 | Framework UI |
| React Router DOM | 6 | Navigation SPA |
| Recharts | 2.12 | Graphiques interactifs |
| CSS Design System | — | Styles personnalisés (dark theme) |
| Vite | 5 | Build tool |

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Laravel | 11 | Framework PHP API REST |
| PHP | 8.2+ | Langage serveur |
| MySQL | 8.0 | Base de données principale |
| JWT Sanctum | — | Authentification sécurisée |
| Laravel Queue | — | Jobs asynchrones |
| n8n | — | Automatisation workflows |

### AI Service
| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.10+ | Langage IA |
| FastAPI | 0.110 | Framework API asynchrone |
| Prophet | 1.1 | Prévision séries temporelles |
| XGBoost | 2.0 | Boosting gradient |
| scikit-learn | 1.4 | Random Forest + Isolation Forest |
| Uvicorn | — | Serveur ASGI |

---

## 📁 Structure du monorepo

```
OCP_Spare_Intelligence/
├── frontend/               # React 18 — Interface utilisateur SPA
│   ├── src/
│   │   ├── components/     # Composants réutilisables (DataTable, Modal, Kanban...)
│   │   ├── pages/          # Pages par rôle (magasinier, acheteur, pi, admin, fournisseur)
│   │   ├── constants/      # Liens de navigation, données statiques
│   │   ├── context/        # AuthContext (authentification + rôle)
│   │   └── styles/         # Design system complet (CSS variables)
│   ├── package.json
│   └── README.md
│
├── backend/                # Laravel 11 — API REST
│   ├── app/
│   │   ├── Http/           # Controllers, Middleware, Requests, Resources
│   │   ├── Models/         # 20 modèles Eloquent
│   │   ├── Services/       # Logique métier par domaine
│   │   ├── Jobs/           # 6 jobs asynchrones
│   │   └── Mail/           # 7 templates d'emails
│   ├── database/
│   │   ├── migrations/     # 29 migrations
│   │   └── seeders/        # 9 seeders
│   ├── routes/api.php      # Routes REST par rôle
│   └── README.md
│
└── ai-service/             # Python FastAPI — Microservice IA
    ├── main.py             # Point d'entrée FastAPI
    ├── models/
    │   ├── forecast.py     # Prophet + XGBoost
    │   ├── anomaly.py      # Isolation Forest
    │   └── criticality.py  # Random Forest
    ├── requirements.txt
    └── README.md
```

---

## 🚀 Installation complète

### Prérequis globaux

- Node.js >= 18
- PHP >= 8.2 + Composer
- MySQL 8+
- Python >= 3.10 + pip

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
# → http://localhost:8000/api
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
# → http://localhost:8001
# → http://localhost:8001/docs (Swagger)
```

### 4. Variables d'environnement backend (.env)

```env
# Base de données
DB_DATABASE=ocp_spare_intelligence
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_TTL=1440

# Microservice IA
ML_SERVICE_URL=http://localhost:8001
ML_API_KEY=votre_cle_api

# n8n
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=

# Mail
MAIL_FROM_ADDRESS=noreply@ocp.ma
```

---

## 🔐 Authentification

### Comptes de test

| Email | Mot de passe | Rôle | Redirection |
|-------|-------------|------|-------------|
| `magasinier@ocp.ma` | `password` | Magasinier | `/magasinier/dashboard` |
| `acheteur@ocp.ma` | `password` | Acheteur | `/acheteur/dashboard` |
| `pi@ocp.ma` | `password` | Planificateur PI | `/pi/dashboard` |
| `admin@ocp.ma` | `password` | Administrateur | `/admin/dashboard` |
| `fournisseur@ocp.ma` | `password` | Fournisseur | `/fournisseur/dashboard` |

### Flux d'authentification

```
Login (email + password)
        ↓
POST /api/auth/login
        ↓
{ token JWT, user, role }
        ↓
Redirection vers le dashboard du rôle
        ↓
Authorization: Bearer <token> sur chaque requête API
```

---

## 🤖 Modèles IA

| Modèle | Algorithme | Endpoint | Gain |
|--------|------------|----------|------|
| Prévision consommation | Prophet + XGBoost | `POST /forecast` | 85% |
| Optimisation EOQ/TCO | EOQ dynamique | `POST /eoq` | 10–25% |
| Criticité pièces | Random Forest | `POST /criticality` | 70% |
| Détection anomalies | Isolation Forest | `POST /anomalies` | 60% |

---

## 📊 Fonctionnalités principales

### Gestion des stocks
- Tableau de bord KPI en temps réel
- Classification automatique ABC/XYZ
- Détection et traitement du stock mort
- Alertes de rupture imminente
- Seuils Min/Max calculés dynamiquement par IA

### Achats & Appels d'offres
- Pipeline Kanban visuel de bout en bout
- Sélection automatique des TOP 3 fournisseurs
- Comparaison multicritères des offres (Prix 60% · Délai 25% · Qualité 15%)
- Génération automatique des bons de commande

### Relances fournisseurs
- Escalade automatique sur 6 niveaux (J-7 → J+15)
- Génération d'emails personnalisés via n8n
- Scorecard fournisseurs mis à jour automatiquement
- Activation du fournisseur de secours en dernier recours

### Reporting automatisé
- Rapport hebdomadaire et mensuel par email
- Alertes en temps réel sur les anomalies
- Export Excel et PDF à la demande
- Historique complet avec logs d'audit

### Intégration SAP
- Import CSV/Excel depuis SAP MM/PM (phase MVP)
- Pipeline automatisé : pending → processed / failed
- Synchronisation planifiée via Artisan commands

---

## 🗺️ Routes de l'application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | `http://localhost:5173` | Interface React SPA |
| Backend API | `http://localhost:8000/api` | API REST Laravel |
| AI Service | `http://localhost:8001` | Microservice FastAPI |
| AI Docs | `http://localhost:8001/docs` | Swagger automatique |
| n8n | `http://localhost:5678` | Interface automation |

---

## 🧪 Tests

```bash
# Frontend — pas de tests configurés (MVP)
# cd frontend && npm test

# Backend
cd backend
php artisan test
php artisan test --coverage

# AI Service
cd ai-service
pytest
pytest --cov=models
```

---

## 📅 Planning du projet

| Jalon | Livrable | Date |
|-------|----------|------|
| ML1 | Cahier des charges fonctionnel | 1er avril 2026 |
| ML2 | Analyse et conception (UML, BDD) | 8 avril 2026 |
| ML3 | Architecture technique & choix stack | 15 avril 2026 |
| ML4 | Développement de la plateforme | 27 avril 2026 |
| ML5 | Tests & déploiement | 1er mai 2026 |

---

## 🔒 Sécurité

- Authentification JWT avec expiration configurable
- RBAC (Role-Based Access Control) par rôle sur chaque route
- Rate limiting sur les endpoints sensibles
- Logs d'audit complets sur toutes les actions
- CORS configuré pour le frontend uniquement
- **Hébergement strictement on-premise** — aucune donnée transférée vers un cloud public
- Conformité avec la politique IT du Groupe OCP

---

## 📄 Documentation

Chaque service dispose de son propre README détaillé :

| Service | Documentation |
|---------|--------------|
| Frontend | [`frontend/README.md`](./frontend/README.md) |
| Backend | [`backend/README.md`](./backend/README.md) |
| AI Service | [`ai-service/README.md`](./ai-service/README.md) |

---

## 📄 Licence

Ce projet est **confidentiel** et propriété exclusive du **Groupe OCP**. Toute reproduction, distribution ou utilisation en dehors du cadre défini est strictement interdite.

## 👨‍💻 Auteur

Développé par **Mars Fadwa** — Stage ingénieur OCP Site Séchage Béni Idir · Khouribga · Mars–Mai 2026

## 📞 Support

Pour toute question ou assistance technique, contacter l'administrateur système OCP.

---

**Version : 1.0.0**
**Dernière mise à jour : Mai 2026**