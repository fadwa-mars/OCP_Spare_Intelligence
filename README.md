# OCP Spare Intelligence - Plateforme de gestion intelligente des pièces de rechange

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![React Router](https://img.shields.io/badge/React_Router-DOM-orange?logo=react-router)
![Recharts](https://img.shields.io/badge/Recharts-2.12-green)
![CSS3](https://img.shields.io/badge/CSS3-Design_System-blue?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)

</div>

## 📋 Description

OCP Spare Intelligence est une plateforme web moderne de gestion des pièces de rechange, conçue pour les besoins industriels du Groupe OCP. L'application permet de gérer l'ensemble du cycle de vie des stocks, des achats, des appels d'offres et des commandes, avec des interfaces dédiées par rôle utilisateur.

## 🎯 Objectifs

- Centraliser la gestion des pièces de rechange
- Optimiser les niveaux de stock et prévenir les ruptures
- Digitaliser le processus d'achat et d'appel d'offres
- Fournir des outils d'analyse et de reporting
- Assurer une traçabilité complète des actions

## 👥 Rôles utilisateurs

| Rôle | Accès | Fonctionnalités principales |
|------|-------|----------------------------|
| **Magasinier** | Gestion des stocks | Dashboard KPI, Liste stock, Mouvements, Réceptions |
| **Acheteur** | Gestion des achats | Dashboard, Demandes d'achat, Appels d'offres, Commandes, Fournisseurs |
| **PI (Planificateur)** | Planification industrielle | Dashboard, Alertes stock, Seuils Min/Max, Reporting, Stock mort |
| **Admin** | Administration système | Dashboard, Utilisateurs, Rôles & droits, Logs |
| **Fournisseur** | Gestion des offres | Dashboard, Appels d'offres, Offres, Commandes |

## 🛠️ Stack technique

### Frontend
- **React 18** - Framework UI
- **React Router DOM** - Navigation
- **Recharts** - Graphiques et visualisations
- **CSS Modules / Design System** - Styles personnalisés

### Bibliothèques
| Bibliothèque | Utilisation |
|--------------|-------------|
| `react` | Framework UI |
| `react-dom` | Rendu DOM |
| `react-router-dom` | Routage |
| `recharts` | Graphiques interactifs |
| `material-symbols-outlined` | Icônes |

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── DataTable.jsx    # Tableau avec recherche/pagination
│   │   ├── Modal.jsx        # Fenêtre modale générique
│   │   ├── KanbanBoard.jsx  # Tableau Kanban drag & drop
│   │   ├── StatCard.jsx     # Carte de statistiques KPI
│   │   ├── ChartCard.jsx    # Conteneur pour graphiques
│   │   ├── FormCard.jsx     # Formulaires
│   │   ├── ConfirmDialog.jsx # Dialogue de confirmation
│   │   ├── SelectableTable.jsx # Tableau à sélection multiple
│   │   ├── MonProfil.jsx    # Modal de profil utilisateur
│   │   ├── TopNav.jsx       # Barre de navigation
│   │   ├── Hero.jsx         # En-tête de page
│   │   ├── LocalNav.jsx     # Navigation locale
│   │   └── PageLayout.jsx   # Layout principal
│   │
│   ├── pages/               # Pages par rôle
│   │   ├── shared/          # Pages partagées
│   │   │   ├── Login.jsx    # Authentification
│   │   │   └── NotFound.jsx # Page 404
│   │   ├── magasinier/      # Pages Magasinier (4 pages)
│   │   ├── acheteur/        # Pages Acheteur (5 pages)
│   │   ├── pi/              # Pages Planificateur PI (5 pages)
│   │   ├── admin/           # Pages Administrateur (4 pages)
│   │   └── fournisseur/     # Pages Fournisseur (4 pages)
│   │
│   ├── constants/           # Données statiques
│   │   ├── navLinks.js      # Liens de navigation par rôle
│   │   └── stockData.js     # Données mockées stock
│   │
│   ├── context/             # Contexte React
│   │   └── AuthContext.jsx  # Gestion d'authentification
│   │
│   └── styles/              # Styles globaux
│       └── design-system.css # Design system complet
│
├── public/                  # Assets statiques
├── index.html
├── package.json
└── README.md
```

## 🎨 Design System

### Couleurs principales

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `--color-background` | `#0d150d` | Fond principal |
| `--color-surface-base` | `#121212` | Surfaces de base |
| `--color-surface-elevated` | `#181818` | Surfaces surélevées |
| `--color-surface-interactive` | `#1f1f1f` | Éléments interactifs |
| `--color-accent-green` | `#1ed760` | Accent principal (vert OCP) |
| `--color-accent-green-alt` | `#1db954` | Accent alternatif |
| `--color-text-primary` | `#ffffff` | Texte principal |
| `--color-text-secondary` | `#b3b3b3` | Texte secondaire |
| `--color-semantic-negative` | `#f3727f` | Erreur / Critique |
| `--color-semantic-warning` | `#ffa42b` | Attention / Alerte |
| `--color-semantic-info` | `#539df5` | Information |

### Typographie

- Police principale : **Plus Jakarta Sans**
- Tailles : 10px, 11px, 12px, 13px, 14px, 15px, 16px, 18px, 20px, 22px, 24px, 28px, 36px
- Épaisseurs : 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Espacement

| Variable | Valeur |
|----------|--------|
| `--space-micro` | 2px |
| `--space-xsmall` | 4px |
| `--space-small` | 8px |
| `--space-medium` | 16px |
| `--space-large` | 24px |
| `--space-xlarge` | 32px |

### Ombres

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `--shadow-heavy` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dialogues |
| `--shadow-medium` | `0 8px 8px rgba(0,0,0,0.3)` | Cartes, dropdowns |
| `--shadow-inset` | `inset 0 0 0 1px #7c7c7c, inset 0 2px 4px rgba(18,18,18,0.5)` | Champs de saisie |

### Rayons de bordure

| Variable | Valeur |
|----------|--------|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 16px |
| `--radius-xl` | 24px |
| `--radius-full` | 9999px |

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Étapes d'installation

```bash
# Cloner le projet
git clone https://github.com/your-repo/ocp-spare-intelligence.git

# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Installer les dépendances supplémentaires
npm install recharts react-router-dom

# Démarrer le serveur de développement
npm run dev
```

### Accès à l'application

Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur.

## 🔐 Authentification

### Utilisateurs de test

| Email | Rôle | Page de redirection |
|-------|------|---------------------|
| `magasinier@ocp.ma` | Magasinier | `/magasinier/dashboard` |
| `acheteur@ocp.ma` | Acheteur | `/acheteur/dashboard` |
| `pi@ocp.ma` | Planificateur PI | `/pi/dashboard` |
| `admin@ocp.ma` | Administrateur | `/admin/dashboard` |
| `fournisseur@ocp.ma` | Fournisseur | `/fournisseur/dashboard` |

> **Note :** Tous les comptes de test acceptent n'importe quel mot de passe.

## 📱 Responsive Design

| Breakpoint | Écran | Cartes KPI | Graphiques |
|------------|-------|------------|------------|
| > 1200px | XL (desktop) | 4 par ligne | 2 côte à côte |
| 992px - 1199px | LG (desktop) | 4 par ligne | 2 côte à côte |
| 768px - 991px | MD (tablette) | 3 par ligne | 2 côte à côte |
| 481px - 767px | SM (tablette) | 2 par ligne | 2 côte à côte |
| < 480px | XS (mobile) | 1 par ligne | 1 par ligne |

## 📊 Fonctionnalités par rôle

### Magasinier (4 pages)

| Page | Fonctionnalités |
|------|-----------------|
| Dashboard | KPI, graphique entrées/sorties, alertes stock |
| Liste stock | DataTable, recherche, pagination, export, modal détails |
| Mouvements | Historique entrées/sorties, modal nouveau mouvement |
| Réceptions | Liste commandes, modal sélection BL, validation |

### Acheteur (5 pages)

| Page | Fonctionnalités |
|------|-----------------|
| Dashboard | KPI, graphique dépenses, top fournisseurs |
| Demandes achat | Kanban 6 colonnes, CRUD complet, drag & drop |
| Appels d'offres | Kanban 5 colonnes, CRUD complet, drag & drop |
| Commandes | Kanban 6 colonnes, CRUD complet, drag & drop |
| Fournisseurs | DataTable CRUD, recherche, export |

### Planificateur PI (5 pages)

| Page | Fonctionnalités |
|------|-----------------|
| Dashboard | KPI, graphiques ABC et tendance, classification XYZ |
| Stock alertes | Kanban 5 colonnes, traitement des alertes |
| Seuils Min/Max | DataTable éditable, modification seuils |
| Reporting | Graphiques consommation, top articles, export |
| Stock mort | Kanban 5 colonnes, décisions d'écoulement |

### Administrateur (4 pages)

| Page | Fonctionnalités |
|------|-----------------|
| Dashboard | KPI, graphiques activité et logins |
| Utilisateurs | DataTable CRUD, activation, réinitialisation MDP |
| Rôles & droits | Matrice 5 roles × 6 modules, permissions |
| Logs | DataTable avec filtres, modale détails, export |

### Fournisseur (4 pages)

| Page | Fonctionnalités |
|------|-----------------|
| Dashboard | KPI, graphiques, top performances |
| Mes appels d'offres | DataTable AO, modal réponse avec document |
| Mes offres | Kanban 5 colonnes, CRUD complet, drag & drop |
| Mes commandes | DataTable commandes, modal détails |

## 🔧 Composants réutilisables

| Composant | Description | Props principales |
|-----------|-------------|-------------------|
| `DataTable` | Tableau avec recherche, pagination, export | `columns`, `data`, `onRowClick`, `onExport` |
| `Modal` | Fenêtre modale générique | `isOpen`, `onClose`, `title`, `size`, `actions` |
| `KanbanBoard` | Tableau Kanban drag & drop | `columns`, `onDragEnd`, `onEditItem`, `onDeleteItem` |
| `StatCard` | Carte de statistiques KPI | `title`, `value`, `icon`, `trend`, `color` |
| `ChartCard` | Conteneur pour graphiques | `title`, `height`, `actions`, `children` |
| `FormCard` | Carte de formulaire | `title`, `icon`, `children`, `actions` |
| `ConfirmDialog` | Dialogue de confirmation | `isOpen`, `message`, `onConfirm`, `variant` |
| `SelectableTable` | Tableau à sélection multiple | `columns`, `data`, `selectedIds`, `onToggleSelect` |
| `MonProfil` | Modal de profil utilisateur | `isOpen`, `onClose` |
| `PageLayout` | Layout principal | `hero`, `navLinks`, `activeNav`, `children` |

## 📦 Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🗺️ Routes de l'application

### Routes publiques

| Route | Composant |
|-------|-----------|
| `/` | Login |
| `*` | NotFound |

### Routes Magasinier

| Route | Composant |
|-------|-----------|
| `/magasinier/dashboard` | DashMagasinier |
| `/magasinier/stock` | ListeStock |
| `/magasinier/mouvement` | Mouvement |
| `/magasinier/reception` | Reception |

### Routes Acheteur

| Route | Composant |
|-------|-----------|
| `/acheteur/dashboard` | DashAcheteur |
| `/acheteur/demandes` | DemandesAchat |
| `/acheteur/appels-offres` | AppelsOffres |
| `/acheteur/commandes` | Commandes |
| `/acheteur/fournisseurs` | Fournisseurs |

### Routes PI

| Route | Composant |
|-------|-----------|
| `/pi/dashboard` | DashPi |
| `/pi/stock` | StockAlertes |
| `/pi/seuils` | SeuilsMinMax |
| `/pi/reporting` | Reporting |
| `/pi/stock-mort` | StockMort |

### Routes Admin

| Route | Composant |
|-------|-----------|
| `/admin/dashboard` | DashAdmin |
| `/admin/utilisateurs` | Utilisateurs |
| `/admin/roles` | RolesDroits |
| `/admin/logs` | Logs |

### Routes Fournisseur

| Route | Composant |
|-------|-----------|
| `/fournisseur/dashboard` | DashFournisseur |
| `/fournisseur/appels-offres` | MesAppelsOffres |
| `/fournisseur/offres` | MesOffres |
| `/fournisseur/commandes` | MesCommandes |

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité
2. Développer en respectant le design system
3. Tester sur différentes tailles d'écran
4. Créer une Pull Request

## 📄 Licence

Ce projet est confidentiel et propriété du Groupe OCP.

## 👨‍💻 Auteurs

Développé par MARS FADWA.

## 📞 Support

Pour toute question ou assistance, contacter l'administrateur système.

---

**Version : 1.0.0**
**Dernière mise à jour : Mai 2024**