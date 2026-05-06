// pages/magasinier/Mouvement.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Field, SelectField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées des mouvements
const MOUVEMENTS_DATA = [
  { id: 1, date: '15/05/2024', type: 'ENTRÉE', code: 'SAP-10492', designation: 'Roulement à billes SKF', qty: 50, motif: 'Réception commande CMD-001', user: 'Karim M.' },
  { id: 2, date: '14/05/2024', type: 'SORTIE', code: 'SAP-09211', designation: 'Courroie de transmission', qty: 3, motif: 'Maintenance atelier', user: 'Ahmed T.' },
  { id: 3, date: '14/05/2024', type: 'ENTRÉE', code: 'SAP-28571', designation: 'Filtre à huile', qty: 20, motif: 'Réapprovisionnement', user: 'Karim M.' },
  { id: 4, date: '13/05/2024', type: 'SORTIE', code: 'SAP-44820', designation: 'Capteur de pression', qty: 2, motif: 'Production', user: 'Ahmed T.' },
  { id: 5, date: '12/05/2024', type: 'ENTRÉE', code: 'SAP-66512', designation: 'Moteur asynchrone', qty: 1, motif: 'Commande urgente', user: 'Karim M.' },
  { id: 6, date: '11/05/2024', type: 'SORTIE', code: 'SAP-55102', designation: 'Pompe centrifuge', qty: 1, motif: 'Remplacement', user: 'Ahmed T.' },
  { id: 7, date: '10/05/2024', type: 'ENTRÉE', code: 'SAP-33904', designation: 'Vanne à boisseau', qty: 10, motif: 'Stock de sécurité', user: 'Karim M.' },
];

const COLUMNS = [
  { key: 'date', label: 'Date', type: 'text', align: 'left' },
  { key: 'type', label: 'Type', type: 'badge', align: 'center' },
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'qty', label: 'Quantité', type: 'text', align: 'right' },
  { key: 'motif', label: 'Motif', type: 'text', align: 'left', muted: true },
  { key: 'user', label: 'Utilisateur', type: 'text', align: 'left', muted: true },
];

const getBadgeClass = (type) => {
  return type === 'ENTRÉE' ? 'badge--optimal' : 'badge--critical';
};

const getBadgeText = (type) => {
  return type === 'ENTRÉE' ? 'ENTRÉE' : 'SORTIE';
};

export default function Mouvement() {
  const [activeNav, setActiveNav] = useState('Mouvement');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'ENTRÉE',
    code: '',
    qty: '',
    motif: ''
  });

  const filtered = MOUVEMENTS_DATA.filter(item =>
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.designation.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    console.log('Nouveau mouvement:', formData);
    setModalOpen(false);
    setFormData({ type: 'ENTRÉE', code: '', qty: '', motif: '' });
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.magasinier}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Mouvements de stock',
        subtitle: "Suivez l'historique complet des entrées et sorties.",
        ctaLabel: 'NOUVEAU MOUVEMENT',
        ctaIcon: 'add',
        onCta: () => setModalOpen(true),
      }}
    >
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'type' ? (row) => (
            <span className={`badge ${getBadgeClass(row.type)}`}>
              {getBadgeText(row.type)}
            </span>
          ) : undefined
        }))}
        data={filtered}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par Code SAP ou Désignation..."
        totalCount={MOUVEMENTS_DATA.length}
        pageSize={10}
        onExport={() => console.log('Export Excel')}
      />

      {/* Modal nouveau mouvement */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau mouvement de stock"
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} />
            <FormButton label="VALIDER" variant="primary" onClick={handleSave} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <SelectField
            id="type"
            label="Type de mouvement"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            options={[
              { value: 'ENTRÉE', label: 'ENTRÉE' },
              { value: 'SORTIE', label: 'SORTIE' },
            ]}
          />
          <Field
            id="code"
            label="Code SAP"
            placeholder="SAP-XXXXX"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
          />
          <FormRow>
            <Field
              id="qty"
              label="Quantité"
              type="number"
              placeholder="0"
              value={formData.qty}
              onChange={(e) => setFormData({...formData, qty: e.target.value})}
            />
          </FormRow>
          <Field
            id="motif"
            label="Motif / Référence"
            placeholder="Réception commande, Maintenance, etc."
            value={formData.motif}
            onChange={(e) => setFormData({...formData, motif: e.target.value})}
          />
        </div>
      </Modal>
    </PageLayout>
  );
}