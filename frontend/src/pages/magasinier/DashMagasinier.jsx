// src/pages/magasinier/DashMagasinier.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { STOCK_DATA } from '../../constants/stockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../styles/design-system.css';

// Données mockées pour les graphiques
const MOUVEMENTS_DATA = [
  { date: '01/05', entree: 45, sortie: 32 },
  { date: '02/05', entree: 38, sortie: 41 },
  { date: '03/05', entree: 52, sortie: 28 },
  { date: '04/05', entree: 41, sortie: 35 },
  { date: '05/05', entree: 35, sortie: 44 },
  { date: '06/05', entree: 48, sortie: 39 },
  { date: '07/05', entree: 55, sortie: 42 },
];

// Données mockées des alertes
const ALERTES_DATA = [
  { code: 'SAP-09211', designation: 'Courroie de transmission', qty: 2, seuil: 10, etat: 'Critique', priorite: 'Haute' },
  { code: 'SAP-11200', designation: 'Joint à lèvre Viton', qty: 0, seuil: 20, etat: 'Critique', priorite: 'Haute' },
  { code: 'SAP-88271', designation: 'Contacteur Schneider', qty: 12, seuil: 15, etat: 'Faible', priorite: 'Moyenne' },
  { code: 'SAP-28571', designation: 'Filtre à huile', qty: 24, seuil: 20, etat: 'Faible', priorite: 'Moyenne' },
  { code: 'SAP-55102', designation: 'Pompe centrifuge', qty: 3, seuil: 2, etat: 'Faible', priorite: 'Basse' },
];

const ALERTES_COLUMNS = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'qty', label: 'Stock actuel', type: 'qty', align: 'right', seuil: 'seuil' },
  { key: 'seuil', label: 'Seuil', type: 'text', align: 'right', muted: true },
  { key: 'etat', label: 'État', type: 'badge', align: 'center' },
  { key: 'priorite', label: 'Priorité', type: 'badge', align: 'center' },
];

// Transformation des données pour Recharts
const CHART_DATA = MOUVEMENTS_DATA.map(item => ({
  date: item.date,
  Entrées: item.entree,
  Sorties: item.sortie
}));

const handleExport = () => {
  console.log('Export rapport');
};

export default function DashMagasinier() {
  const [activeNav, setActiveNav] = useState('Tableau de bord');

  // Calcul des KPI
  const stockTotal = STOCK_DATA.reduce((acc, item) => acc + item.qty, 0);
  const articlesCritiques = STOCK_DATA.filter(item => item.qty === 0 || item.qty < item.seuil).length;
  const entreeMois = MOUVEMENTS_DATA.reduce((acc, item) => acc + item.entree, 0);
  const sortieMois = MOUVEMENTS_DATA.reduce((acc, item) => acc + item.sortie, 0);

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.magasinier}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Tableau de bord Magasinier',
        subtitle: "Pilotez votre inventaire en temps réel : indicateurs clés, alertes et tendances.",
        ctaLabel: 'GÉNÉRER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards KPI */}
      <div className="dashboard-stats">
        <StatCard 
          title="Stock total" 
          value={stockTotal} 
          icon="inventory" 
          color="primary" 
        />
        <StatCard 
          title="Valeur du stock" 
          value="12.5M MAD" 
          icon="payments" 
          color="info" 
          trend={8} 
          subtitle="vs mois dernier"
        />
        <StatCard 
          title="Articles critiques" 
          value={articlesCritiques} 
          icon="warning" 
          color="negative" 
        />
        <StatCard 
          title="Mouvements (30j)" 
          value={`${entreeMois} / ${sortieMois}`} 
          icon="swap_vert" 
          color="primary" 
          trend={12} 
          subtitle="entrées / sorties"
        />
      </div>

      {/* Ligne 2 : Graphique flux entrées/sorties avec Recharts */}
      <ChartCard 
        title="Flux entrées / sorties (7 derniers jours)" 
        height={320}
        actions={
          <button className="export-btn" onClick={handleExport}>
            EXPORTER
          </button>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#b3b3b3" />
            <YAxis stroke="#b3b3b3" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
              itemStyle={{ color: '#ffffff' }}
              cursor={false}
            />
            <Legend wrapperStyle={{ color: '#b3b3b3' }} />
            <Bar 
              dataKey="Entrées" 
              fill="#4d8c4d" 
              radius={[4, 4, 0, 0]} 
              activeBar={false}
              isAnimationActive={false}
            />
            <Bar 
              dataKey="Sorties" 
              fill="#8c5a4d" 
              radius={[4, 4, 0, 0]} 
              activeBar={false}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ligne 3 : Alertes stock - sans bouton export (déjà dans Hero) */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Alertes stock critique</h3>
        </div>
        <DataTable
          columns={ALERTES_COLUMNS}
          data={ALERTES_DATA}
          keyField="code"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher une alerte..."
          totalCount={ALERTES_DATA.length}
          pageSize={5}
        />
      </div>
    </PageLayout>
  );
}