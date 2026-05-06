// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/design-system.css';

const MODULES = [
  {
    id: 1,
    title: 'Gestion de stock',
    icon: 'inventory',
    description: 'Suivez votre inventaire en temps réel, gérez les entrées/sorties et recevez des alertes automatiques.',
    color: 'primary',
    features: ['Stock en temps réel', 'Alertes seuil', 'Historique mouvements', 'Export Excel']
  },
  {
    id: 2,
    title: 'Achats & Commandes',
    icon: 'shopping_cart',
    description: 'Centralisez vos demandes d\'achat, appels d\'offres et commandes fournisseurs.',
    color: 'warning',
    features: ['Demandes d\'achat', 'Appels d\'offres', 'Suivi commandes', 'Référentiel fournisseurs']
  },
  {
    id: 3,
    title: 'Planification PI',
    icon: 'analytics',
    description: 'Analysez vos stocks, définissez les seuils et optimisez la rotation.',
    color: 'info',
    features: ['Classification ABC/XYZ', 'Seuils min/max', 'Reporting avancé', 'Stock mort']
  },
  {
    id: 4,
    title: 'Administration',
    icon: 'admin_panel_settings',
    description: 'Gérez les utilisateurs, les rôles et supervisez l\'activité système.',
    color: 'optimal',
    features: ['CRUD utilisateurs', 'Permissions par rôle', 'Logs système', 'Configuration']
  },
  {
    id: 5,
    title: 'Portail Fournisseur',
    icon: 'business',
    description: 'Accès dédié pour soumettre vos offres et suivre vos commandes.',
    color: 'critical',
    features: ['Soumission offres', 'Upload documents', 'Suivi commandes', 'Profil']
  }
];

const STATS = [
  { value: '5', label: 'Rôles utilisateurs' },
  { value: '20+', label: 'Pages fonctionnelles' },
  { value: '100%', label: 'Responsive' },
  { value: '24/7', label: 'Disponibilité' }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            OCP Spare Intelligence
          </h1>
          <p className="landing-hero__subtitle">
            Plateforme intelligente de gestion des pièces de rechange
          </p>
          <div className="landing-hero__buttons">
            <button className="landing-cta" onClick={() => navigate('/login')}>
              ACCÉDER À LA PLATEFORME
            </button>
            <button className="landing-cta landing-cta--secondary">
              CONTACTER LE SUPPORT
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="container">
          <div className="landing-stats__grid">
            {STATS.map((stat, idx) => (
              <div key={idx} className="landing-stat">
                <div className="landing-stat__value">{stat.value}</div>
                <div className="landing-stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="landing-modules">
        <div className="container">
          <h2 className="landing-section__title">Nos modules</h2>
          <p className="landing-section__subtitle">
            Une solution complète pour la gestion de vos pièces de rechange
          </p>
          <div className="landing-modules__grid">
            {MODULES.map((module) => (
              <div key={module.id} className="landing-card">
                <div className="landing-card__icon">
                  <span className="material-symbols-outlined">{module.icon}</span>
                </div>
                <h3 className="landing-card__title">{module.title}</h3>
                <p className="landing-card__description">{module.description}</p>
                <div className="landing-card__features">
                  {module.features.map((feature, idx) => (
                    <span key={idx} className="landing-feature">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="container">
          <h2 className="landing-cta__title">Prêt à optimiser votre gestion ?</h2>
          <p className="landing-cta__subtitle">
            Rejoignez les experts OCP et découvrez notre solution
          </p>
          <button className="landing-cta landing-cta--large" onClick={() => navigate('/')}>
            COMMENCER MAINTENANT
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer__content">
            <span className="landing-footer__brand">OCP Spare Intelligence</span>
            <p className="landing-footer__copyright">
              © 2024 OCP Group - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}