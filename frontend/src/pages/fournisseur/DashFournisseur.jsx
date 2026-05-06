// src/pages/fournisseur/DashFournisseur.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import '../../styles/design-system.css';

// Données mockées
const STATS_DATA = {
  offresEnCours: 3,
  commandesRecues: 8,
  tauxAcceptation: 68,
  scoreFournisseur: 92
};

// Données pour graphique répartition des offres
const OFFRES_REPARTITION = [
  { name: 'Acceptées', value: 68, color: '#4d8c4d' },
  { name: 'En cours', value: 22, color: '#8c7a4d' },
  { name: 'Rejetées', value: 10, color: '#8c5a4d' },
];

// Données pour graphique évolution des commandes
const COMMANDES_EVOLUTION = [
  { mois: 'Jan', commandes: 2 },
  { mois: 'Fév', commandes: 3 },
  { mois: 'Mar', commandes: 4 },
  { mois: 'Avr', commandes: 5 },
  { mois: 'Mai', commandes: 6 },
  { mois: 'Juin', commandes: 8 },
];

// Données pour les appels d'offres actifs
const AO_ACTIFS = [
  { id: 1, reference: 'AO-2024-001', titre: 'Pompes centrifuges', date_limite: '20/06/2024', statut: 'Publié', priorite: 'Haute' },
  { id: 2, reference: 'AO-2024-002', titre: 'Roulements SKF', date_limite: '25/06/2024', statut: 'Publié', priorite: 'Moyenne' },
  { id: 3, reference: 'AO-2024-003', titre: 'Moteurs électriques', date_limite: '30/06/2024', statut: 'Publié', priorite: 'Haute' },
  { id: 4, reference: 'AO-2024-004', titre: 'Filtres hydrauliques', date_limite: '05/07/2024', statut: 'Publié', priorite: 'Basse' },
  { id: 5, reference: 'AO-2024-005', titre: 'Vannes à boisseau', date_limite: '10/07/2024', statut: 'Publié', priorite: 'Moyenne' },
];

const COLUMNS_AO = [
  { key: 'reference', label: 'Référence', type: 'code', align: 'left' },
  { key: 'titre', label: 'Titre', type: 'text', align: 'left' },
  { key: 'date_limite', label: 'Date limite', type: 'text', align: 'left' },
  { key: 'priorite', label: 'Priorité', type: 'badge', align: 'center' },
  // Plus de colonne actions
];

const getPrioriteBadgeClass = (priorite) => {
  if (priorite === 'Haute') return 'badge--critical';
  if (priorite === 'Moyenne') return 'badge--warning';
  return 'badge--optimal';
};

const handleExport = () => {
  console.log('Export rapport fournisseur');
};

