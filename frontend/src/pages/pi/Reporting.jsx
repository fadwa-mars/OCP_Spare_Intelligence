// src/pages/pi/Reporting.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import ChartCard from '../../components/ChartCard';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import '../../styles/design-system.css';

// Données mockées
const CONSO_MENSUELLE = [
  { mois: 'Jan', conso: 1450 },
  { mois: 'Fév', conso: 1380 },
  { mois: 'Mar', conso: 1520 },
  { mois: 'Avr', conso: 1480 },
  { mois: 'Mai', conso: 1620 },
  { mois: 'Juin', conso: 1580 },
  { mois: 'Juil', conso: 1700 },
  { mois: 'Aoû', conso: 1650 },
  { mois: 'Sep', conso: 1550 },
  { mois: 'Oct', conso: 1600 },
  { mois: 'Nov', conso: 1500 },
  { mois: 'Déc', conso: 1450 },
];

const TENDANCE_6MOIS = [
  { mois: 'Jan', valeur: 100 },
  { mois: 'Fév', valeur: 105 },
  { mois: 'Mar', valeur: 98 },
  { mois: 'Avr', valeur: 110 },
  { mois: 'Mai', valeur: 115 },
  { mois: 'Juin', valeur: 120 },
];

const TOP_ARTICLES = [
  { code: 'SAP-10492', designation: 'Roulement à billes SKF', conso: 245, valeur: '367K MAD', rotation: 'Rapide' },
  { code: 'SAP-28571', designation: 'Filtre à huile', conso: 180, valeur: '90K MAD', rotation: 'Moyenne' },
  { code: 'SAP-09211', designation: 'Courroie transmission', conso: 95, valeur: '47K MAD', rotation: 'Lente' },
  { code: 'SAP-88271', designation: 'Contacteur Schneider', conso: 78, valeur: '25K MAD', rotation: 'Moyenne' },
  { code: 'SAP-11200', designation: 'Joint à lèvre Viton', conso: 65, valeur: '12K MAD', rotation: 'Rapide' },
  { code: 'SAP-44820', designation: 'Capteur de pression', conso: 52, valeur: '156K MAD', rotation: 'Lente' },
  { code: 'SAP-55102', designation: 'Pompe centrifuge', conso: 48, valeur: '720K MAD', rotation: 'Rapide' },
  { code: 'SAP-33904', designation: 'Vanne à boisseau', conso: 42, valeur: '84K MAD', rotation: 'Moyenne' },
  { code: 'SAP-66512', designation: 'Moteur asynchrone', conso: 35, valeur: '525K MAD', rotation: 'Lente' },
  { code: 'SAP-44109', designation: 'Graisse industrielle', conso: 28, valeur: '14K MAD', rotation: 'Rapide' },
];

const COLUMNS_TOP = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'conso', label: 'Consommation', type: 'text', align: 'right' },
  { key: 'valeur', label: 'Valeur', type: 'text', align: 'right' },
  { key: 'rotation', label: 'Rotation', type: 'badge', align: 'center' },
];

const getRotationClass = (rotation) => {
  if (rotation === 'Rapide') return 'badge--optimal';
  if (rotation === 'Lente') return 'badge--critical';
  return 'badge--warning';
};

export default function Reporting() {
  const [activeNav, setActiveNav] = useState('Reporting');
  const [period, setPeriod] = useState('6');

  const filteredData = CONSO_MENSUELLE.slice(-parseInt(period));

  const handleExport = () => {
    console.log('Export rapport');
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.pi}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Reporting',
        subtitle: 'Analysez les performances et générez des rapports',
        ctaLabel: 'EXPORTER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards sur une ligne */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard title="Consommation mensuelle" value="1 580" icon="trending_up" color="primary" trend={5} subtitle="vs mois dernier" />
        <StatCard title="Rotation moyenne" value="4.2" icon="autorenew" color="info" trend={2} subtitle="tours/an" />
        <StatCard title="Valeur stock" value="12.5M MAD" icon="payments" color="primary" trend={-3} subtitle="vs mois dernier" />
        <StatCard title="Couverture stock" value="45" icon="shield" color="primary" trend={-2} subtitle="jours" />
      </div>

      {/* Ligne 2 : Graphiques côte à côte */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-large)', marginBottom: 'var(--space-xlarge)' }}>
        
        {/* Graphique Barres - Sans hover */}
        <ChartCard 
          title={`Consommation mensuelle (${period} mois)`} 
          height={320}
          actions={
            <select 
              className="export-btn" 
              style={{ padding: '4px 12px', fontSize: '12px' }} 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="6">6 mois</option>
              <option value="12">12 mois</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mois" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value) => [`${value} unités`, 'Consommation']}
                cursor={false}
              />
              <Legend />
              <Bar 
                dataKey="conso" 
                fill="#4d8c4d" 
                name="Consommation" 
                radius={[4, 4, 0, 0]} 
                activeBar={false}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graphique Courbe - Sans hover */}
        <ChartCard title="Tendance consommation (6 mois)" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TENDANCE_6MOIS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mois" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="valeur" 
                stroke="#4d8c4d" 
                strokeWidth={2}
                name="Consommation"
                dot={{ fill: '#4d8c4d', stroke: '#181818', strokeWidth: 2, r: 6 }}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 3 : Top 10 articles */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Top 10 articles consommés</h3>
        </div>
        <DataTable
          columns={COLUMNS_TOP.map(col => ({
            ...col,
            render: col.key === 'rotation' ? (row) => (
              <span className={`badge ${getRotationClass(row.rotation)}`}>{row.rotation}</span>
            ) : undefined
          }))}
          data={TOP_ARTICLES}
          keyField="code"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un article..."
          totalCount={TOP_ARTICLES.length}
          pageSize={10}
        />
      </div>
    </PageLayout>
  );
}