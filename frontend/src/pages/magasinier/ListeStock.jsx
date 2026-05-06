// src/pages/magasinier/ListeStock.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { STOCK_DATA } from '../../constants/stockData';
import '../../styles/design-system.css';

const COLUMNS = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'categorie', label: 'Catégorie', type: 'text', align: 'left', muted: true },
  { key: 'emplacement', label: 'Emplacement', type: 'text', align: 'left', muted: true },
  { key: 'qty', label: 'Quantité Actuelle', type: 'qty', align: 'right', seuil: 'seuil' },
  { key: 'seuil', label: 'Seuil Sécurité', type: 'text', align: 'right', muted: true },
  { key: 'etat', label: 'État', type: 'badge', align: 'center' },
];

// Données mockées d'historique des mouvements par article
const getHistoriqueMouvements = (code) => {
  const historique = {
    'SAP-10492': [
      { date: '15/05/2024', type: 'ENTREE', qty: 50, motif: 'Reception commande CMD-001', user: 'Karim M.' },
      { date: '10/05/2024', type: 'SORTIE', qty: 5, motif: 'Maintenance atelier', user: 'Ahmed T.' },
    ],
    'SAP-09211': [
      { date: '14/05/2024', type: 'SORTIE', qty: 3, motif: 'Maintenance atelier', user: 'Ahmed T.' },
    ],
    'SAP-28571': [
      { date: '14/05/2024', type: 'ENTREE', qty: 20, motif: 'Reapprovisionnement', user: 'Karim M.' },
    ],
  };
  return historique[code] || [];
};

const getBadgeClass = (type) => {
  return type === 'ENTREE' ? 'badge--optimal' : 'badge--critical';
};

const getStockBadgeClass = (article) => {
  if (article.qty === 0) return 'badge--critical';
  if (article.qty < article.seuil) return 'badge--warning';
  return 'badge--optimal';
};

const getStockBadgeText = (article) => {
  if (article.qty === 0) return 'RUPTURE';
  if (article.qty < article.seuil) return 'FAIBLE';
  return 'OPTIMAL';
};

export default function ListeStock() {
  const [activeNav, setActiveNav] = useState('Stock');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = STOCK_DATA.filter((r) =>
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.designation.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (row) => {
    setSelectedArticle(row);
    setModalOpen(true);
  };

  const historiqueMouvements = selectedArticle ? getHistoriqueMouvements(selectedArticle.code) : [];

  const mouvementColumns = [
    { key: 'date', label: 'Date', align: 'left' },
    { key: 'type', label: 'Type', align: 'center' },
    { key: 'qty', label: 'Quantite', align: 'right' },
    { key: 'motif', label: 'Motif', align: 'left' },
    { key: 'user', label: 'Utilisateur', align: 'left' },
  ];

  const mouvementData = historiqueMouvements.map(mov => ({
    date: mov.date,
    type: <span className={`badge ${getBadgeClass(mov.type)}`}>{mov.type}</span>,
    qty: <span className={mov.type === 'ENTREE' ? 'details-movement-in' : 'details-movement-out'}>
      {mov.type === 'ENTREE' ? `+${mov.qty}` : `-${mov.qty}`}
    </span>,
    motif: mov.motif,
    user: mov.user,
  }));

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.magasinier}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Liste de stock',
        subtitle: "Consultez l'etat actuel de votre inventaire en temps reel.",
        ctaLabel: 'EXPORTER STOCK',
        ctaIcon: 'download',
        onCta: () => console.log('Export stock Excel'),
      }}
    >
      <DataTable
        columns={COLUMNS}
        data={filtered}
        keyField="code"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par Code SAP ou Designation..."
        totalCount={STOCK_DATA.length}
        pageSize={10}
        onExport={() => console.log('Export Excel')}
        onRowClick={handleRowClick}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${selectedArticle?.code} - ${selectedArticle?.designation}`}
        size="xl"
        actions={
          <FormButton label="FERMER" variant="secondary" onClick={() => setModalOpen(false)} />
        }
      >
        {selectedArticle && (
          <div>
            {/* Informations generales */}
            <div className="details-grid">
              <div className="details-card">
                <div className="details-label">Code SAP</div>
                <div className="details-value details-code">{selectedArticle.code}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Designation</div>
                <div className="details-value">{selectedArticle.designation}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Categorie</div>
                <div className="details-value">{selectedArticle.categorie}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Emplacement</div>
                <div className="details-value">{selectedArticle.emplacement}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Quantite actuelle</div>
                <div className="details-value details-quantity">{selectedArticle.qty}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Seuil securite</div>
                <div className="details-value">{selectedArticle.seuil}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Etat</div>
                <div className="details-value">
                  <span className={`badge ${getStockBadgeClass(selectedArticle)}`}>
                    {getStockBadgeText(selectedArticle)}
                  </span>
                </div>
              </div>
            </div>

            {/* Historique des mouvements avec DataTable */}
            <div className="details-historique">
              <h4 className="details-historique-title">Historique des mouvements</h4>
              <DataTable
                columns={mouvementColumns}
                data={mouvementData}
                keyField="date"
                searchValue=""
                onSearchChange={() => {}}
                searchPlaceholder=""
                totalCount={mouvementData.length}
                pageSize={5}
              />
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}