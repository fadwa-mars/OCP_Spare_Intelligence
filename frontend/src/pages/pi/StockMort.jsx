// src/pages/pi/StockMort.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function StockMort() {
  const [activeNav, setActiveNav] = useState('Stock mort');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', qty: '', valeur: '', decision: '', status: 'identified'
  });

  const [columns, setColumns] = useState([
    { id: 'identified', title: 'Identifié', color: '#6c757d', items: [
      { id: 1, title: 'SAP-09211', content: 'Courroie de transmission optibelt', status: 'identified', metadata: { qty: '2', valeur: '1 250 MAD', derniere_entree: '15/02/2023', rotation: '0' } },
      { id: 2, title: 'SAP-11200', content: 'Joint à lèvre Viton 50x72x10', status: 'identified', metadata: { qty: '0', valeur: '0 MAD', derniere_entree: '03/01/2023', rotation: '0' } }
    ] },
    { id: 'analysis', title: 'À analyser', color: '#fd7e14', items: [
      { id: 3, title: 'SAP-44820', content: 'Capteur de pression Siemens', status: 'analysis', metadata: { qty: '18', valeur: '45 000 MAD', rotation: 'Lente' } }
    ] },
    { id: 'sell', title: 'À écouler', color: '#ffc107', items: [
      { id: 4, title: 'SAP-28571', content: 'Filtre à huile Caterpillar', status: 'sell', metadata: { qty: '24', valeur: '12 000 MAD', remise: '-30%' } }
    ] },
    { id: 'scrap', title: 'À réformer', color: '#dc3545', items: [
      { id: 5, title: 'SAP-33904', content: 'Vanne à boisseau', status: 'scrap', metadata: { qty: '42', valeur: '84 000 MAD', recyclable: 'Oui' } }
    ] },
    { id: 'approved', title: 'Validé', color: '#198754', items: [
      { id: 6, title: 'SAP-55102', content: 'Pompe centrifuge KSB', status: 'approved', metadata: { qty: '3', valeur: '67 500 MAD', decision: 'Écouler', date: '01/05/2024' } }
    ] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'identified') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', qty: '', valeur: '', decision: '', status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title, content: item.content,
      qty: item.metadata?.qty || '', valeur: item.metadata?.valeur || '',
      decision: item.metadata?.decision || '', status: item.status || 'identified'
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
    if (formData.qty) newItem.metadata.qty = formData.qty;
    if (formData.valeur) newItem.metadata.valeur = formData.valeur;
    if (formData.decision) newItem.metadata.decision = formData.decision;

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
    console.log(`Article ${itemId} déplacé de ${sourceCol} vers ${targetCol}`);
  };

  return (
    <PageLayout navLinks={NAV_LINKS_BY_ROLE.pi} activeNav={activeNav} onNavChange={setActiveNav} hero={{
      title: 'Stock mort', subtitle: 'Identifiez et gérez les articles à rotation lente ou obsolètes',
      ctaLabel: 'RAPPORT', ctaIcon: 'analytics', onCta: () => console.log('Générer rapport'),
    }}>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} onEditItem={handleEdit} onDeleteItem={handleDelete} onViewDetails={handleViewDetails} showAddButton={true} onAddItem={handleAdd} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Modifier la décision" : "Nouvel article stock mort"} size="md" actions={
        <><FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} /><FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} /></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="title" label="Code SAP" placeholder="SAP-XXXXX" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextareaField id="content" label="Désignation" placeholder="Description de l'article..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={2} />
          <FormRow>
            <Field id="qty" label="Quantité" type="number" placeholder="0" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} />
            <Field id="valeur" label="Valeur (MAD)" type="number" placeholder="0" value={formData.valeur} onChange={(e) => setFormData({...formData, valeur: e.target.value})} />
          </FormRow>
          <SelectField id="status" label="Statut" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
            { value: 'identified', label: 'Identifié' }, { value: 'analysis', label: 'À analyser' },
            { value: 'sell', label: 'À écouler' }, { value: 'scrap', label: 'À réformer' },
            { value: 'approved', label: 'Validé' }
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