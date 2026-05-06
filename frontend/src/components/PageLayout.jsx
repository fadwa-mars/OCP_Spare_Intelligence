// src/components/PageLayout.jsx
import React from 'react';
import TopNav   from './TopNav';
import Hero     from './Hero';
import LocalNav from './LocalNav';
import '../styles/design-system.css';

/**
 * Props :
 *  hero        : { title, subtitle, ctaLabel, ctaIcon, onCta }
 *  navLinks    : string[]  — liens depuis NAV_LINKS_BY_ROLE[role]
 *  activeNav   : string    — lien actif
 *  onNavChange : func
 *  children    : ReactNode — contenu dynamique
 */
export default function PageLayout({ hero, navLinks = [], activeNav, onNavChange, children }) {
  return (
    <>
      <TopNav />
      <div style={{ paddingTop: 'var(--topnav-height)' }}>
        <Hero
          title={hero.title}
          subtitle={hero.subtitle}
          ctaLabel={hero.ctaLabel}
          ctaIcon={hero.ctaIcon}
          onCta={hero.onCta}
        />
        <LocalNav
          links={navLinks}
          active={activeNav}
          onChange={onNavChange}
        />
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}