export default function DashFournisseur() {
  const [activeNav, setActiveNav] = useState('Tableau de bord');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [repondreModalOpen, setRepondreModalOpen] = useState(false);
  const [selectedAO, setSelectedAO] = useState(null);
  const [formData, setFormData] = useState({
    montant: '',
    delais: '',
    commentaire: ''
  });

  // Clic sur la ligne pour voir les détails
  const handleRowClick = (row) => {
    setSelectedAO(row);
    setDetailModalOpen(true);
  };

  // Ouvrir modal de réponse
  const handleOpenRepondre = () => {
    setDetailModalOpen(false);
    setFormData({ montant: '', delais: '', commentaire: '' });
    setRepondreModalOpen(true);
  };

  // Soumettre l'offre
  const handleSubmitOffre = () => {
    if (!formData.montant) { alert("Le montant est requis"); return; }
    if (!formData.delais) { alert("Le délai est requis"); return; }
    
    console.log('Offre soumise:', { ao: selectedAO, ...formData });
    alert(`Offre soumise avec succès pour ${selectedAO.reference} - ${selectedAO.titre}`);
    setRepondreModalOpen(false);
    setSelectedAO(null);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.fournisseur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Tableau de bord Fournisseur',
        subtitle: 'Suivez vos performances, offres et commandes en cours',
        ctaLabel: 'GÉNÉRER RAPPORT',
        ctaIcon: 'description',
        onCta: handleExport,
      }}
    >
      {/* Ligne 1 : 4 StatCards KPI */}
      <div className="dashboard-stats">
        <StatCard 
          title="Offres en cours" 
          value={STATS_DATA.offresEnCours} 
          icon="pending" 
          color="warning" 
        />
        <StatCard 
          title="Commandes reçues" 
          value={STATS_DATA.commandesRecues} 
          icon="shopping_cart" 
          color="info" 
          trend={15} 
          subtitle="vs mois dernier"
        />
        <StatCard 
          title="Taux acceptation" 
          value={`${STATS_DATA.tauxAcceptation}%`} 
          icon="trending_up" 
          color="primary" 
          trend={5} 
          subtitle="vs mois dernier"
        />
        <StatCard 
          title="Score fournisseur" 
          value={STATS_DATA.scoreFournisseur} 
          icon="star" 
          color="primary" 
          trend={3} 
          subtitle="sur 100"
        />
      </div>

      {/* Ligne 2 : Graphiques côte à côte */}
      <div className="dashboard-charts-row">
        
        {/* Graphique répartition des offres - Pie Chart */}
        <ChartCard title="Répartition des offres" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={OFFRES_REPARTITION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                activeIndex={-1}
              >
                {OFFRES_REPARTITION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
                formatter={(value) => [`${value}%`, 'Pourcentage']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graphique évolution des commandes - Bar Chart */}
        <ChartCard title="Évolution des commandes (6 mois)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMMANDES_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mois" stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #4d4d4d', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                cursor={false}
                formatter={(value) => [`${value} commandes`, 'Commandes']}
              />
              <Legend />
              <Bar 
                dataKey="commandes" 
                fill="#4d8c4d" 
                name="Commandes reçues" 
                radius={[4, 4, 0, 0]} 
                activeBar={false}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ligne 3 : Appels d'offres actifs - clic sur ligne pour détails */}
      <div className="dashboard-alerts">
        <div className="dashboard-section-header">
          <h3>Appels d'offres actifs</h3>
        </div>
        <DataTable
          columns={COLUMNS_AO.map(col => ({
            ...col,
            render: col.key === 'priorite' ? (row) => (
              <span className={`badge ${getPrioriteBadgeClass(row.priorite)}`}>{row.priorite}</span>
            ) : undefined
          }))}
          data={AO_ACTIFS}
          keyField="id"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un appel d'offres..."
          totalCount={AO_ACTIFS.length}
          pageSize={5}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Modal Détails AO avec bouton Répondre */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Détails - ${selectedAO?.reference}`}
        size="md"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-small)', justifyContent: 'flex-end', width: '100%' }}>
            <FormButton label="RÉPONDRE" variant="primary" onClick={handleOpenRepondre} />
            <FormButton label="FERMER" variant="secondary" onClick={() => setDetailModalOpen(false)} />
          </div>
        }
      >
        {selectedAO && (
          <div className="read-modal__content">
            <div className="read-modal__field">
              <div className="read-modal__label">Référence</div>
              <div className="read-modal__value">{selectedAO.reference}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Titre</div>
              <div className="read-modal__value">{selectedAO.titre}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date limite</div>
              <div className="read-modal__value">{selectedAO.date_limite}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Priorité</div>
              <div className="read-modal__value">
                <span className={`badge ${getPrioriteBadgeClass(selectedAO.priorite)}`}>{selectedAO.priorite}</span>
              </div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Statut</div>
              <div className="read-modal__value">{selectedAO.statut}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Répondre */}
      <Modal
        isOpen={repondreModalOpen}
        onClose={() => setRepondreModalOpen(false)}
        title="Répondre à l'appel d'offres"
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setRepondreModalOpen(false)} />
            <FormButton label="SOUMETTRE" variant="primary" onClick={handleSubmitOffre} />
          </>
        }
      >
        {selectedAO && (
          <div className="read-modal__content">
            <div className="read-modal__field">
              <div className="read-modal__label">Appel d'offres</div>
              <div className="read-modal__value">{selectedAO.reference} - {selectedAO.titre}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date limite</div>
              <div className="read-modal__value read-modal__value--warning">{selectedAO.date_limite}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Montant proposé (MAD)</div>
              <input
                className="field__input"
                type="number"
                placeholder="0"
                value={formData.montant}
                onChange={(e) => setFormData({...formData, montant: e.target.value})}
              />
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Délai de livraison</div>
              <input
                className="field__input"
                type="text"
                placeholder="30 jours"
                value={formData.delais}
                onChange={(e) => setFormData({...formData, delais: e.target.value})}
              />
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Commentaire (optionnel)</div>
              <textarea
                className="field__input field__textarea"
                placeholder="Informations complémentaires..."
                value={formData.commentaire}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}