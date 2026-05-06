// pages/magasinier/Reception.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import SelectableTable from '../../components/SelectableTable';
import { Field, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées
const COMMANDES_ATTENTE = [
  { id: 1, date: '15/05/2024', commande: 'CMD-2024-001', fournisseur: 'ABC Industries', articles: 'Pompes centrifuges', qty: 5, statut: 'En attente', bl: 'BL-2024-001' },
  { id: 2, date: '14/05/2024', commande: 'CMD-2024-002', fournisseur: 'SKF Maroc', articles: 'Roulements SKF', qty: 20, statut: 'En attente', bl: 'BL-2024-002' },
  { id: 3, date: '12/05/2024', commande: 'CMD-2024-004', fournisseur: 'Parker', articles: 'Filtres hydrauliques', qty: 50, statut: 'En attente', bl: 'BL-2024-004' },
  { id: 4, date: '10/05/2024', commande: 'CMD-2024-005', fournisseur: 'FlowTech', articles: 'Vannes à boisseau', qty: 10, statut: 'En attente', bl: 'BL-2024-005' },
];

const RECEPTIONS_HISTORIQUE = [
  { id: 101, date_reception: '10/05/2024', commande: 'CMD-2024-003', fournisseur: 'Siemens', articles: 'Moteurs électriques', qty_attendue: 3, qty_recue: 3, bl: 'BL-2024-003', statut: 'Validée' },
  { id: 102, date_reception: '08/05/2024', commande: 'CMD-2024-006', fournisseur: 'Optibelt', articles: 'Courroies transmission', qty_attendue: 30, qty_recue: 28, bl: 'BL-2024-006', statut: 'Partielle' },
];

const COLUMNS_ATTENTE = [
  { key: 'date', label: 'Date commande', align: 'left' },
  { key: 'commande', label: 'N° Commande', type: 'code', align: 'left' },
  { key: 'fournisseur', label: 'Fournisseur', align: 'left' },
  { key: 'articles', label: 'Articles', align: 'left' },
  { key: 'qty', label: 'Quantité', align: 'right' },
  { key: 'bl', label: 'N° BL', align: 'left' },
  { key: 'statut', label: 'Statut', align: 'center' },
];

const COLUMNS_HISTORIQUE = [
  { key: 'date_reception', label: 'Date réception', type: 'text', align: 'left' },
  { key: 'commande', label: 'N° Commande', type: 'code', align: 'left' },
  { key: 'fournisseur', label: 'Fournisseur', type: 'text', align: 'left' },
  { key: 'articles', label: 'Articles', type: 'text', align: 'left' },
  { key: 'qty_attendue', label: 'Qté attendue', type: 'text', align: 'right' },
  { key: 'qty_recue', label: 'Qté reçue', type: 'text', align: 'right' },
  { key: 'bl', label: 'N° BL', type: 'text', align: 'left', muted: true },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
];

const getBadgeClass = (statut) => {
  if (statut === 'Validée') return 'badge--optimal';
  if (statut === 'Partielle') return 'badge--warning';
  return 'badge--critical';
};

export default function Reception() {
  const [activeNav, setActiveNav] = useState('Réception');
  const [search, setSearch] = useState('');
  const [modalCommandes, setModalCommandes] = useState(false);
  const [modalValidation, setModalValidation] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentCommande, setCurrentCommande] = useState(null);
  const [formData, setFormData] = useState({ qty_recue: '', commentaire: '' });
  const [commandes, setCommandes] = useState(COMMANDES_ATTENTE);
  const [historique, setHistorique] = useState(RECEPTIONS_HISTORIQUE);

  const filteredCommandes = commandes.filter(item =>
    item.commande.toLowerCase().includes(search.toLowerCase()) ||
    item.fournisseur.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCommandes = commandes.filter(c => selectedIds.includes(c.id));

  const handleOpenCommandesModal = () => {
    setSelectedIds([]);
    setModalCommandes(true);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids) => {
    setSelectedIds(ids);
  };

  const handleValidateSelected = () => {
    if (selectedCommandes.length === 0) return;
    setModalCommandes(false);
    setCurrentCommande(selectedCommandes[0]);
    setFormData({ qty_recue: selectedCommandes[0].qty.toString(), commentaire: '' });
    setModalValidation(true);
  };

  const handleSaveValidation = () => {
    const newReception = {
      id: Date.now(),
      date_reception: new Date().toLocaleDateString('fr-FR'),
      commande: currentCommande.commande,
      fournisseur: currentCommande.fournisseur,
      articles: currentCommande.articles,
      qty_attendue: currentCommande.qty,
      qty_recue: parseInt(formData.qty_recue),
      bl: currentCommande.bl,
      statut: parseInt(formData.qty_recue) === currentCommande.qty ? 'Validée' : 'Partielle',
    };
    
    setHistorique(prev => [newReception, ...prev]);
    setCommandes(prev => prev.filter(c => c.id !== currentCommande.id));
    setModalValidation(false);
    setCurrentCommande(null);
    
    const remaining = selectedCommandes.filter(c => c.id !== currentCommande?.id);
    if (remaining.length > 0) {
      setSelectedIds(remaining.map(c => c.id));
      setCurrentCommande(remaining[0]);
      setFormData({ qty_recue: remaining[0].qty.toString(), commentaire: '' });
      setModalValidation(true);
    } else {
      setSelectedIds([]);
    }
  };

  const selectableColumns = COLUMNS_ATTENTE.map(col => {
    if (col.key === 'statut') {
      return {
        ...col,
        render: (row) => (
          <span className={`badge ${getBadgeClass(row.statut)}`}>
            {row.statut}
          </span>
        )
      };
    }
    return col;
  });

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.magasinier}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Réceptions de stock',
        subtitle: "Gérez les arrivages et validez les entrées en stock.",
        ctaLabel: 'VALIDER RÉCEPTION',
        ctaIcon: 'checklist',
        onCta: handleOpenCommandesModal,
      }}
    >
      {/* Commandes en attente */}
      <div className="reception-section">
        <h3 className="text-feature-heading reception-title">
          Commandes en attente de réception
        </h3>
        <DataTable
          columns={COLUMNS_ATTENTE.map(col => ({
            ...col,
            render: col.key === 'statut' ? (row) => (
              <span className={`badge ${getBadgeClass(row.statut)}`}>
                {row.statut}
              </span>
            ) : undefined
          }))}
          data={filteredCommandes}
          keyField="id"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par commande ou fournisseur..."
          totalCount={commandes.length}
          pageSize={10}
          onExport={() => console.log('Export Excel')}
        />
      </div>

      {/* Historique */}
      <div className="reception-section">
        <h3 className="text-feature-heading reception-title">
          Historique des réceptions
        </h3>
        <DataTable
          columns={COLUMNS_HISTORIQUE.map(col => ({
            ...col,
            render: col.key === 'statut' ? (row) => (
              <span className={`badge ${getBadgeClass(row.statut)}`}>
                {row.statut}
              </span>
            ) : undefined
          }))}
          data={historique}
          keyField="id"
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher..."
          totalCount={historique.length}
          pageSize={10}
        />
      </div>

      {/* MODAL 1 : Sélection des commandes */}
      <Modal
        isOpen={modalCommandes}
        onClose={() => setModalCommandes(false)}
        title="Sélectionner les commandes à réceptionner"
        size="xl"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalCommandes(false)} />
            <FormButton 
              label={`VALIDER (${selectedIds.length})`} 
              variant="primary" 
              onClick={handleValidateSelected}
              disabled={selectedIds.length === 0}
            />
          </>
        }
      >
        <SelectableTable
          columns={selectableColumns}
          data={commandes}
          keyField="id"
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      </Modal>

      {/* MODAL 2 : Validation réception - Structure simplifiée comme ListeStock */}
      <Modal
        isOpen={modalValidation}
        onClose={() => setModalValidation(false)}
        title={`Réception - ${currentCommande?.commande}`}
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalValidation(false)} />
            <FormButton label="VALIDER" variant="primary" onClick={handleSaveValidation} />
          </>
        }
      >
        {currentCommande && (
          <div>
            {/* Informations de la commande - grille comme ListeStock */}
            <div className="details-grid">
              <div className="details-card">
                <div className="details-label">Commande</div>
                <div className="details-value details-code">{currentCommande.commande}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Fournisseur</div>
                <div className="details-value">{currentCommande.fournisseur}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Articles</div>
                <div className="details-value">{currentCommande.articles}</div>
              </div>
              <div className="details-card">
                <div className="details-label">Quantité commandée</div>
                <div className="details-value details-quantity">{currentCommande.qty}</div>
              </div>
              <div className="details-card">
                <div className="details-label">N° Bon de livraison</div>
                <div className="details-value details-bl">{currentCommande.bl}</div>
              </div>
            </div>

            {/* Formulaire validation */}
            <div className="validation-form">
              <Field
                id="qty_recue"
                label="Quantité reçue"
                type="number"
                placeholder="0"
                value={formData.qty_recue}
                onChange={(e) => setFormData({...formData, qty_recue: e.target.value})}
              />
              
              <TextareaField
                id="commentaire"
                label="Commentaire (optionnel)"
                placeholder="Anomalies, écarts, etc."
                value={formData.commentaire}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                rows={2}
              />
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}