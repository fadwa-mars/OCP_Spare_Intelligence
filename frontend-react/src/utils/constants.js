// src/utils/constants.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const ROLES = {
  ADMIN: 'admin',
  ACHETEUR: 'acheteur',
  PLANIFICATEUR: 'planificateur',
  MAGASINIER: 'magasinier',
}

export const ROLES_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.ACHETEUR]: 'Acheteur',
  [ROLES.PLANIFICATEUR]: 'Planificateur PI',
  [ROLES.MAGASINIER]: 'Magasinier',
}

export const ALERTE_NIVEAUX = {
  ROUGE: 'rouge',
  JAUNE: 'jaune',
  INFO: 'info',
}

export const COMMANDE_STATUTS = {
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  EXPEDIEE: 'expediee',
  RECUE: 'recue',
  ANNULEE: 'annulee',
}