// src/pages/pi/SeuilsMinMax.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Field, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import { motion } from 'framer-motion';

// Données mockées avec valeurs IA
const SEUILS_DATA = [
  { id: 1, code: 'SAP-10492', designation: 'Roulement SKF', min: 50, max: 200, actuel: 145, recommandation: 'Optimal', aiMin: 65, aiMax: 220, cmj: 4.5, leadTime: 14, sigma: 1.2 },
  { id: 2, code: 'SAP-09211', designation: 'Courroie', min: 10, max: 50, actuel: 2, recommandation: 'Urgent', aiMin: 15, aiMax: 60, cmj: 1.1, leadTime: 7, sigma: 0.5 },
  { id: 3, code: 'SAP-28571', designation: 'Filtre hydraulique', min: 20, max: 100, actuel: 24, recommandation: 'OK', aiMin: 20, aiMax: 100, cmj: 2.0, leadTime: 10, sigma: 0.8 },
  { id: 4, code: 'SAP-88271', designation: 'Contacteur', min: 15, max: 60, actuel: 12, recommandation: 'Sous seuil', aiMin: 25, aiMax: 80, cmj: 3.5, leadTime: 21, sigma: 2.1 },
];

const COLUMNS = [
  { key: 'code', label: 'Code SAP', type: 'code', align: 'left' },
  { key: 'designation', label: 'Désignation', type: 'text', align: 'left' },
  { key: 'min', label: 'Min Actuel', type: 'text', align: 'right' },
  { key: 'aiMin', label: 'Min IA (Z=1.65)', type: 'text', align: 'right' },
  { key: 'max', label: 'Max Actuel', type: 'text', align: 'right' },
  { key: 'aiMax', label: 'Max IA', type: 'text', align: 'right' },
  { key: 'actuel', label: 'Stock', type: 'qty', align: 'right' },
];

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

  const handleRowClick = (row) => {
    setEditingItem(row);
    setFormData({ min: row.min.toString(), max: row.max.toString() });
    setModalOpen(true);
  };

  const handleApplyAI = () => {
    setFormData({ min: editingItem.aiMin.toString(), max: editingItem.aiMax.toString() });
  };

  const handleSave = () => {
    if (editingItem) {
      const newMin = parseInt(formData.min);
      const newMax = parseInt(formData.max);
      
      setSeuils(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, min: newMin, max: newMax } : item
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
        title: 'Optimisation des Seuils (IA)',
        subtitle: "Calcul intelligent basé sur la formule : CMJ × L + Zα × σ × √L",
        ctaLabel: 'APPLIQUER TOUT',
        ctaIcon: 'auto_awesome',
        onCta: () => console.log('Appliquer IA partout'),
      }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable
          columns={COLUMNS.map(col => ({
            ...col,
            render: col.key === 'aiMin' || col.key === 'aiMax' ? (row) => (
              <span style={{ color: 'var(--color-accent-green)', fontWeight: 'bold' }}>{row[col.key]}</span>
            ) : undefined
          }))}
          data={filtered}
          keyField="id"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher article..."
          totalCount={seuils.length}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </motion.div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Optimisation IA - ${editingItem?.code}`}
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
            <div className="glass-card" style={{ padding: 'var(--space-medium)', marginBottom: 'var(--space-medium)', borderLeft: '4px solid var(--color-accent-green)' }}>
              <h6 style={{ color: 'var(--color-accent-green)', marginBottom: 'var(--space-small)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '16px' }}>
                <span className="material-symbols-outlined">smart_toy</span> Détails Algorithme
              </h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-small)', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                <div>CMJ: {editingItem.cmj}</div>
                <div>Lead Time (L): {editingItem.leadTime} j</div>
                <div>Sigma (σ): {editingItem.sigma}</div>
                <div>Confiance (Z): 1.65 (95%)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-small)' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Ajustement manuel</span>
              <button className="fc-btn fc-btn--secondary" onClick={handleApplyAI} style={{ padding: '8px 12px', fontSize: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>auto_fix_high</span> Appliquer recommandation IA
              </button>
            </div>

            <FormRow>
              <Field id="min" label="Seuil minimum (Alerte)" type="number" value={formData.min} onChange={(e) => setFormData({...formData, min: e.target.value})} />
              <Field id="max" label="Seuil maximum (Surstock)" type="number" value={formData.max} onChange={(e) => setFormData({...formData, max: e.target.value})} />
            </FormRow>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
