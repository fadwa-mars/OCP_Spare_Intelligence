// src/pages/admin/DashAdmin.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import '../../styles/design-system.css';

// Données mockées
const STATS_DATA = {
  totalUtilisateurs: 156,
  utilisateursActifs: 142,
  connexionsJour: 23,
  erreursSysteme: 3
};

// Données pour graphique activité par rôle
const ACTIVITE_PAR_ROLE = [
  { name: 'Magasinier', valeur: 8, color: '#4d8c4d' },
  { name: 'Acheteur', valeur: 6, color: '#8c7a4d' },
  { name: 'PI', valeur: 4, color: '#8c5a4d' },
  { name: 'Admin', valeur: 2, color: '#5a6e8c' },
  { name: 'Fournisseur', valeur: 5, color: '#6e5a8c' },
];

// Données pour graphique logins (12 derniers mois)
const LOGINS_DATA = [
  { mois: 'Jan', connexions: 145 },
  { mois: 'Fév', connexions: 168 },
  { mois: 'Mar', connexions: 156 },
  { mois: 'Avr', connexions: 182 },
  { mois: 'Mai', connexions: 198 },
  { mois: 'Juin', connexions: 210 },
  { mois: 'Juil', connexions: 225 },
  { mois: 'Aoû', connexions: 218 },
  { mois: 'Sep', connexions: 235 },
  { mois: 'Oct', connexions: 250 },
  { mois: 'Nov', connexions: 268 },
  { mois: 'Déc', connexions: 285 },
];

// Données pour connexions récentes
const CONNEXIONS_RECENTES = [
  { id: 1, user: 'Karim Mansouri', email: 'karim@ocp.ma', role: 'Magasinier', date: '15/05/2024 08:30', ip: '192.168.1.45' },
  { id: 2, user: 'Amina Benali', email: 'amina@ocp.ma', role: 'Acheteur', date: '15/05/2024 09:15', ip: '192.168.1.23' },
  { id: 3, user: 'Youssef El Fassi', email: 'youssef@ocp.ma', role: 'PI', date: '15/05/2024 09:45', ip: '192.168.1.67' },
  { id: 4, user: 'Sara Admin', email: 'sara@ocp.ma', role: 'Admin', date: '15/05/2024 10:00', ip: '192.168.1.89' },
  { id: 5, user: 'Ali Fournisseur', email: 'ali@fournisseur.ma', role: 'Fournisseur', date: '15/05/2024 10:30', ip: '192.168.1.12' },
];

// Données pour erreurs système
const ERREURS_SYSTEME = [
  { id: 1, type: 'API Timeout', message: 'Timeout sur endpoint /api/stock', date: '15/05/2024 08:30', niveau: 'Erreur' },
  { id: 2, type: 'Auth Failed', message: 'Tentative de connexion échouée x3', date: '15/05/2024 09:15', niveau: 'Warning' },
  { id: 3, type: 'DB Connection', message: 'Lenteur sur base de données', date: '15/05/2024 10:00', niveau: 'Info' },
];

const COLUMNS_CONNEXIONS = [
  { key: 'user', label: 'Utilisateur', type: 'text', align: 'left' },
  { key: 'email', label: 'Email', type: 'text', align: 'left' },
  { key: 'role', label: 'Rôle', type: 'badge', align: 'center' },
  { key: 'date', label: 'Date / Heure', type: 'text', align: 'left' },
  { key: 'ip', label: 'Adresse IP', type: 'text', align: 'left', muted: true },
];

const COLUMNS_ERREURS = [
  { key: 'type', label: 'Type', type: 'badge', align: 'left' },
  { key: 'message', label: 'Message', type: 'text', align: 'left' },
  { key: 'date', label: 'Date', type: 'text', align: 'left' },
  { key: 'niveau', label: 'Niveau', type: 'badge', align: 'center' },
];

const getRoleBadgeClass = (role) => {
  if (role === 'Admin') return 'badge--optimal';
  if (role === 'Acheteur') return 'badge--warning';
  return 'badge--critical';
};

