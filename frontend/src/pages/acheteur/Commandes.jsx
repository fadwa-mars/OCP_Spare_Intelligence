// src/pages/acheteur/Commandes.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function Commandes() {
  const [activeNav, setActiveNav] = useState('Commandes');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', fournisseur: '', montant: '', date: '', status: 'pending'
  });

  const [columns, setColumns] = useState([
    { id: 'pending', title: 'En attente', color: '#6c757d', items: [
      { id: 1, title: 'CMD-2024-001', content: 'Pompes centrifuges', status: 'pending', metadata: { fournisseur: 'ABC Industries', date: '15/05', montant: '125K MAD' } },
      { id: 2, title: 'CMD-2024-002', content: 'Roulements SKF', status: 'pending', metadata: { fournisseur: 'SKF Maroc', date: '18/05', montant: '45K MAD' } }
    ] },
    { id: 'confirmed', title: 'Confirmée', color: '#0d6efd', items: [
      { id: 3, title: 'CMD-2024-003', content: 'Moteurs électriques', status: 'confirmed', metadata: { fournisseur: 'Siemens', date: '10/05', montant: '320K MAD' } }
    ] },
    { id: 'preparing', title: 'En préparation', color: '#fd7e14', items: [
      { id: 4, title: 'CMD-2024-004', content: 'Filtres hydrauliques', status: 'preparing', metadata: { fournisseur: 'Parker', date: '12/05', montant: '28K MAD' } }
    ] },
    { id: 'shipped', title: 'Expédiée', color: '#ffc107', items: [
      { id: 5, title: 'CMD-2024-005', content: 'Vannes à boisseau', status: 'shipped', metadata: { fournisseur: 'FlowTech', date: '05/05', montant: '67K MAD' } }
    ] },
    { id: 'delivered', title: 'Livrée', color: '#198754', items: [
      { id: 6, title: 'CMD-2024-006', content: 'Courroies transmission', status: 'delivered', metadata: { fournisseur: 'Optibelt', date: '01/05', montant: '12K MAD' } }
    ] },
    { id: 'cancelled', title: 'Annulée', color: '#dc3545', items: [] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'pending') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', fournisseur: '', montant: '', date: '', status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title, content: item.content,
      fournisseur: item.metadata?.fournisseur || '', montant: item.metadata?.montant || '',
      date: item.metadata?.date || '', status: item.status || 'pending'
    });
    setModalOpen(true);
  };

  const handleViewDetails = (item) => { setViewingItem(item); setReadModalOpen(true); };
  const handleDelete = (item) => { setItemToDelete(item); setConfirmOpen(true); };

  const handleSave = () => {
    if (!formData.title.trim()) { alert("La référence est requise"); return; }
    const newItem = {
      id: editingItem ? editingItem.id : generateId(),
      title: formData.title, content: formData.content, status: formData.status, metadata: {}
    };
    if (formData.fournisseur) newItem.metadata.fournisseur = formData.fournisseur;
    if (formData.montant) newItem.metadata.montant = formData.montant;
    if (formData.date) newItem.metadata.date = formData.date;

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
    console.log(`Commande ${itemId} déplacée de ${sourceCol} vers ${targetCol}`);
  };

  return (
    <PageLayout navLinks={NAV_LINKS_BY_ROLE.acheteur} activeNav={activeNav} onNavChange={setActiveNav} hero={{
      title: 'Commandes', subtitle: 'Suivez le cycle de vie de vos commandes en mode Kanban',
      ctaLabel: 'NOUVELLE COMMANDE', ctaIcon: 'add', onCta: () => handleAdd(),
    }}>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} onEditItem={handleEdit} onDeleteItem={handleDelete} onViewDetails={handleViewDetails} showAddButton={true} onAddItem={handleAdd} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier la commande" : "Nouvelle commande"} size="md" actions={
        <><FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} /><FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} /></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="title" label="Référence commande" placeholder="CMD-2024-XXX" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextareaField id="content" label="Description" placeholder="Détail de la commande..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={3} />
          <FormRow>
            <Field id="fournisseur" label="Fournisseur" placeholder="Nom du fournisseur" value={formData.fournisseur} onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} />
            <Field id="montant" label="Montant (MAD)" type="number" placeholder="0" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
          </FormRow>
          <FormRow>
            <Field id="date" label="Date livraison" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <SelectField id="status" label="Statut" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
              { value: 'pending', label: 'En attente' }, { value: 'confirmed', label: 'Confirmée' },
              { value: 'preparing', label: 'En préparation' }, { value: 'shipped', label: 'Expédiée' },
              { value: 'delivered', label: 'Livrée' }, { value: 'cancelled', label: 'Annulée' }
            ]} />
          </FormRow>
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