// src/pages/admin/Utilisateurs.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, SelectField, FormButton, FormRow } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées
const UTILISATEURS_DATA = [
  { id: 1, nom: 'Karim Mansouri', email: 'karim.mansouri@ocp.ma', role: 'magasinier', statut: 'Actif', derniere_connexion: '15/05/2024 08:30' },
  { id: 2, nom: 'Amina Benali', email: 'amina.benali@ocp.ma', role: 'acheteur', statut: 'Actif', derniere_connexion: '15/05/2024 09:15' },
  { id: 3, nom: 'Youssef El Fassi', email: 'youssef.elfassi@ocp.ma', role: 'pi', statut: 'Actif', derniere_connexion: '14/05/2024 14:20' },
  { id: 4, nom: 'Sara Admin', email: 'sara.admin@ocp.ma', role: 'admin', statut: 'Actif', derniere_connexion: '15/05/2024 10:00' },
  { id: 5, nom: 'Ali Fournisseur', email: 'ali.fournisseur@ocp.ma', role: 'fournisseur', statut: 'Inactif', derniere_connexion: '10/05/2024 11:45' },
  { id: 6, nom: 'Mohammed Tazi', email: 'mohammed.tazi@ocp.ma', role: 'magasinier', statut: 'Actif', derniere_connexion: '14/05/2024 16:30' },
  { id: 7, nom: 'Fatima Zahra', email: 'fatima.zahra@ocp.ma', role: 'acheteur', statut: 'Inactif', derniere_connexion: '05/05/2024 09:00' },
];

const COLUMNS = [
  { key: 'nom', label: 'Nom complet', type: 'text', align: 'left' },
  { key: 'email', label: 'Email', type: 'text', align: 'left' },
  { key: 'role', label: 'Rôle', type: 'badge', align: 'center' },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
  { key: 'derniere_connexion', label: 'Dernière connexion', type: 'text', align: 'left', muted: true },
  // Plus de colonne actions
];

const getRoleBadgeClass = (role) => {
  const map = {
    admin: 'badge--optimal',
    acheteur: 'badge--warning',
    magasinier: 'badge--info',
    pi: 'badge--info',
    fournisseur: 'badge--critical'
  };
  return map[role] || 'badge--info';
};

const getRoleLabel = (role) => {
  const map = {
    admin: 'Admin',
    acheteur: 'Acheteur',
    magasinier: 'Magasinier',
    pi: 'Planificateur PI',
    fournisseur: 'Fournisseur'
  };
  return map[role] || role;
};

const getStatutBadgeClass = (statut) => {
  return statut === 'Actif' ? 'badge--optimal' : 'badge--critical';
};

