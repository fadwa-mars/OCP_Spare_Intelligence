// src/pages/acheteur/Fournisseurs.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées
const FOURNISSEURS_DATA = [
  { id: 1, nom: 'ABC Industries', contact: 'contact@abc-ind.com', telephone: '05 22 11 22 33', specialite: 'Mécanique', score: 98, statut: 'Actif' },
  { id: 2, nom: 'SKF Maroc', contact: 'maroc@skf.com', telephone: '05 22 44 55 66', specialite: 'Roulements', score: 95, statut: 'Actif' },
  { id: 3, nom: 'Siemens', contact: 'contact@siemens.ma', telephone: '05 22 77 88 99', specialite: 'Électrique', score: 92, statut: 'Actif' },
  { id: 4, nom: 'Parker', contact: 'parker@parkerma.com', telephone: '05 22 11 44 77', specialite: 'Hydraulique', score: 88, statut: 'Actif' },
  { id: 5, nom: 'FlowTech', contact: 'sales@flowtech.ma', telephone: '05 22 33 66 99', specialite: 'Tuyauterie', score: 85, statut: 'Inactif' },
];

const COLUMNS = [
  { key: 'nom', label: 'Nom', type: 'code', align: 'left' },
  { key: 'contact', label: 'Contact', type: 'text', align: 'left' },
  { key: 'telephone', label: 'Téléphone', type: 'text', align: 'left' },
  { key: 'specialite', label: 'Spécialité', type: 'text', align: 'left', muted: true },
  { key: 'score', label: 'Score', type: 'text', align: 'center' },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
];

const getStatutBadgeClass = (statut) => {
  return statut === 'Actif' ? 'badge--optimal' : 'badge--critical';
};

export default function Fournisseurs() {
  const [activeNav, setActiveNav] = useState('Fournisseurs');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', contact: '', telephone: '', specialite: '', score: '', statut: 'Actif'
  });

  const [fournisseurs, setFournisseurs] = useState(FOURNISSEURS_DATA);

  const filtered = fournisseurs.filter(item =>
    item.nom.toLowerCase().includes(search.toLowerCase()) ||
    item.contact.toLowerCase().includes(search.toLowerCase()) ||
    item.specialite.toLowerCase().includes(search.toLowerCase())
  );

  const generateId = () => {
    const maxId = Math.max(0, ...fournisseurs.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ nom: '', contact: '', telephone: '', specialite: '', score: '', statut: 'Actif' });
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingItem(row);
    setFormData({
      nom: row.nom, contact: row.contact, telephone: row.telephone,
      specialite: row.specialite, score: row.score.toString(), statut: row.statut
    });
    setModalOpen(true);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
    setConfirmOpen(true);
  };

  const handleSave = () => {
    if (!formData.nom.trim()) { alert("Le nom est requis"); return; }
    
    if (editingItem) {
      setFournisseurs(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...formData, score: parseInt(formData.score) } : item
      ));
    } else {
      setFournisseurs(prev => [...prev, {
        id: generateId(),
        ...formData,
        score: parseInt(formData.score)
      }]);
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setFournisseurs(prev => prev.filter(item => item.id !== itemToDelete.id));
    }
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.acheteur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Fournisseurs',
        subtitle: 'Gérez votre référentiel fournisseurs',
        ctaLabel: 'NOUVEAU FOURNISSEUR',
        ctaIcon: 'add',
        onCta: handleAdd,
      }}
    >
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'statut' ? (row) => (
            <span className={`badge ${getStatutBadgeClass(row.statut)}`}>{row.statut}</span>
          ) : undefined
        }))}
        data={filtered}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, contact ou spécialité..."
        totalCount={fournisseurs.length}
        pageSize={10}
        onExport={() => console.log('Export Excel')}
        onRowClick={handleEdit}
        onAction={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} />
            <FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="nom" label="Nom" placeholder="Nom du fournisseur" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          <FormRow>
            <Field id="contact" label="Email contact" placeholder="contact@fournisseur.com" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
            <Field id="telephone" label="Téléphone" placeholder="05 XX XX XX XX" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
          </FormRow>
          <FormRow>
            <Field id="specialite" label="Spécialité" placeholder="Mécanique, Électrique..." value={formData.specialite} onChange={(e) => setFormData({...formData, specialite: e.target.value})} />
            <Field id="score" label="Score (0-100)" type="number" placeholder="0" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} />
          </FormRow>
          <select
            className="field__input field__select"
            value={formData.statut}
            onChange={(e) => setFormData({...formData, statut: e.target.value})}
            style={{ padding: '12px var(--space-large)' }}
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Supprimer définitivement "${itemToDelete?.nom}" ?`}
        variant="danger"
        confirmText="SUPPRIMER"
        cancelText="ANNULER"
      />
    </PageLayout>
  );
}