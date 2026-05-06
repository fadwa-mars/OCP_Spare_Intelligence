// src/pages/pi/StockAlertes.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, TextareaField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function StockAlertes() {
  const [activeNav, setActiveNav] = useState('Stock & alertes');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', seuil: '', actuel: '', action: '', status: 'new'
  });

  const [columns, setColumns] = useState([
    { id: 'new', title: 'Nouvelle', color: '#dc3545', items: [
      { id: 1, title: 'SAP-09211 - Courroie transmission', content: 'Stock critique : 2 unités (seuil: 10)', status: 'new', metadata: { niveau: 'Critique', seuil: '10', actuel: '2', date: '14/05' } },
      { id: 2, title: 'SAP-88271 - Contacteur Schneider', content: 'Stock faible : 12 unités (seuil: 15)', status: 'new', metadata: { niveau: 'Faible', seuil: '15', actuel: '12', date: '14/05' } }
    ] },
    { id: 'processing', title: 'En traitement', color: '#fd7e14', items: [
      { id: 3, title: 'SAP-28571 - Filtre à huile', content: 'Commande en cours de validation', status: 'processing', metadata: { action: 'Commande en cours', responsable: 'Acheteur', date: '13/05' } }
    ] },
    { id: 'ordered', title: 'Commande passée', color: '#ffc107', items: [
      { id: 4, title: 'SAP-11200 - Joint à lèvre Viton', content: 'Commande passée le 10/05', status: 'ordered', metadata: { fournisseur: 'JointTech', reference: 'CMD-2024-089', livraison: '20/05' } }
    ] },
    { id: 'resolved', title: 'Résolue', color: '#198754', items: [
      { id: 5, title: 'SAP-10492 - Roulement SKF', content: 'Stock réapprovisionné', status: 'resolved', metadata: { date: '12/05', qty_recue: '100', nouveau_stock: '245' } }
    ] },
    { id: 'ignored', title: 'Ignorée', color: '#6c757d', items: [
      { id: 6, title: 'SAP-66512 - Moteur asynchrone', content: 'Alerte ignorée - stock stratégique', status: 'ignored', metadata: { motif: 'Stock de sécurité', decision: 'Conserver', date: '10/05' } }
    ] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'new') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', seuil: '', actuel: '', action: '', status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title, content: item.content,
      seuil: item.metadata?.seuil || '', actuel: item.metadata?.actuel || '',
      action: item.metadata?.action || '', status: item.status || 'new'
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
    if (formData.seuil) newItem.metadata.seuil = formData.seuil;
    if (formData.actuel) newItem.metadata.actuel = formData.actuel;
    if (formData.action) newItem.metadata.action = formData.action;

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
    console.log(`Alerte ${itemId} déplacée de ${sourceCol} vers ${targetCol}`);
  };

  return (
    <PageLayout navLinks={NAV_LINKS_BY_ROLE.pi} activeNav={activeNav} onNavChange={setActiveNav} hero={{
      title: 'Stock & alertes', subtitle: 'Surveillez et traitez les alertes de stock en temps réel',
      ctaLabel: 'CONFIGURER', ctaIcon: 'settings', onCta: () => console.log('Configurer seuils'),
    }}>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} onEditItem={handleEdit} onDeleteItem={handleDelete} onViewDetails={handleViewDetails} showAddButton={true} onAddItem={handleAdd} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Traiter l'alerte" : "Nouvelle alerte"} size="md" actions={
        <><FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} /><FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} /></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field id="title" label="Article / Référence" placeholder="SAP-XXXXX - Désignation" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextareaField id="content" label="Description" placeholder="Détail de l'alerte..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={3} />
          <FormRow>
            <Field id="seuil" label="Seuil critique" type="number" placeholder="0" value={formData.seuil} onChange={(e) => setFormData({...formData, seuil: e.target.value})} />
            <Field id="actuel" label="Stock actuel" type="number" placeholder="0" value={formData.actuel} onChange={(e) => setFormData({...formData, actuel: e.target.value})} />
          </FormRow>
          <SelectField id="status" label="Statut" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} options={[
            { value: 'new', label: 'Nouvelle' }, { value: 'processing', label: 'En traitement' },
            { value: 'ordered', label: 'Commande passée' }, { value: 'resolved', label: 'Résolue' },
            { value: 'ignored', label: 'Ignorée' }
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