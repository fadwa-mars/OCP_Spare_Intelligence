// src/constants/navLinks.js

export const NAV_LINKS_BY_ROLE = {
  magasinier:  ['Tableau de bord', 'Stock', 'Mouvement', 'Réception'],
  acheteur:    ['Tableau de bord', 'Demandes achat', "Appels d'offres", 'Commandes', 'Fournisseurs'],
  pi:          ['Tableau de bord', 'Stock & alertes', 'Seuils Min/Max', 'Reporting', 'Stock mort'],
  admin:       ['Tableau de bord', 'Utilisateurs', 'Rôles & droits', 'Logs'],
  fournisseur: ['Tableau de bord', "Mes appels d'offres", 'Mes offres', 'Mes commandes'],
};

export const NAV_ROUTES_BY_ROLE = {
  magasinier: {
    'Tableau de bord': '/magasinier/dashboard',
    'Stock':           '/magasinier/stock',
    'Mouvement':       '/magasinier/mouvement',
    'Réception':       '/magasinier/reception',
  },
  acheteur: {
    'Tableau de bord':  '/acheteur/dashboard',
    'Demandes achat':   '/acheteur/demandes',
    "Appels d'offres":  '/acheteur/appels-offres',
    'Commandes':        '/acheteur/commandes',
    'Fournisseurs':     '/acheteur/fournisseurs',
  },
  pi: {
    'Tableau de bord':  '/pi/dashboard',
    'Stock & alertes':  '/pi/stock',
    'Seuils Min/Max':   '/pi/seuils',
    'Reporting':        '/pi/reporting',
    'Stock mort':       '/pi/stock-mort',
  },
  admin: {
    'Tableau de bord':  '/admin/dashboard',
    'Utilisateurs':     '/admin/utilisateurs',
    'Rôles & droits':   '/admin/roles',
    'Configuration':    '/admin/configuration',
    'Logs':             '/admin/logs',
  },
  fournisseur: {
    'Tableau de bord':       '/fournisseur/dashboard',
    "Mes appels d'offres":   '/fournisseur/appels-offres',
    'Mes offres':            '/fournisseur/offres',
    'Mes commandes':         '/fournisseur/commandes',
    'Mon profil':            '/fournisseur/profil',
  },
};