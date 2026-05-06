// src/pages/pi/SeuilsMinMax.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Field, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées
const SEUILS_DATA = [
  { id: 1, code: 'SAP-10492', designation: 'Roulement à billes SKF', min: 50, max: 200, actuel: 145, recommandation: 'Optimal' },
  { id: 2, code: 'SAP-09211', designation: 'Courroie transmission', min: 10, max: 50, actuel: 2, recommandation: 'Urgent réappro' },
  { id: 3, code: 'SAP-28571', designation: 'Filtre à huile', min: 20, max: 100, actuel: 24, recommandation: 'OK' },
  { id: 4, code: 'SAP-88271', designation: 'Contacteur Schneider', min: 15, max: 60, actuel: 12, recommandation: 'Sous seuil' },
];

const COLUMNS = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'min', label: 'Min', type: 'text', align: 'right' },
  { key: 'max', label: 'Max', type: 'text', align: 'right' },
  { key: 'actuel', label: 'Stock actuel', type: 'qty', align: 'right', seuil: 'min' },
  { key: 'recommandation', label: 'Recommandation', type: 'badge', align: 'center' },
  // Plus de colonne 'actions'
];

const getRecommandationClass = (recommandation) => {
  if (recommandation === 'Optimal') return 'badge--optimal';
  if (recommandation === 'Sous seuil') return 'badge--warning';
  if (recommandation === 'Urgent réappro') return 'badge--critical';
  return 'badge--optimal';
};

export default function SeuilsMinMax() {
  const [activeNav, setActiveNav] = useState('Seuils Min/Max');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ min: '', max: '' });
  const [seuils, setSeuils] = useState(SEUILS_DATA);

  const filtered = seuils.filter(item =>
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.designation.toLowerCase().includes(search.toLowerCase())
  );

  // Clic sur la ligne entière
  const handleRowClick = (row) => {
    setEditingItem(row);
    setFormData({ min: row.min.toString(), max: row.max.toString() });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      const newMin = parseInt(formData.min);
      const newMax = parseInt(formData.max);
      
      setSeuils(prev => prev.map(item => 
        item.id === editingItem.id ? { 
          ...item, 
          min: newMin, 
          max: newMax,
          recommandation: newMin > item.actuel ? 'Sous seuil' : 
                         newMax < item.actuel ? 'Dépassement' : 'Optimal'
        } : item
      ));
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.pi}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Seuils Min/Max',
        subtitle: "Définissez les niveaux de stock minimum et maximum par article",
        ctaLabel: 'EXPORTER',
        ctaIcon: 'download',
        onCta: () => console.log('Export seuils'),
      }}
    >
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'recommandation' ? (row) => (
            <span className={`badge ${getRecommandationClass(row.recommandation)}`}>{row.recommandation}</span>
          ) : undefined
        }))}
        data={filtered}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par Code SAP ou Désignation..."
        totalCount={seuils.length}
        pageSize={10}
        onExport={() => console.log('Export Excel')}
        onRowClick={handleRowClick}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Modifier les seuils - ${editingItem?.code}`}
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} />
            <FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} />
          </>
        }
      >
        {editingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
            <div className="field">
              <div className="field__label">Code SAP</div>
              <div className="field__input" style={{ background: 'transparent', boxShadow: 'none', paddingLeft: 0 }}>
                {editingItem.code}
              </div>
            </div>
            <div className="field">
              <div className="field__label">Désignation</div>
              <div className="field__input" style={{ background: 'transparent', boxShadow: 'none', paddingLeft: 0 }}>
                {editingItem.designation}
              </div>
            </div>
            <div className="field">
              <div className="field__label">Stock actuel</div>
              <div className="field__input" style={{ background: 'transparent', boxShadow: 'none', paddingLeft: 0, color: 'var(--color-accent-green)' }}>
                {editingItem.actuel}
              </div>
            </div>
            <FormRow>
              <Field id="min" label="Seuil minimum" type="number" placeholder="0" value={formData.min} onChange={(e) => setFormData({...formData, min: e.target.value})} />
              <Field id="max" label="Seuil maximum" type="number" placeholder="0" value={formData.max} onChange={(e) => setFormData({...formData, max: e.target.value})} />
            </FormRow>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}