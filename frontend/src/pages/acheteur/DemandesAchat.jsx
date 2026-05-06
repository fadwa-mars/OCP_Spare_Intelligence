// src/pages/acheteur/DemandesAchat.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function DemandesAchat() {
  const [activeNav, setActiveNav] = useState('Demandes achat');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', service: '', priorite: '', date: '', status: 'new'
  });

  const [columns, setColumns] = useState([
    { id: 'new', title: 'Nouvelle', color: '#6c757d', items: [
      { id: 1, title: 'DA-2024-001', content: 'Pompes centrifuges - 5 unités', status: 'new', metadata: { service: 'Maintenance', priorite: 'Haute', date: '14/05' } },
      { id: 2, title: 'DA-2024-002', content: 'Roulements SKF 6205 - 20 unités', status: 'new', metadata: { service: 'Production', priorite: 'Moyenne', date: '15/05' } }
    ] },
    { id: 'validated', title: 'Validée', color: '#0d6efd', items: [
      { id: 3, title: 'DA-2024-003', content: 'Moteurs électriques 5.5kW - 3 unités', status: 'validated', metadata: { service: 'Électrique', priorite: 'Haute', date: '10/05' } }
    ] },
    { id: 'tender', title: 'En appel d\'offres', color: '#fd7e14', items: [
      { id: 4, title: 'DA-2024-004', content: 'Filtres hydrauliques - 50 unités', status: 'tender', metadata: { service: 'Hydraulique', offres: '3', date: '12/05' } }
    ] },
    { id: 'ordered', title: 'Commande passée', color: '#ffc107', items: [
      { id: 5, title: 'DA-2024-005', content: 'Vannes à boisseau - 10 unités', status: 'ordered', metadata: { service: 'Tuyauterie', fournisseur: 'FlowTech', date: '05/05' } }
    ] },
    { id: 'delivered', title: 'Livrée', color: '#198754', items: [
      { id: 6, title: 'DA-2024-006', content: 'Courroies transmission - 30 unités', status: 'delivered', metadata: { service: 'Mécanique', date: '01/05', bl: 'BL-2024-089' } }
    ] },
    { id: 'rejected', title: 'Rejetée', color: '#dc3545', items: [
      { id: 7, title: 'DA-2024-007', content: 'Outillage spécifique - 2 unités', status: 'rejected', metadata: { service: 'Atelier', motif: 'Budget non disponible', date: '08/05' } }
    ] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'new') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', service: '', priorite: '', date: '', status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      service: item.metadata?.service || '',
      priorite: item.metadata?.priorite || '',
      date: item.metadata?.date || '',
      status: item.status || 'new'
    });
    setModalOpen(true);
  };

  const handleViewDetails = (item) => {
    setViewingItem(item);
    setReadModalOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) { alert("La référence est requise"); return; }
    
    const newItem = {
      id: editingItem ? editingItem.id : generateId(),
      title: formData.title,
      content: formData.content,
      status: formData.status,
      metadata: {}
    };
    if (formData.service) newItem.metadata.service = formData.service;
    if (formData.priorite) newItem.metadata.priorite = formData.priorite;
    if (formData.date) newItem.metadata.date = formData.date;

    if (editingItem) {
      setColumns(prev => prev.map(col => ({
        ...col,
        items: col.items.map(item => item.id === editingItem.id ? newItem : item)
      })));
    } else {
      setColumns(prev => prev.map(col => 
        col.id === formData.status ? { ...col, items: [...col.items, newItem] } : col
      ));
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setColumns(prev => prev.map(col => ({
        ...col,
        items: col.items.filter(i => i.id !== itemToDelete.id)
      })));
    }
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDragEnd = (itemId, sourceCol, targetCol) => {
    console.log(`Demande ${itemId} déplacée de ${sourceCol} vers ${targetCol}`);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.acheteur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: "Demandes d'achat",
        subtitle: 'Suivez le cycle de vie des demandes d\'achat en mode Kanban',
        ctaLabel: 'NOUVELLE DEMANDE',
        ctaIcon: 'add',
        onCta: () => handleAdd(),
      }}
    >
      <KanbanBoard 
        columns={columns} 
        onDragEnd={handleDragEnd}
        onEditItem={handleEdit}
        onDeleteItem={handleDelete}
        onViewDetails={handleViewDetails}
        showAddButton={true}
        onAddItem={handleAdd}
      />

      {/* Modal d'édition */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier la demande" : "Nouvelle demande d'achat"} size="md" actions={
        <><FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} /><FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} /></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="title" label="Référence" placeholder="DA-2024-XXX" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextareaField id="content" label="Description" placeholder="Détail de la demande..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={3} />
          <FormRow>
            <Field id="service" label="Service demandeur" placeholder="Maintenance, Production..." value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
            <SelectField id="priorite" label="Priorité" value={formData.priorite} onChange={(e) => setFormData({...formData, priorite: e.target.value})} options={[
              { value: 'Basse', label: 'Basse' }, { value: 'Moyenne', label: 'Moyenne' },
              { value: 'Haute', label: 'Haute' }, { value: 'Urgente', label: 'Urgente' }
            ]} />
          </FormRow>
          <FormRow>
            <Field id="date" label="Date souhaitée" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <SelectField id="status" label="Statut" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
              { value: 'new', label: 'Nouvelle' }, { value: 'validated', label: 'Validée' },
              { value: 'tender', label: 'En appel d\'offres' }, { value: 'ordered', label: 'Commande passée' },
              { value: 'delivered', label: 'Livrée' }, { value: 'rejected', label: 'Rejetée' }
            ]} />
          </FormRow>
        </div>
      </Modal>

      {/* Modal de visualisation */}
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