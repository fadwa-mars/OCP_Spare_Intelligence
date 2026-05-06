// src/pages/pi/DashPi.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import '../../styles/design-system.css';

// Données mockées
const STATS_DATA = {
  tauxRotation: 4.2,
  valeurStockMort: 2.8,
  alertesActives: 7,
  rotationStock: 245
};

// Données pour graphique ABC
const ABC_DATA = [
  { name: 'A (20%)', value: 65, color: '#4d8c4d' },
  { name: 'B (30%)', value: 25, color: '#8c7a4d' },
  { name: 'C (50%)', value: 10, color: '#8c5a4d' },
];

// Données pour courbe de tendance
const TENDANCE_DATA = [
  { mois: 'Jan', consommation: 100 },
  { mois: 'Fév', consommation: 105 },
  { mois: 'Mar', consommation: 98 },
  { mois: 'Avr', consommation: 110 },
  { mois: 'Mai', consommation: 115 },
  { mois: 'Juin', consommation: 120 },
];

// Données pour classification XYZ
const CLASSIFICATION_XYZ = [
  { code: 'SAP-10492', designation: 'Roulement à billes SKF', classe: 'X', variabilite: 'Faible', stock: 145, recommandation: 'Stock sécurité réduit' },
  { code: 'SAP-28571', designation: 'Filtre à huile', classe: 'X', variabilite: 'Faible', stock: 24, recommandation: 'OK' },
  { code: 'SAP-09211', designation: 'Courroie transmission', classe: 'Y', variabilite: 'Moyenne', stock: 2, recommandation: 'Réapprovisionner' },
  { code: 'SAP-88271', designation: 'Contacteur Schneider', classe: 'Z', variabilite: 'Élevée', stock: 12, recommandation: 'Surveiller' },
  { code: 'SAP-11200', designation: 'Joint à lèvre Viton', classe: 'Z', variabilite: 'Élevée', stock: 0, recommandation: 'Urgent' },
];

const COLUMNS_XYZ = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'classe', label: 'Classe', type: 'badge', align: 'center' },
  { key: 'variabilite', label: 'Variabilité', type: 'badge', align: 'center' },
  { key: 'stock', label: 'Stock', type: 'text', align: 'right' },
  { key: 'recommandation', label: 'Recommandation', type: 'text', align: 'left', muted: true },
];

const getClasseBadgeClass = (classe) => {
  if (classe === 'X') return 'badge--optimal';
  if (classe === 'Y') return 'badge--warning';
  return 'badge--critical';
};

const getVariabiliteBadgeClass = (variabilite) => {
  if (variabilite === 'Faible') return 'badge--optimal';
  if (variabilite === 'Moyenne') return 'badge--warning';
  return 'badge--critical';
};

const handleExport = () => {
  console.log('Export rapport');
};

export default function DashPi() {
  const [activeNav, setActiveNav] = useState('Tableau de bord');

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.pi}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Tableau de bord Planificateur',
        subtitle: 'Analysez les performances stock, suivez les alertes et optimisez les niveaux.',
        ctaLabel: 'GÉNÉRER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards KPI */}
      <div className="dashboard-stats">
        <StatCard 
          title="Taux de rotation" 
          value={STATS_DATA.tauxRotation} 
          icon="autorenew" 
          color="primary" 
          trend={3} 
          subtitle="tours/an"
        />
        <StatCard 
          title="Valeur stock mort" 
          value={`${STATS_DATA.valeurStockMort}M MAD`} 
          icon="inventory_2" 
          color="negative" 
          trend={5} 
          subtitle="à écouler"
        />
        <StatCard 
          title="Alertes actives" 
          value={STATS_DATA.alertesActives} 
          icon="notifications_active" 
          color="warning" 
        />
        <StatCard 
          title="Rotation stock" 
          value={STATS_DATA.rotationStock} 
          icon="swap_vert" 
          color="info" 
          trend={8} 
          subtitle="mouvements"
        />
      </div>

      {/* Ligne 2 : Graphique ABC (PieChart) + Courbe tendance (LineChart) */}
      <div className="dashboard-charts-row">
        
        {/* Graphique ABC - Pie Chart */}
        <ChartCard title="Classification ABC" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ABC_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                activeIndex={-1}
              >
                {ABC_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Courbe de tendance - Line Chart */}
        <ChartCard title="Tendance consommation (6 mois)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TENDANCE_DATA}>
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
                dataKey="consommation" 
                stroke="#4d8c4d" 
                strokeWidth={2}
                dot={{ fill: '#4d8c4d', stroke: '#181818', strokeWidth: 2, r: 6 }}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 3 : Classification XYZ */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Classification XYZ (variabilité de la demande)</h3>
        </div>
        <DataTable
          columns={COLUMNS_XYZ.map(col => ({
            ...col,
            render: col.key === 'classe' ? (row) => (
              <span className={`badge ${getClasseBadgeClass(row.classe)}`}>{row.classe}</span>
            ) : col.key === 'variabilite' ? (row) => (
              <span className={`badge ${getVariabiliteBadgeClass(row.variabilite)}`}>{row.variabilite}</span>
            ) : undefined
          }))}
          data={CLASSIFICATION_XYZ}
          keyField="code"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un article..."
          totalCount={CLASSIFICATION_XYZ.length}
          pageSize={5}
        />
      </div>
    </PageLayout>
  );
}