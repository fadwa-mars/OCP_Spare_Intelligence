// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/design-system.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">

      {/* Glow background */}
      <div className="notfound-glow notfound-glow--top"    />
      <div className="notfound-glow notfound-glow--bottom" />

      <main className="notfound-main">

        {/* Icône boîte */}
        <div className="notfound-icon-wrapper">
          <svg
            className="notfound-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <div className="notfound-icon-glow" />
        </div>

        {/* 404 */}
        <h1 className="notfound-code">404</h1>

        {/* Titre */}
        <h2 className="notfound-title">
          Oups ! La pièce est introuvable.
        </h2>

        {/* Description */}
        <p className="notfound-desc">
          La page ou la pièce que vous cherchez n'est pas dans notre inventaire
          ou a été déplacée. Vérifiez la référence et réessayez.
        </p>

        {/* CTA */}
        <button
          className="notfound-cta"
          onClick={() => navigate('/')}
        >
          RETOUR AU TABLEAU DE BORD
        </button>

        {/* Support */}
        <div className="notfound-support">
          <span className="material-symbols-outlined">support_agent</span>
          <span>Besoin d'aide ? Contactez le support technique</span>
        </div>

      </main>
    </div>
  );
}