const getErreurBadgeClass = (type) => {
  if (type === 'API Timeout') return 'badge--critical';
  if (type === 'Auth Failed') return 'badge--warning';
  return 'badge--info';
};

const getNiveauBadgeClass = (niveau) => {
  if (niveau === 'Erreur') return 'badge--critical';
  if (niveau === 'Warning') return 'badge--warning';
  return 'badge--info';
};

const handleExport = () => {
  console.log('Export rapport admin');
};

export default function DashAdmin() {
  const [activeNav, setActiveNav] = useState('Tableau de bord');

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.admin}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Tableau de bord Admin',
        subtitle: 'Supervisez l\'activité système, les utilisateurs et les performances.',
        ctaLabel: 'GÉNÉRER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards KPI */}
      <div className="dashboard-stats">
        <StatCard 
          title="Utilisateurs" 
          value={STATS_DATA.totalUtilisateurs} 
          icon="people" 
          color="primary" 
          trend={5} 
          subtitle="total"
        />
        <StatCard 
          title="Utilisateurs actifs" 
          value={STATS_DATA.utilisateursActifs} 
          icon="person_check" 
          color="primary" 
          trend={3} 
          subtitle="ce mois"
        />
        <StatCard 
          title="Connexions (24h)" 
          value={STATS_DATA.connexionsJour} 
          icon="login" 
          color="info" 
          trend={12} 
          subtitle="vs hier"
        />
        <StatCard 
          title="Erreurs système" 
          value={STATS_DATA.erreursSysteme} 
          icon="error" 
          color="negative" 
          trend={-2} 
          subtitle="vs hier"
        />
      </div>

      {/* Ligne 2 : Graphiques côte à côte */}
      <div className='dashboard-charts-row'>
        
        {/* Graphique activité par rôle - Pie Chart */}
        <ChartCard title="Activité par rôle (connexions/jour)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ACTIVITE_PAR_ROLE}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="valeur"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                activeIndex={-1}
              >
                {ACTIVITE_PAR_ROLE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
                formatter={(value) => [`${value} connexions`, 'Activité']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graphique logins - Line Chart */}
        <ChartCard title="Évolution des connexions (12 mois)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LOGINS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mois" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
                formatter={(value) => [`${value} connexions`, 'Connexions']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="connexions" 
                stroke="#4d8c4d" 
                strokeWidth={2}
                dot={{ fill: '#4d8c4d', stroke: '#181818', strokeWidth: 2, r: 4 }}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 3 : Connexions récentes */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Connexions récentes</h3>
        </div>
        <DataTable
          columns={COLUMNS_CONNEXIONS.map(col => ({
            ...col,
            render: col.key === 'role' ? (row) => (
              <span className={`badge ${getRoleBadgeClass(row.role)}`}>{row.role}</span>
            ) : undefined
          }))}
          data={CONNEXIONS_RECENTES}
          keyField="id"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un utilisateur..."
          totalCount={CONNEXIONS_RECENTES.length}
          pageSize={5}
        />
      </div>

      {/* Ligne 4 : Erreurs système */}
      <div className="dashboard-alerts" style={{ marginTop: 'var(--space-xlarge)' }}>
        <div className="dashboard-section-header">
          <h3>Erreurs système (dernières 24h)</h3>
        </div>
        <DataTable
          columns={COLUMNS_ERREURS.map(col => ({
            ...col,
            render: col.key === 'type' ? (row) => (
              <span className={`badge ${getErreurBadgeClass(row.type)}`}>{row.type}</span>
            ) : col.key === 'niveau' ? (row) => (
              <span className={`badge ${getNiveauBadgeClass(row.niveau)}`}>{row.niveau}</span>
            ) : undefined
          }))}
          data={ERREURS_SYSTEME}
          keyField="id"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher une erreur..."
          totalCount={ERREURS_SYSTEME.length}
          pageSize={5}
        />
      </div>
    </PageLayout>
  );
}