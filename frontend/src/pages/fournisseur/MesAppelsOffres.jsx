// src/pages/fournisseur/MesAppelsOffres.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Field, TextareaField, FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées
const AO_DATA = [
  { id: 1, reference: 'AO-2024-001', titre: 'Pompes centrifuges', description: 'Fourniture de pompes centrifuges industrielles', date_publication: '01/05/2024', date_limite: '20/06/2024', statut: 'Nouveau', budget: '250K MAD' },
  { id: 2, reference: 'AO-2024-002', titre: 'Roulements SKF', description: 'Roulements à billes SKF série 6200', date_publication: '05/05/2024', date_limite: '25/06/2024', statut: 'En cours', budget: '120K MAD' },
  { id: 3, reference: 'AO-2024-003', titre: 'Moteurs électriques', description: 'Moteurs asynchrones 5.5kW', date_publication: '10/05/2024', date_limite: '30/06/2024', statut: 'Nouveau', budget: '320K MAD' },
  { id: 4, reference: 'AO-2024-004', titre: 'Filtres hydrauliques', description: 'Filtres à huile haute pression', date_publication: '12/05/2024', date_limite: '05/07/2024', statut: 'En cours', budget: '85K MAD' },
  { id: 5, reference: 'AO-2024-005', titre: 'Vannes à boisseau', description: 'Vannes à boisseau sphérique 2 pouces', date_publication: '15/05/2024', date_limite: '10/07/2024', statut: 'Nouveau', budget: '105K MAD' },
  { id: 6, reference: 'AO-2024-006', titre: 'Courroies transmission', description: 'Courroies industrielles optibelt', date_publication: '18/05/2024', date_limite: '15/07/2024', statut: 'Clôturé', budget: '45K MAD' },
  { id: 7, reference: 'AO-2024-007', titre: 'Contacteurs électriques', description: 'Contacteurs Schneider LC1D', date_publication: '20/05/2024', date_limite: '18/07/2024', statut: 'Nouveau', budget: '28K MAD' },
];

const COLUMNS = [
  { key: 'reference', label: 'Référence', type: 'code', align: 'left' },
  { key: 'titre', label: 'Titre', type: 'text', align: 'left' },
  { key: 'date_limite', label: 'Date limite', type: 'text', align: 'left' },
  { key: 'budget', label: 'Budget estimé', type: 'text', align: 'right' },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
];

const getStatutBadgeClass = (statut) => {
  if (statut === 'Nouveau') return 'badge--optimal';
  if (statut === 'En cours') return 'badge--warning';
  return 'badge--critical';
};

export default function MesAppelsOffres() {
  const [activeNav, setActiveNav] = useState("Mes appels d'offres");
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [repondreModalOpen, setRepondreModalOpen] = useState(false);
  const [selectedAO, setSelectedAO] = useState(null);
  const [formData, setFormData] = useState({
    montant: '',
    delais: '',
    commentaire: ''
  });

  const STATUTS = ['Tous', 'Nouveau', 'En cours', 'Clôturé'];

  const filteredAO = AO_DATA.filter(ao => {
    let match = true;
    if (filterStatut !== 'Tous' && ao.statut !== filterStatut) match = false;
    if (search && !ao.reference.toLowerCase().includes(search.toLowerCase()) && !ao.titre.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });

  const handleRowClick = (row) => {
    setSelectedAO(row);
    setViewModalOpen(true);
  };

  const handleOpenRepondre = () => {
    setViewModalOpen(false);
    setFormData({ montant: '', delais: '', commentaire: '' });
    setRepondreModalOpen(true);
  };

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
        title: "Mes appels d'offres",
        subtitle: 'Consultez les appels d\'offres auxquels vous pouvez participer',
        ctaLabel: 'FILTRER',
        ctaIcon: 'filter_alt',
        onCta: () => {},
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

      {/* Tableau des AO - la recherche est intégrée dans DataTable */}
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'statut' ? (row) => (
            <span className={`badge ${getStatutBadgeClass(row.statut)}`}>{row.statut}</span>
          ) : undefined
        }))}
        data={filteredAO}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence ou titre..."
        totalCount={filteredAO.length}
        pageSize={10}
        onExport={() => console.log('Export AO')}
        onRowClick={handleRowClick}
      />

      {/* Modal Détails */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Détails - ${selectedAO?.reference}`}
        size="md"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-small)', justifyContent: 'flex-end', width: '100%' }}>
            {selectedAO?.statut !== 'Clôturé' && (
              <FormButton label="RÉPONDRE" variant="primary" onClick={handleOpenRepondre} />
            )}
            <FormButton label="FERMER" variant="secondary" onClick={() => setViewModalOpen(false)} />
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
              <div className="read-modal__label">Description</div>
              <div className="read-modal__value">{selectedAO.description}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date de publication</div>
              <div className="read-modal__value">{selectedAO.date_publication}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Date limite</div>
              <div className="read-modal__value">{selectedAO.date_limite}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Budget estimé</div>
              <div className="read-modal__value">{selectedAO.budget}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Statut</div>
              <div className="read-modal__value">
                <span className={`badge ${getStatutBadgeClass(selectedAO.statut)}`}>{selectedAO.statut}</span>
              </div>
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
          <>
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
                <div className="read-modal__label">Budget estimé</div>
                <div className="read-modal__value">{selectedAO.budget}</div>
              </div>
            </div>

            <div className="form-divider" />

            <div className="read-modal__content">
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
                  placeholder="30 jours, 2 semaines, etc."
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
                  rows={4}
                />
              </div>
            </div>
          </>
        )}
      </Modal>
    </PageLayout>
  );
}