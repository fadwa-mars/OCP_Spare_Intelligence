# OCP Spare Intelligence — Backend API

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-11-red?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2-purple?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Sanctum-orange?logo=jsonwebtokens)
![Python](https://img.shields.io/badge/Python-FastAPI-green?logo=python)
![n8n](https://img.shields.io/badge/n8n-Automation-red?logo=n8n)

</div>

## 📋 Description

OCP Spare Intelligence est une API REST Laravel 11 conçue pour la gestion intelligente des pièces de rechange sur le site Séchage Béni Idir du Groupe OCP à Khouribga. Elle expose l'ensemble des services métier : gestion des stocks, achats, appels d'offres, commandes, relances fournisseurs, reporting automatisé et intelligence artificielle.

## 🎯 Objectifs

- Centraliser et automatiser la gestion des pièces de rechange
- Détecter les ruptures de stock et ajuster dynamiquement les seuils Min/Max
- Digitaliser le processus d'achat et d'appel d'offres
- Automatiser les relances fournisseurs avec escalade multi-niveaux
- Fournir des modèles IA pour la prévision de consommation et l'optimisation des coûts
- Assurer une traçabilité complète via logs d'audit

## 👥 Rôles utilisateurs

| Rôle | Accès | Fonctionnalités principales |
|------|-------|----------------------------|
| **Magasinier** | Gestion des stocks | Dashboard KPI, Stock, Mouvements, Réceptions, Alertes |
| **Acheteur** | Gestion des achats | Demandes achat, Appels d'offres, Commandes, Fournisseurs |
| **PI (Planificateur)** | Planification industrielle | Seuils Min/Max, Reporting, Stock mort, Classification ABC/XYZ |
| **Admin** | Administration système | Utilisateurs, Rôles & droits, Configuration, Logs audit |
| **Fournisseur** | Gestion des offres | Appels d'offres reçus, Dépôt d'offres, Commandes |

## 🛠️ Stack technique

### Backend

- **Laravel 11** — Framework PHP
- **Laravel Sanctum + JWT** — Authentification sécurisée
- **MySQL 8** — Base de données principale
- **Laravel Queue** — Jobs asynchrones (emails, calculs, imports)
- **Laravel Events / Listeners** — Architecture événementielle

### Services externes

| Service | Rôle |
|---------|------|
| **Python FastAPI** | Microservice IA (prévision, EOQ, criticité, anomalies) |
| **n8n** | Automatisation des workflows (relances, alertes, rapports) |
| **SAP MM/PM** | Source de données (import CSV/Excel en phase MVP) |

### Bibliothèques principales

| Bibliothèque | Utilisation |
|--------------|-------------|
| `tymon/jwt-auth` | Authentification JWT |
| `maatwebsite/excel` | Export Excel |
| `barryvdh/laravel-dompdf` | Export PDF |
| `guzzlehttp/guzzle` | Appels HTTP vers microservice IA et n8n |
| `spatie/laravel-permission` | Gestion RBAC |
| `laravel/sanctum` | API token management |

## 📁 Structure du projet

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/               # Commandes Artisan planifiées (8 commandes)
│   │       ├── CheckStockThresholds.php
│   │       ├── DetectDeadStock.php
│   │       ├── GenerateClassification.php
│   │       ├── CalculateSupplierScores.php
│   │       ├── SendSupplierReminders.php
│   │       ├── GeneratePeriodicReports.php
│   │       ├── SendEmailReports.php
│   │       └── SapImportCommand.php
│   │
│   ├── Events/                     # Événements métier (10 événements)
│   ├── Http/
│   │   ├── Controllers/API/        # 25 controllers REST par domaine
│   │   │   ├── AuthController.php
│   │   │   ├── ArticleController.php
│   │   │   ├── StockController.php
│   │   │   ├── MouvementStockController.php
│   │   │   ├── DemandeAchatController.php
│   │   │   ├── AppelOffreController.php
│   │   │   ├── CommandeController.php
│   │   │   ├── FournisseurController.php
│   │   │   ├── OffreController.php
│   │   │   ├── AlerteController.php
│   │   │   ├── RelanceController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ReportingController.php
│   │   │   ├── AIController.php
│   │   │   ├── AdminController.php
│   │   │   ├── SapImportController.php
│   │   │   └── SimulationController.php
│   │   │
│   │   ├── Middleware/             # JWT, RBAC, CORS, throttle, logs
│   │   ├── Requests/               # Validation par domaine métier
│   │   └── Resources/             # Transformations JSON API (20 resources)
│   │
│   ├── Jobs/                       # Jobs asynchrones (6 jobs)
│   │   ├── ProcessSapImportJob.php
│   │   ├── SendEmailReportJob.php
│   │   ├── CalculateThresholdsJob.php
│   │   ├── ProcessDeadStockJob.php
│   │   ├── SendBulkRemindersJob.php
│   │   └── SyncSapDataJob.php
│   │
│   ├── Listeners/                  # Handlers d'événements (8 listeners)
│   ├── Mail/                       # Emails Laravel (7 templates)
│   │   ├── WeeklyReportMail.php
│   │   ├── MonthlyReportMail.php
│   │   ├── RuptureAlertMail.php
│   │   ├── RelanceFournisseurMail.php
│   │   ├── OrderConfirmationMail.php
│   │   ├── ApprovalRequestMail.php
│   │   └── TenderResultMail.php
│   │
│   ├── Models/                     # 20 modèles Eloquent ORM
│   │   ├── User.php
│   │   ├── Article.php
│   │   ├── Stock.php
│   │   ├── MouvementStock.php
│   │   ├── DemandeAchat.php
│   │   ├── AppelOffre.php
│   │   ├── Commande.php
│   │   ├── LigneCommande.php
│   │   ├── Offre.php
│   │   ├── Fournisseur.php
│   │   ├── Alerte.php
│   │   ├── Relance.php
│   │   ├── Reporting.php
│   │   ├── RegleMarchePublic.php
│   │   ├── ClassificationAbcXyz.php
│   │   ├── HistoriqueStock.php
│   │   ├── SeuilHistorique.php
│   │   ├── SimulationWhatIf.php
│   │   ├── AuditLog.php
│   │   └── SapImportLog.php
│   │
│   ├── Repositories/              # Couche d'accès aux données (9 repositories)
│   ├── Rules/                     # Règles de validation métier (4 rules)
│   └── Services/                  # Logique métier organisée par domaine
│       ├── AI/                    # Intégration microservice ML (5 services)
│       │   ├── ConsumptionForecastService.php
│       │   ├── EOQOptimizerService.php
│       │   ├── CriticalityScoreService.php
│       │   ├── AnomalyDetectionService.php
│       │   └── MLClientService.php
│       ├── Alert/                 # Détection ruptures & seuils (3 services)
│       ├── Auth/                  # JWT & permissions RBAC (2 services)
│       ├── Automation/            # n8n webhooks & cron (2 services)
│       ├── Inventory/             # Stock, classification ABC/XYZ (4 services)
│       ├── Purchasing/            # Appels d'offres, commandes (4 services)
│       ├── Reporting/             # Excel, PDF, Email (4 services)
│       ├── SapIntegration/        # Import CSV/Excel SAP (4 services)
│       ├── Supplier/              # Scoring & relances fournisseurs (3 services)
│       └── Workflow/              # Workflows d'approbation (3 services)
│
├── config/                        # 20 fichiers de configuration
│   ├── alerts.php
│   ├── deadstock.php
│   ├── ml.php
│   ├── n8n.php
│   ├── permissions.php
│   ├── roles.php
│   ├── reporting.php
│   ├── sap.php
│   └── thresholds.php
│
├── database/
│   ├── migrations/                # 29 migrations
│   └── seeders/                   # 9 seeders (articles, stocks, users, ...)
│
├── routes/
│   └── api.php                    # Toutes les routes REST groupées par rôle
│
└── storage/
    ├── app/sap_imports/           # Fichiers SAP (pending / processed / failed)
    └── app/reports/               # Rapports générés (weekly / monthly)
```

## 🎨 Architecture API

### Authentification & Sécurité

| Mécanisme | Détail |
|-----------|--------|
| **JWT Bearer Token** | Token signé, durée configurable (TTL) |
| **RBAC Middleware** | `RoleMiddleware` par rôle sur chaque groupe de routes |
| **Rate Limiting** | `ThrottleRequests` sur endpoints sensibles |
| **Audit Log** | `LogUserActivity` — chaque action tracée en base |
| **CORS** | Configuré pour le frontend React uniquement |
| **On-premise** | Aucune donnée transférée vers un cloud public |

### Codes de réponse API

| Code | Signification |
|------|--------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides |
| `401` | Non authentifié |
| `403` | Accès refusé (rôle insuffisant) |
| `404` | Ressource introuvable |
| `422` | Erreur de validation |
| `500` | Erreur serveur |

## 🚀 Installation

### Prérequis

- PHP >= 8.2
- Composer
- MySQL 8+
- Node.js (assets optionnels)
- Python 3.10+ (microservice IA séparé)

### Étapes d'installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd backend

# 2. Installer les dépendances PHP
composer install

# 3. Copier et configurer l'environnement
cp .env.example .env

# 4. Générer la clé applicative
php artisan key:generate

# 5. Générer le secret JWT
php artisan jwt:secret

# 6. Lancer les migrations + seeders
php artisan migrate --seed

# 7. Créer le lien symbolique pour le storage
php artisan storage:link

# 8. Démarrer le serveur
php artisan serve
```

L'API est accessible sur `http://localhost:8000/api`

## 🔐 Authentification

### Utilisateurs de test (créés par les seeders)

| Email | Rôle | Mot de passe |
|-------|------|--------------|
| `magasinier@ocp.ma` | Magasinier | `password` |
| `acheteur@ocp.ma` | Acheteur | `password` |
| `pi@ocp.ma` | Planificateur PI | `password` |
| `admin@ocp.ma` | Administrateur | `password` |
| `fournisseur@ocp.ma` | Fournisseur | `password` |

### Flux d'authentification

```
POST /api/auth/login → { token, user, role }
                              ↓
Authorization: Bearer <token> → accès aux routes protégées
                              ↓
POST /api/auth/refresh → nouveau token
POST /api/auth/logout  → révocation du token
```

## 📊 Fonctionnalités par domaine

### Stock & Articles

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/articles` | GET, POST | magasinier, pi |
| `/api/articles/{id}` | GET, PUT, DELETE | magasinier, pi |
| `/api/stocks` | GET | tous |
| `/api/stocks/movement` | POST | magasinier |
| `/api/stocks/alertes` | GET | magasinier, pi |
| `/api/mouvements` | GET, POST | magasinier |

### Achats & Appels d'offres

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/demandes-achat` | GET, POST | acheteur, pi |
| `/api/demandes-achat/{id}/approve` | PUT | acheteur |
| `/api/appels-offres` | GET, POST | acheteur |
| `/api/offres` | GET, POST | fournisseur |
| `/api/commandes` | GET, POST | acheteur |
| `/api/commandes/{id}/receive` | PUT | magasinier |

### Fournisseurs & Relances

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/fournisseurs` | GET, POST, PUT | acheteur |
| `/api/fournisseurs/{id}/score` | GET | acheteur, pi |
| `/api/relances` | GET, POST | acheteur |

### Alertes & Dashboard

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/alertes` | GET | tous |
| `/api/alertes/{id}/traiter` | PUT | magasinier, pi |
| `/api/dashboard` | GET | tous (données filtrées par rôle) |

### Import SAP

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/sap/import` | POST | admin, pi |
| `/api/sap/logs` | GET | admin |

### IA & Reporting

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/ai/forecast/{article_id}` | GET | pi |
| `/api/ai/criticality` | GET | pi |
| `/api/ai/anomalies` | GET | pi, admin |
| `/api/ai/eoq/{article_id}` | GET | pi, acheteur |
| `/api/reporting` | GET | pi, admin |
| `/api/reporting/generate` | POST | pi, admin |
| `/api/simulation/whatif` | GET | pi |

### Administration

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/admin/users` | GET, POST, PUT, DELETE | admin |
| `/api/admin/roles` | GET, PUT | admin |
| `/api/admin/logs` | GET | admin |
| `/api/admin/configuration` | GET, PUT | admin |

## 🤖 Microservice IA (Python FastAPI)

Le backend Laravel communique avec un microservice FastAPI via `MLClientService`. Quatre modèles sont exposés :

| Modèle | Endpoint ML | Algorithme | Gain estimé |
|--------|-------------|------------|-------------|
| Prévision consommation | `/forecast` | Prophet + XGBoost | 85% |
| Optimisation coûts EOQ | `/eoq` | EOQ dynamique + TCO | 10–25% |
| Criticité pièces | `/criticality` | Random Forest | 70% |
| Détection anomalies | `/anomalies` | Isolation Forest | 60% |

## ⚙️ Commandes Artisan planifiées

```bash
# Vérifier les seuils et générer des alertes (quotidien)
php artisan stock:check-thresholds

# Détecter le stock mort (hebdomadaire)
php artisan stock:detect-dead

# Générer la classification ABC/XYZ (hebdomadaire)
php artisan stock:generate-classification

# Calculer les scores fournisseurs (hebdomadaire)
php artisan suppliers:calculate-scores

# Envoyer les relances fournisseurs automatiques (quotidien)
php artisan suppliers:send-reminders

# Générer les rapports périodiques (hebdomadaire + mensuel)
php artisan reports:generate
php artisan reports:send-emails

# Import SAP (déclenchement manuel ou automatique)
php artisan sap:import
```

## 📦 Variables d'environnement clés

```env
# Application
APP_NAME="OCP Spare Intelligence"
APP_ENV=local
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ocp_spare_intelligence
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_TTL=1440

# Microservice IA (Python FastAPI)
ML_SERVICE_URL=http://localhost:8001
ML_API_KEY=

# n8n Automation
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=

# SAP Integration
SAP_IMPORT_PATH=storage/app/sap_imports
SAP_PROCESSED_PATH=storage/app/sap_imports/processed

# Mail (rapports automatiques)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@ocp.ma
```

## 🗄️ Base de données

### Migrations (29 tables)

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs + rôles |
| `articles` | Articles / pièces de rechange |
| `stocks` | Niveaux de stock par article |
| `mouvement_stocks` | Historique des entrées/sorties |
| `demande_achats` | Demandes d'achat |
| `appel_offres` | Appels d'offres publics |
| `offres` | Offres soumises par les fournisseurs |
| `commandes` | Bons de commande |
| `ligne_commandes` | Lignes de commande |
| `fournisseurs` | Référentiel fournisseurs + score |
| `alertes` | Alertes stock générées automatiquement |
| `relances` | Relances fournisseurs avec escalade |
| `reportings` | Rapports générés |
| `regle_marche_publics` | Règles de marché public |
| `classification_abcxyz` | Classification ABC/XYZ des articles |
| `historique_stocks` | Historique des niveaux de stock |
| `seuil_historiques` | Historique des seuils Min/Max |
| `simulations_whatif` | Simulations d'impact de politique de stock |
| `audit_logs` | Logs d'audit complets |
| `sap_import_logs` | Logs des imports SAP |

## 🔄 Import SAP

Les fichiers CSV/Excel exportés depuis SAP sont traités via un pipeline automatisé :

```
storage/app/sap_imports/pending/
        ↓
   SapCsvImporter → SapDataTransformer
        ↓                   ↓
   Validation          Normalisation
        ↓
   Insertion en base (Articles, Stocks, Mouvements)
        ↓
storage/app/sap_imports/processed/   (succès)
storage/app/sap_imports/failed/       (erreur)
```

## 🧪 Tests

```bash
# Tous les tests
php artisan test

# Tests par domaine
php artisan test --filter=AuthTest
php artisan test --filter=StockControllerTest
php artisan test --filter=TenderControllerTest
php artisan test --filter=SapImportControllerTest
php artisan test --filter=ApprovalWorkflowTest
php artisan test --filter=DeadStockDetectionServiceTest

# Avec couverture de code
php artisan test --coverage
```

## 📦 Scripts disponibles

```bash
# Développement
php artisan serve              # Démarrer le serveur
php artisan queue:work         # Démarrer le worker de queue
php artisan schedule:run       # Lancer les tâches planifiées manuellement

# Base de données
php artisan migrate            # Lancer les migrations
php artisan migrate:fresh --seed   # Reset complet + seeders
php artisan db:seed            # Lancer uniquement les seeders

# Cache & optimisation
php artisan config:cache
php artisan route:cache
php artisan optimize

# Maintenance
php artisan storage:link
php artisan queue:restart
```

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité (`feature/nom-feature`)
2. Respecter l'architecture en couches (Controller → Service → Repository)
3. Ajouter les validations dans les `Request` classes
4. Écrire les tests Feature correspondants
5. Créer une Pull Request

## 📄 Licence

Ce projet est confidentiel et propriété du Groupe OCP. Hébergement strictement on-premise — aucun transfert vers un cloud public.

## 👨‍💻 Auteur

Développé par **Mars Fadwa** — Stage OCP Séchage Béni Idir · Khouribga · Avril–Mai 2026

## 📞 Support

Pour toute question ou assistance technique, contacter l'administrateur système OCP.

---

**Version : 1.0.0**
**Dernière mise à jour : Mai 2026**