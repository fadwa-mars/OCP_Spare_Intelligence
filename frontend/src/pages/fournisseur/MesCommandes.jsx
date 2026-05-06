// src/pages/fournisseur/MesCommandes.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées des commandes reçues
const COMMANDES_DATA = [
  { id: 1, date: '01/06/2024', reference: 'CMD-2024-006', offre: 'AO-2024-006 - Courroies transmission', quantite: 30, montant: '12K MAD', statut: 'En cours', date_livraison: '10/06/2024', bl: 'BL-2024-006' },
  { id: 2, date: '15/05/2024', reference: 'CMD-2024-003', offre: 'AO-2024-003 - Moteurs électriques', quantite: 3, montant: '320K MAD', statut: 'Livrée', date_livraison: '05/06/2024', bl: 'BL-2024-003' },
  { id: 3, date: '10/05/2024', reference: 'CMD-2024-001', offre: 'AO-2024-001 - Pompes centrifuges', quantite: 5, montant: '250K MAD', statut: 'En préparation', date_livraison: '20/06/2024', bl: 'BL-2024-001' },
  { id: 4, date: '05/05/2024', reference: 'CMD-2024-002', offre: 'AO-2024-002 - Roulements SKF', quantite: 20, montant: '45K MAD', statut: 'Expédiée', date_livraison: '15/06/2024', bl: 'BL-2024-002' },
  { id: 5, date: '20/04/2024', reference: 'CMD-2024-004', offre: 'AO-2024-004 - Filtres hydrauliques', quantite: 50, montant: '28K MAD', statut: 'Livrée', date_livraison: '10/05/2024', bl: 'BL-2024-004' },
];

const COLUMNS = [
  { key: 'reference', label: 'N° Commande', type: 'code', align: 'left' },
  { key: 'offre', label: 'Offre associée', type: 'text', align: 'left' },
  { key: 'date', label: 'Date commande', type: 'text', align: 'left' },
  { key: 'quantite', label: 'Quantité', type: 'text', align: 'right' },
  { key: 'montant', label: 'Montant', type: 'text', align: 'right' },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
  { key: 'date_livraison', label: 'Livraison prévue', type: 'text', align: 'left', muted: true },
];

const getStatutBadgeClass = (statut) => {
  if (statut === 'Livrée') return 'badge--optimal';
  if (statut === 'Expédiée') return 'badge--info';
  if (statut === 'En préparation') return 'badge--warning';
  return 'badge--critical';
};

export default function MesCommandes() {
  const [activeNav, setActiveNav] = useState('Mes commandes');
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);

  const STATUTS = ['Tous', 'En cours', 'En préparation', 'Expédiée', 'Livrée'];

  const filteredCommandes = COMMANDES_DATA.filter(cmd => {
    let match = true;
    if (filterStatut !== 'Tous' && cmd.statut !== filterStatut) match = false;
    if (search && !cmd.reference.toLowerCase().includes(search.toLowerCase()) && !cmd.offre.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });

  const handleRowClick = (row) => {
    setSelectedCommande(row);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    console.log('Export commandes');
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.fournisseur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Mes commandes',
        subtitle: "Suivez l'état de vos commandes en cours",
        ctaLabel: 'EXPORTER',
        ctaIcon: 'download',
        onCta: handleExport,
      }}
    >
      {/* Filtre statut uniquement - la recherche est dans DataTable */}
      <div className="table-toolbar">
        <select
          className="export-btn"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          style={{ width: '150px' }}
        >
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tableau des commandes - la recherche est intégrée dans DataTable */}
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'statut' ? (row) => (
            <span className={`badge ${getStatutBadgeClass(row.statut)}`}>{row.statut}</span>
          ) : undefined
        }))}
        data={filteredCommandes}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par commande ou offre..."
        totalCount={filteredCommandes.length}
        pageSize={10}
        onExport={handleExport}
        onRowClick={handleRowClick}
      />

      {/* Modal Détails commande */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Détails commande - ${selectedCommande?.reference}`}
        size="md"
        actions={
          <FormButton label="FERMER" variant="secondary" onClick={() => setDetailModalOpen(false)} />
        }
      >
        {selectedCommande && (
          <div className="read-modal__content">
            <div className="read-modal__field">
              <div className="read-modal__label">N° Commande</div>
              <div className="read-modal__value">{selectedCommande.reference}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Offre associée</div>
              <div className="read-modal__value">{selectedCommande.offre}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date commande</div>
              <div className="read-modal__value">{selectedCommande.date}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Quantité</div>
              <div className="read-modal__value">{selectedCommande.quantite}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Montant</div>
              <div className="read-modal__value">{selectedCommande.montant}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Statut</div>
              <div className="read-modal__value">
                <span className={`badge ${getStatutBadgeClass(selectedCommande.statut)}`}>{selectedCommande.statut}</span>
              </div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date livraison prévue</div>
              <div className="read-modal__value">{selectedCommande.date_livraison}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">N° Bon de livraison</div>
              <div className="read-modal__value">{selectedCommande.bl}</div>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}