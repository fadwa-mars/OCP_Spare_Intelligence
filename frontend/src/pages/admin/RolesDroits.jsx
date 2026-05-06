// src/pages/admin/RolesDroits.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Modal from '../../components/Modal';
import { FormButton, FormButton as Button } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Définition des 5 rôles
const ROLES = [
  { id: 'magasinier', label: 'Magasinier', color: 'info' },
  { id: 'acheteur', label: 'Acheteur', color: 'warning' },
  { id: 'pi', label: 'Planificateur PI', color: 'info' },
  { id: 'admin', label: 'Administrateur', color: 'optimal' },
  { id: 'fournisseur', label: 'Fournisseur', color: 'critical' },
];

// Définition des 6 modules
const MODULES = [
  { id: 'stock', label: 'Gestion de stock', icon: 'inventory' },
  { id: 'achats', label: 'Achats / Commandes', icon: 'shopping_cart' },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: 'business' },
  { id: 'planification', label: 'Planification PI', icon: 'analytics' },
  { id: 'administration', label: 'Administration', icon: 'admin_panel_settings' },
  { id: 'reporting', label: 'Reporting', icon: 'description' },
];

// Permissions par défaut
const DEFAULT_PERMISSIONS = {
  magasinier: {
    stock: { read: true, write: true },
    achats: { read: false, write: false },
    fournisseurs: { read: false, write: false },
    planification: { read: false, write: false },
    administration: { read: false, write: false },
    reporting: { read: true, write: false },
  },
  acheteur: {
    stock: { read: true, write: false },
    achats: { read: true, write: true },
    fournisseurs: { read: true, write: true },
    planification: { read: false, write: false },
    administration: { read: false, write: false },
    reporting: { read: true, write: true },
  },
  pi: {
    stock: { read: true, write: true },
    achats: { read: true, write: false },
    fournisseurs: { read: true, write: false },
    planification: { read: true, write: true },
    administration: { read: false, write: false },
    reporting: { read: true, write: true },
  },
  admin: {
    stock: { read: true, write: true },
    achats: { read: true, write: true },
    fournisseurs: { read: true, write: true },
    planification: { read: true, write: true },
    administration: { read: true, write: true },
    reporting: { read: true, write: true },
  },
  fournisseur: {
    stock: { read: false, write: false },
    achats: { read: true, write: false },
    fournisseurs: { read: true, write: false },
    planification: { read: false, write: false },
    administration: { read: false, write: false },
    reporting: { read: false, write: false },
  },
};

export default function RolesDroits() {
  const [activeNav, setActiveNav] = useState('Rôles & droits');
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vérifier si un rôle a des modifications par rapport aux permissions par défaut
  const hasChanges = () => {
    return JSON.stringify(permissions) !== JSON.stringify(DEFAULT_PERMISSIONS);
  };

  // Toggle permission lecture
  const toggleRead = (roleId, moduleId) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: {
          ...prev[roleId][moduleId],
          read: !prev[roleId][moduleId].read,
          // Si on désactive la lecture, on désactive aussi l'écriture
          write: !prev[roleId][moduleId].read ? false : prev[roleId][moduleId].write
        }
      }
    }));
  };

  // Toggle permission écriture
  const toggleWrite = (roleId, moduleId) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: {
          ...prev[roleId][moduleId],
          // L'écriture nécessite la lecture
          read: prev[roleId][moduleId].write ? true : true,
          write: !prev[roleId][moduleId].write
        }
      }
    }));
  };

  // Sauvegarder la configuration
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      console.log('Permissions sauvegardées:', permissions);
      setSaving(false);
      setSaveModalOpen(false);
    }, 1000);
  };

  // Réinitialiser les permissions
  const handleReset = () => {
    setPermissions(DEFAULT_PERMISSIONS);
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.admin}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Rôles & droits',
        subtitle: 'Configurez les permissions par rôle (lecture / écriture)',
        ctaLabel: 'SAUVEGARDER',
        ctaIcon: 'save',
        onCta: () => setSaveModalOpen(true),
      }}
    >
      <div className="roles-permissions">
        {/* Tableau des permissions */}
        <div className="glass-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="permissions-table">
              <thead>
                <tr>
                  <th className="permissions-module-cell">Modules / Rôles</th>
                  {ROLES.map(role => (
                    <th key={role.id} colSpan="2" className="permissions-role-header">
                      <span className={`badge badge--${role.color}`}>{role.label}</span>
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="permissions-module-cell"></th>
                  {ROLES.map(role => (
                    <React.Fragment key={role.id}>
                      <th className="permissions-action-header">Lecture</th>
                      <th className="permissions-action-header">Écriture</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(module => (
                  <tr key={module.id}>
                    <td className="permissions-module-cell">
                      <span className="material-symbols-outlined permissions-module-icon">
                        {module.icon}
                      </span>
                      <span className="permissions-module-label">{module.label}</span>
                    </td>
                    {ROLES.map(role => (
                      <React.Fragment key={role.id}>
                        <td className="permissions-checkbox-cell">
                          <label className="permissions-checkbox">
                            <input
                              type="checkbox"
                              checked={permissions[role.id][module.id]?.read || false}
                              onChange={() => toggleRead(role.id, module.id)}
                              disabled={role.id === 'admin'}
                            />
                            <span className="permissions-checkbox-custom"></span>
                          </label>
                        </td>
                        <td className="permissions-checkbox-cell">
                          <label className="permissions-checkbox">
                            <input
                              type="checkbox"
                              checked={permissions[role.id][module.id]?.write || false}
                              onChange={() => toggleWrite(role.id, module.id)}
                              disabled={role.id === 'admin' || !permissions[role.id][module.id]?.read}
                            />
                            <span className="permissions-checkbox-custom"></span>
                          </label>
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="permissions-footer">
          <div className="permissions-legend">
            <div className="legend-item">
              <div className="legend-color legend-color--optimal"></div>
              <span>Admin (tous droits)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-color--warning"></div>
              <span>Lecture requise pour écriture</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-color--info"></div>
              <span>Permissions modifiables</span>
            </div>
          </div>
          <div className="permissions-actions">
            <button className="export-btn" onClick={handleReset}>
              RÉINITIALISER
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmation sauvegarde */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Sauvegarder la configuration"
        size="sm"
        actions={
          <>
            <FormButton label="ANNULER" variant="secondary" onClick={() => setSaveModalOpen(false)} />
            <FormButton 
              label={saving ? "SAUVEGARDE..." : "CONFIRMER"} 
              variant="primary" 
              onClick={handleSave}
              disabled={saving}
            />
          </>
        }
      >
        <div className="save-modal-content">
          <p>Êtes-vous sûr de vouloir sauvegarder cette configuration ?</p>
          <p className="save-modal-note">Les modifications seront appliquées immédiatement à tous les utilisateurs.</p>
        </div>
      </Modal>
    </PageLayout>
  );
}