export default function Utilisateurs() {
  const [activeNav, setActiveNav] = useState('Utilisateurs');
  const [search, setSearch] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToReset, setItemToReset] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: 'magasinier',
    statut: 'Actif'
  });
  const [utilisateurs, setUtilisateurs] = useState(UTILISATEURS_DATA);

  const filtered = utilisateurs.filter(item =>
    item.nom.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  const generateId = () => {
    const maxId = Math.max(0, ...utilisateurs.map(item => item.id));
    return maxId + 1;
  };

  // Clic sur la ligne pour voir les détails
  const handleRowClick = (row) => {
    setSelectedItem(row);
    setViewModalOpen(true);
  };

  // Ouvrir modal de modification (depuis la modal de visualisation)
  const handleOpenEdit = () => {
    setFormData({
      nom: selectedItem.nom,
      email: selectedItem.email,
      role: selectedItem.role,
      statut: selectedItem.statut
    });
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  // Ouvrir modal d'ajout
  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ nom: '', email: '', role: 'magasinier', statut: 'Actif' });
    setEditModalOpen(true);
  };

  // Activer/Désactiver un utilisateur (depuis la modal de visualisation)
  const handleToggleStatut = () => {
    setUtilisateurs(prev => prev.map(item =>
      item.id === selectedItem.id
        ? { ...item, statut: item.statut === 'Actif' ? 'Inactif' : 'Actif' }
        : item
    ));
    setSelectedItem(prev => ({ ...prev, statut: prev.statut === 'Actif' ? 'Inactif' : 'Actif' }));
  };

  // Réinitialiser mot de passe
  const handleResetPassword = () => {
    setItemToReset(selectedItem);
    setResetConfirmOpen(true);
  };

  const confirmResetPassword = () => {
    alert(`Un email de réinitialisation a été envoyé à ${itemToReset?.email}`);
    setResetConfirmOpen(false);
    setItemToReset(null);
  };

  // Supprimer un utilisateur
  const handleDelete = () => {
    setItemToDelete(selectedItem);
    setConfirmOpen(true);
    setViewModalOpen(false);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setUtilisateurs(prev => prev.filter(item => item.id !== itemToDelete.id));
    }
    setConfirmOpen(false);
    setItemToDelete(null);
    setSelectedItem(null);
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = () => {
    if (!formData.nom.trim()) { alert("Le nom est requis"); return; }
    if (!formData.email.trim()) { alert("L'email est requis"); return; }
    
    if (selectedItem) {
      // Modification
      setUtilisateurs(prev => prev.map(item =>
        item.id === selectedItem.id
          ? { ...item, nom: formData.nom, email: formData.email, role: formData.role, statut: formData.statut }
          : item
      ));
    } else {
      // Ajout
      setUtilisateurs(prev => [...prev, {
        id: generateId(),
        nom: formData.nom,
        email: formData.email,
        role: formData.role,
        statut: formData.statut,
        derniere_connexion: 'Jamais'
      }]);
    }
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.admin}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Utilisateurs',
        subtitle: 'Gérez les comptes utilisateurs de la plateforme',
        ctaLabel: 'AJOUTER',
        ctaIcon: 'add',
        onCta: handleAdd,
      }}
    >
      <DataTable
        columns={COLUMNS.map(col => ({
          ...col,
          render: col.key === 'role' ? (row) => (
            <span className={`badge ${getRoleBadgeClass(row.role)}`}>{getRoleLabel(row.role)}</span>
          ) : col.key === 'statut' ? (row) => (
            <span className={`badge ${getStatutBadgeClass(row.statut)}`}>{row.statut}</span>
          ) : undefined
        }))}
        data={filtered}
        keyField="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom ou email..."
        totalCount={utilisateurs.length}
        pageSize={10}
        onExport={() => console.log('Export utilisateurs')}
        onRowClick={handleRowClick}
      />

      {/* Modal Visualisation (READ) avec boutons d'action */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Détails - ${selectedItem?.nom}`}
        size="lg"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-small)', justifyContent: 'flex-end', width: '100%' }}>
            <FormButton 
              label="RÉINITIALISER MDP" 
              variant="secondary" 
              onClick={handleResetPassword}
            />
            <FormButton 
              label={selectedItem?.statut === 'Actif' ? "DÉSACTIVER" : "ACTIVER"} 
              variant="secondary" 
              onClick={handleToggleStatut}
            />
            <FormButton 
              label="MODIFIER" 
              variant="primary" 
              onClick={handleOpenEdit}
            />
            <FormButton 
              label="SUPPRIMER" 
              variant="danger" 
              onClick={handleDelete}
            />
          </div>
        }
      >
        {selectedItem && (
          <div className="read-modal__content">
            <div className="read-modal__field">
              <div className="read-modal__label">Nom complet</div>
              <div className="read-modal__value">{selectedItem.nom}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Email</div>
              <div className="read-modal__value">{selectedItem.email}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Rôle</div>
              <div className="read-modal__value">{getRoleLabel(selectedItem.role)}</div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Statut</div>
              <div className="read-modal__value">
                <span className={`badge ${getStatutBadgeClass(selectedItem.statut)}`}>{selectedItem.statut}</span>
              </div>
            </div>
            <div className="read-modal__field">
              <div className="read-modal__label">Dernière connexion</div>
              <div className="read-modal__value">{selectedItem.derniere_connexion}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal CRUD Ajout/Modification */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedItem ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        size="md"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setEditModalOpen(false)} />
            <FormButton label="SAUVEGARDER" variant="primary" onClick={handleSave} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-medium)' }}>
          <Field
            id="nom"
            label="Nom complet"
            placeholder="Nom et prénom"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="utilisateur@ocp.ma"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <FormRow>
            <SelectField
              id="role"
              label="Rôle"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              options={[
                { value: 'admin', label: 'Administrateur' },
                { value: 'acheteur', label: 'Acheteur' },
                { value: 'magasinier', label: 'Magasinier' },
                { value: 'pi', label: 'Planificateur PI' },
                { value: 'fournisseur', label: 'Fournisseur' },
              ]}
            />
            <SelectField
              id="statut"
              label="Statut"
              value={formData.statut}
              onChange={(e) => setFormData({...formData, statut: e.target.value})}
              options={[
                { value: 'Actif', label: 'Actif' },
                { value: 'Inactif', label: 'Inactif' },
              ]}
            />
          </FormRow>
        </div>
      </Modal>

      {/* Confirmation suppression */}
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

      {/* Confirmation réinitialisation mot de passe */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={confirmResetPassword}
        title="Réinitialiser le mot de passe"
        message={`Envoyer un email de réinitialisation à "${itemToReset?.email}" ?`}
        variant="primary"
        confirmText="ENVOYER"
        cancelText="ANNULER"
      />
    </PageLayout>
  );
}