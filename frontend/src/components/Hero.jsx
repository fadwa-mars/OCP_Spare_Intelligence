// src/components/Hero.jsx
import React from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - title      : string  — titre principal (ex: "Liste de stock")
 *  - subtitle   : string  — sous-titre descriptif
 *  - ctaLabel   : string  — texte du bouton CTA
 *  - ctaIcon    : string  — nom icône Material Symbols (ex: "inventory")
 *  - onCta      : func    — callback au clic du bouton
 */
export default function Hero({ title, subtitle, ctaLabel, ctaIcon, onCta }) {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div>
          <h1 className="hero__title">{title}</h1>
          {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        </div>

        {ctaLabel && (
          <button className="hero__cta" onClick={onCta}>
            {ctaIcon && (
              <span className="material-symbols-outlined">{ctaIcon}</span>
            )}
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  );
}