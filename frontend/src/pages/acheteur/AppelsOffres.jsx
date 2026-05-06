// src/pages/acheteur/AppelsOffres.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function AppelsOffres() {
  const [activeNav, setActiveNav] = useState("Appels d'offres");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', budget: '', deadline: '', status: 'draft'
  });

  const [columns, setColumns] = useState([
    { id: 'draft', title: 'Brouillon', color: '#6c757d', items: [
      { id: 1, title: 'AO-2024-001', content: 'Pompes centrifuges', status: 'draft', metadata: { budget: '250K MAD' } }
    ] },
    { id: 'published', title: 'Publié', color: '#0d6efd', items: [
      { id: 2, title: 'AO-2024-002', content: 'Roulements SKF', status: 'published', metadata: { deadline: '15/06' } }
    ] },
    { id: 'submissions', title: 'Soumissions reçues', color: '#fd7e14', items: [
      { id: 3, title: 'AO-2024-003', content: 'Moteurs électriques', status: 'submissions', metadata: { offres: '3' } }
    ] },
    { id: 'analysis', title: 'Analyse', color: '#ffc107', items: [] },
    { id: 'awarded', title: 'Attribué', color: '#198754', items: [] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'draft') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', budget: '', deadline: '', status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title, content: item.content,
      budget: item.metadata?.budget || '', deadline: item.metadata?.deadline || '',
      status: item.status || 'draft'
    });
    setModalOpen(true);
  };

  const handleViewDetails = (item) => { setViewingItem(item); setReadModalOpen(true); };
  const handleDelete = (item) => { setItemToDelete(item); setConfirmOpen(true); };

  const handleSave = () => {
    if (!formData.title.trim()) { alert("Le titre est requis"); return; }
    const newItem = {
      id: editingItem ? editingItem.id : generateId(),
      title: formData.title, content: formData.content, status: formData.status, metadata: {}
    };
    if (formData.budget) newItem.metadata.budget = formData.budget;
    if (formData.deadline) newItem.metadata.deadline = formData.deadline;

    if (editingItem) {
      setColumns(prev => prev.map(col => ({ ...col, items: col.items.map(item => item.id === editingItem.id ? newItem : item) })));
    } else {
      setColumns(prev => prev.map(col => col.id === formData.status ? { ...col, items: [...col.items, newItem] } : col));
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setColumns(prev => prev.map(col => ({ ...col, items: col.items.filter(i => i.id !== itemToDelete.id) })));
    }
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDragEnd = (itemId, sourceCol, targetCol) => {
    console.log(`AO ${itemId} déplacé de ${sourceCol} vers ${targetCol}`);
  };

  return (
    <PageLayout navLinks={NAV_LINKS_BY_ROLE.acheteur} activeNav={activeNav} onNavChange={setActiveNav} hero={{
      title: "Appels d'offres", subtitle: 'Gérez le cycle de vie de vos appels d’offres en mode Kanban',
      ctaLabel: "NOUVEL APPEL D'OFFRES", ctaIcon: 'add', onCta: () => handleAdd(),
    }}>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} onEditItem={handleEdit} onDeleteItem={handleDelete} onViewDetails={handleViewDetails} showAddButton={true} onAddItem={handleAdd} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier l'appel d'offres" : "Nouvel appel d'offres"} size="md" actions={
        <><FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} /><FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} /></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="title" label="Titre / Référence" placeholder="AO-2024-XXX" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextareaField id="content" label="Description" placeholder="Détail de l'appel d'offres..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={3} />
          <FormRow>
            <Field id="budget" label="Budget (MAD)" type="number" placeholder="0" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
            <Field id="deadline" label="Date limite" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
          </FormRow>
          <SelectField id="status" label="Statut" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
            { value: 'draft', label: 'Brouillon' }, { value: 'published', label: 'Publié' },
            { value: 'submissions', label: 'Soumissions reçues' }, { value: 'analysis', label: 'Analyse' },
            { value: 'awarded', label: 'Attribué' }
          ]} />
        </div>
      </Modal>

      <Modal isOpen={readModalOpen} onClose={() => setReadModalOpen(false)} title={`Détails - ${viewingItem?.title}`} size="md" actions={<FormButton label="FERMER" variant="secondary" onClick={() => setReadModalOpen(false)} />}>
        {viewingItem && (
          <div className="read-modal__content">
            <div className="read-modal__field"><div className="read-modal__label">Description</div><div className="read-modal__value">{viewingItem.content}</div></div>
            {viewingItem.metadata && Object.entries(viewingItem.metadata).map(([key, val]) => (
              <div key={key} className="read-modal__field"><div className="read-modal__label">{key}</div><div className="read-modal__value">{val}</div></div>
            ))}
            <div className="read-modal__field"><div className="read-modal__label">Statut</div><div className="read-modal__value">{columns.find(c => c.id === viewingItem.status)?.title}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Confirmer la suppression" message={`Supprimer définitivement "${itemToDelete?.title}" ?`} variant="danger" confirmText="SUPPRIMER" cancelText="ANNULER" />
    </PageLayout>
  );
}