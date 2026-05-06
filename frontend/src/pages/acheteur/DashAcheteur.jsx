// src/pages/acheteur/DashAcheteur.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../styles/design-system.css';

// Données mockées
const STATS_DATA = {
  daEnAttente: 12,
  commandesActives: 8,
  aoPublies: 5,
  depenseMois: 2.4
};

const TOP_FOURNISSEURS = [
  { id: 1, nom: 'ABC Industries', montant: '850K MAD', commandes: 12, score: 98 },
  { id: 2, nom: 'SKF Maroc', montant: '620K MAD', commandes: 8, score: 95 },
  { id: 3, nom: 'Siemens', montant: '450K MAD', commandes: 5, score: 92 },
  { id: 4, nom: 'Parker', montant: '320K MAD', commandes: 4, score: 88 },
];

const COLUMNS_FOURNISSEURS = [
  { key: 'nom', label: 'Fournisseur', type: 'text', align: 'left' },
  { key: 'montant', label: 'Montant total', type: 'text', align: 'right' },
  { key: 'commandes', label: 'Commandes', type: 'text', align: 'center' },
  { key: 'score', label: 'Score', type: 'text', align: 'center' },
];

const DEPENSES_DATA = [
  { mois: 'Jan', montant: 1.8 },
  { mois: 'Fév', montant: 2.1 },
  { mois: 'Mar', montant: 2.3 },
  { mois: 'Avr', montant: 2.0 },
  { mois: 'Mai', montant: 2.4 },
  { mois: 'Juin', montant: 2.6 },
];

const handleExport = () => {
  console.log('Export rapport');
};

export default function DashAcheteur() {
  const [activeNav, setActiveNav] = useState('Tableau de bord');

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.acheteur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Tableau de bord Acheteur',
        subtitle: 'Pilotez vos achats : demandes, commandes et fournisseurs.',
        ctaLabel: 'GÉNÉRER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards sur une seule ligne */}
      <div className="dashboard-stats">
        <StatCard 
          title="Demandes en attente" 
          value={STATS_DATA.daEnAttente} 
          icon="assignment" 
          color="warning" 
        />
        <StatCard 
          title="Commandes actives" 
          value={STATS_DATA.commandesActives} 
          icon="shopping_cart" 
          color="primary" 
          trend={5} 
          subtitle="vs mois dernier"
        />
        <StatCard 
          title="Appels d'offres publiés" 
          value={STATS_DATA.aoPublies} 
          icon="request_quote" 
          color="info" 
        />
        <StatCard 
          title="Dépenses (mois)" 
          value={`${STATS_DATA.depenseMois}M MAD`} 
          icon="payments" 
          color="primary" 
          trend={8} 
          subtitle="vs mois dernier"
        />
      </div>

      {/* Ligne 2 : Graphique dépenses - Sans hover effect */}
      <ChartCard 
        title="Évolution des dépenses (6 mois)" 
        height={320}
        actions={
          <button className="export-btn" onClick={handleExport}>
            EXPORTER
          </button>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEPENSES_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="mois" stroke="#b3b3b3" />
            <YAxis stroke="#b3b3b3" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
              itemStyle={{ color: '#ffffff' }}
              formatter={(value) => [`${value}M MAD`, 'Dépenses']}
              cursor={false}
            />
            <Legend />
            <Bar 
              dataKey="montant" 
              fill="#4d8c4d" 
              name="Dépenses (M MAD)" 
              radius={[4, 4, 0, 0]} 
              activeBar={false}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ligne 3 : Top fournisseurs - sans bouton export (déjà dans Hero) */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Top fournisseurs</h3>
        </div>
        <DataTable
          columns={COLUMNS_FOURNISSEURS}
          data={TOP_FOURNISSEURS}
          keyField="id"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un fournisseur..."
          totalCount={TOP_FOURNISSEURS.length}
          pageSize={5}
        />
      </div>
    </PageLayout>
  );
}