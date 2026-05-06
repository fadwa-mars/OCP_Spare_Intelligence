import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function MonProfil() {
  const [activeNav, setActiveNav] = useState('Mon profil');

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.fournisseur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Mon profil',
        subtitle: 'Modifiez vos informations personnelles',
        ctaLabel: 'MODIFIER',
        ctaIcon: 'edit',
        onCta: () => console.log('Modifier profil'),
      }}
    >
      <div className="glass-card" style={{ padding: '24px' }}>
        <p>Formulaire de modification du profil à venir...</p>
      </div>
    </PageLayout>
  );
}