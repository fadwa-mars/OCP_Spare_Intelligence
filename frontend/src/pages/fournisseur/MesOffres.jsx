// src/pages/fournisseur/MesOffres.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import KanbanBoard from '../../components/KanbanBoard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

export default function MesOffres() {
  const [activeNav, setActiveNav] = useState('Mes offres');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readModalOpen, setReadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    montant: '',
    delais: '',
    document: null,
    status: 'draft'
  });

  const [columns, setColumns] = useState([
    { id: 'draft', title: 'Brouillon', color: '#6c757d', items: [
      { id: 1, title: 'AO-2024-001 - Pompes centrifuges', content: 'Offre technique et commerciale en cours', status: 'draft', metadata: { deadline: '20/05', avancement: '60%', montant: '240K MAD' } },
      { id: 2, title: 'AO-2024-003 - Moteurs électriques', content: 'En attente validation interne', status: 'draft', metadata: { deadline: '25/05', avancement: '30%', montant: '310K MAD' } }
    ] },
    { id: 'submitted', title: 'Soumise', color: '#0d6efd', items: [
      { id: 3, title: 'AO-2024-002 - Roulements SKF', content: 'Offre déposée le 10/05', status: 'submitted', metadata: { date_soumission: '10/05', montant: '45K MAD', delais: '15 jours' } },
      { id: 4, title: 'AO-2024-004 - Filtres hydrauliques', content: 'Offre déposée le 12/05', status: 'submitted', metadata: { date_soumission: '12/05', montant: '28K MAD', delais: '10 jours' } }
    ] },
    { id: 'evaluation', title: 'En évaluation', color: '#fd7e14', items: [
      { id: 5, title: 'AO-2024-005 - Vannes à boisseau', content: 'En cours d\'analyse par acheteur', status: 'evaluation', metadata: { date_soumission: '05/05', concurrents: '3', position: '2eme' } }
    ] },
    { id: 'accepted', title: 'Acceptée', color: '#198754', items: [
      { id: 6, title: 'AO-2024-006 - Courroies transmission', content: 'Commande reçue le 01/05', status: 'accepted', metadata: { montant: '12K MAD', reference_cmd: 'CMD-2024-006', livraison: 'Prevue le 10/06' } }
    ] },
    { id: 'rejected', title: 'Rejetée', color: '#dc3545', items: [
      { id: 7, title: 'AO-2024-007 - Outillage specifique', content: 'Offre non retenue', status: 'rejected', metadata: { motif: 'Prix trop eleve', feedback: 'Revoir grille tarifaire' } }
    ] }
  ]);

  const generateId = () => {
    const allItems = columns.flatMap(col => col.items);
    const maxId = Math.max(0, ...allItems.map(item => item.id));
    return maxId + 1;
  };

  const handleAdd = (colId = 'draft') => {
    setEditingItem(null);
    setFormData({ title: '', content: '', montant: '', delais: '', document: null, status: colId });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      montant: item.metadata?.montant || '',
      delais: item.metadata?.delais || '',
      document: null,
      status: item.status || 'draft'
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
    if (!formData.title.trim()) { alert("Le titre est requis"); return; }
    if (!formData.montant) { alert("Le montant est requis"); return; }
    if (!formData.delais) { alert("Le delai est requis"); return; }
    
    const newItem = {
      id: editingItem ? editingItem.id : generateId(),
      title: formData.title,
      content: formData.content,
      status: formData.status,
      metadata: {
        montant: formData.montant,
        delais: formData.delais,
        date_soumission: new Date().toLocaleDateString('fr-FR')
      }
    };
    if (formData.document) newItem.metadata.document = formData.document.name;

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
    console.log(`Offre ${itemId} déplacée de ${sourceCol} vers ${targetCol}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({...formData, document: e.target.files[0]});
    }
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.fournisseur}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Mes offres',
        subtitle: 'Suivez vos propositions commerciales en mode Kanban',
        ctaLabel: 'NOUVELLE OFFRE',
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

      {/* Modal CRUD Ajout/Modification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Modifier l'offre" : "Nouvelle offre"}
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setModalOpen(false)} />
            <FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} />
          </>
        }
      >
        <div className="read-modal__content">
          <div className="read-modal__field">
            <div className="read-modal__label">Appel d'offres</div>
            <input
              className="field__input"
              type="text"
              placeholder="AO-2024-XXX - Description"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="read-modal__field">
            <div className="read-modal__label">Description</div>
            <textarea
              className="field__input field__textarea"
              placeholder="Description technique, garanties, conditions..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="read-modal__field">
              <div className="read-modal__label">Montant (MAD)</div>
              <input
                className="field__input"
                type="number"
                placeholder="0"
                value={formData.montant}
                onChange={(e) => setFormData({...formData, montant: e.target.value})}
              />
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Delai de livraison</div>
              <input
                className="field__input"
                type="text"
                placeholder="30 jours"
                value={formData.delais}
                onChange={(e) => setFormData({...formData, delais: e.target.value})}
              />
            </div>
          </div>
          
          {/* Input file stylisé */}
          <div className="read-modal__field">
            <div className="read-modal__label">Document joint (optionnel)</div>
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <span className="file-input-text">
                  {formData.document ? formData.document.name : 'Aucun fichier sélectionné'}
                </span>
                <span className="file-input-button">PARCOURIR</span>
                <input
                  type="file"
                  className="file-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {formData.document && (
              <div className="file-info">
                <span className="material-symbols-outlined">description</span>
                {formData.document.name}
              </div>
            )}
          </div>
          
          <div className="read-modal__field">
            <div className="read-modal__label">Statut</div>
            <select
              className="field__input field__select"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">Brouillon</option>
              <option value="submitted">Soumise</option>
              <option value="evaluation">En evaluation</option>
              <option value="accepted">Acceptee</option>
              <option value="rejected">Rejetee</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal Visualisation */}
      <Modal
        isOpen={readModalOpen}
        onClose={() => setReadModalOpen(false)}
        title={`Details - ${viewingItem?.title}`}
        size="md"
        actions={
          <FormButton label="FERMER" variant="secondary" onClick={() => setReadModalOpen(false)} />
        }
      >
        {viewingItem && (
          <div className="read-modal__content">
            <div className="read-modal__field">
              <div className="read-modal__label">Description</div>
              <div className="read-modal__value">{viewingItem.content}</div>
            </div>
            {viewingItem.metadata && Object.entries(viewingItem.metadata).map(([key, val]) => (
              <div key={key} className="read-modal__field">
                <div className="read-modal__label">{key.replace(/_/g, ' ')}</div>
                <div className="read-modal__value">{val}</div>
              </div>
            ))}
            <div className="read-modal__field">
              <div className="read-modal__label">Statut</div>
              <div className="read-modal__value">
                {columns.find(c => c.id === viewingItem.status)?.title || viewingItem.status}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Supprimer definitivement "${itemToDelete?.title}" ?`}
        variant="danger"
        confirmText="SUPPRIMER"
        cancelText="ANNULER"
      />
    </PageLayout>
  );
}