// src/components/MonProfil.jsx
import React, { useState, useEffect } from 'react';
import { FormButton } from './FormCard';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';

// Données mockées par rôle
const PROFIL_DATA = {
  magasinier: {
    id: 'USR-001',
    nom: 'Karim Mansouri',
    email: 'karim.mansouri@ocp.ma',
    role: 'Magasinier',
    roleLabel: 'Magasinier Principal',
    telephone: '05 22 11 22 33',
    service: 'Logistique',
    matricule: 'M-001234',
    dateIntegration: '10/01/2020',
    derniereConnexion: 'Aujourd\'hui, 08:42',
    avatar: 'https://ui-avatars.com/api/?background=1ed760&color=000&name=Karim+Mansouri'
  },
  acheteur: {
    id: 'USR-002',
    nom: 'Amina Benali',
    email: 'amina.benali@ocp.ma',
    role: 'Acheteur',
    roleLabel: 'Acheteur Senior',
    telephone: '05 22 44 55 66',
    service: 'Achats',
    matricule: 'A-005678',
    dateIntegration: '15/03/2019',
    derniereConnexion: 'Aujourd\'hui, 09:15',
    avatar: 'https://ui-avatars.com/api/?background=1ed760&color=000&name=Amina+Benali'
  },
  pi: {
    id: 'USR-003',
    nom: 'Youssef El Fassi',
    email: 'youssef.elfassi@ocp.ma',
    role: 'PI',
    roleLabel: 'Planificateur Industriel',
    telephone: '05 22 77 88 99',
    service: 'Planification',
    matricule: 'P-009012',
    dateIntegration: '20/05/2021',
    derniereConnexion: 'Hier, 14:20',
    avatar: 'https://ui-avatars.com/api/?background=1ed760&color=000&name=Youssef+El+Fassi'
  },
  admin: {
    id: 'USR-004',
    nom: 'Sara Admin',
    email: 'sara.admin@ocp.ma',
    role: 'Admin',
    roleLabel: 'Super Administrateur',
    telephone: '05 22 99 00 11',
    service: 'IT',
    matricule: 'AD-001',
    dateIntegration: '01/01/2018',
    derniereConnexion: 'Aujourd\'hui, 10:00',
    avatar: 'https://ui-avatars.com/api/?background=1ed760&color=000&name=Sara+Admin'
  },
  fournisseur: {
    id: 'USR-005',
    nom: 'ABC Industries',
    email: 'contact@abc-industries.ma',
    role: 'Fournisseur',
    roleLabel: 'Fournisseur Partenaire',
    telephone: '05 22 11 22 33',
    service: 'Commercial',
    matricule: 'F-004567',
    dateIntegration: '10/06/2022',
    derniereConnexion: 'Aujourd\'hui, 11:30',
    avatar: 'https://ui-avatars.com/api/?background=1ed760&color=000&name=ABC+Industries'
  },
};

export default function MonProfil({ isOpen, onClose }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(PROFIL_DATA[user?.role] || PROFIL_DATA.magasinier);

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      console.log('Profil sauvegardé:', formData);
      setSaving(false);
      setEditMode(false);
    }, 1000);
  };

  const infoItems = [
    { label: 'ID Utilisateur', value: formData.id, icon: 'badge' },
    { label: 'Matricule', value: formData.matricule, icon: 'tag' },
    { label: 'Email Professionnel', value: formData.email, icon: 'mail', editable: true },
    { label: 'Téléphone', value: formData.telephone, icon: 'call', editable: true },
    { label: 'Rôle Système', value: formData.roleLabel, icon: 'admin_panel_settings' },
    { label: 'Service', value: formData.service, icon: 'business' },
    { label: "Date d'intégration", value: formData.dateIntegration, icon: 'event' },
    { label: 'Dernière connexion', value: formData.derniereConnexion, icon: 'history' },
  ];

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header avec titre et bouton close sur la même ligne */}
        <div className="profile-modal-header">
          <div>
            <h2 className="profile-modal-title">Profil Utilisateur</h2>
            <p className="profile-modal-subtitle">Gérez votre identité et vos informations d'accès.</p>
          </div>
          <button className="profile-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Corps de la modal */}
        <div className="profile-modal-body">
          {/* 2 colonnes */}
          <div className="profile-two-columns">
            
            {/* Colonne gauche - Photo */}
            <div className="profile-left-column">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <img src={formData.avatar} alt={formData.nom} className="profile-avatar-img" />
                </div>
                {editMode ? (
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="profile-input profile-name-input"
                  />
                ) : (
                  <h3 className="profile-name">{formData.nom}</h3>
                )}
                <p className="profile-role-badge">{formData.roleLabel}</p>
                <div className="profile-status">
                  <div className="profile-status-dot"></div>
                  <span className="profile-status-text">Actif</span>
                </div>
              </div>
            </div>

            {/* Colonne droite - Grille d'informations */}
            <div className="profile-right-column">
              <div className="profile-info-grid">
                {infoItems.map((item, index) => (
                  <div key={index} className="profile-info-card">
                    <div className="profile-info-header">
                      <span className="profile-info-label">{item.label}</span>
                      <span className="material-symbols-outlined profile-info-icon">{item.icon}</span>
                    </div>
                    {editMode && item.editable ? (
                      <input
                        type={item.label === 'Email Professionnel' ? 'email' : 'text'}
                        name={item.label === 'Email Professionnel' ? 'email' : 'telephone'}
                        value={formData[item.label === 'Email Professionnel' ? 'email' : 'telephone']}
                        onChange={handleChange}
                        className="profile-input profile-info-value-input"
                      />
                    ) : (
                      <div className="profile-info-value">{item.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Boutons */}
        <div className="profile-modal-footer">
          {!editMode ? (
            <>
              <FormButton 
                label="CHANGER MOT DE PASSE" 
                variant="secondary" 
                onClick={() => console.log('Changer mot de passe')}
              />
              <FormButton 
                label="ÉDITER LE PROFIL" 
                variant="primary" 
                onClick={() => setEditMode(true)}
              />
            </>
          ) : (
            <>
              <FormButton 
                label="ANNULER" 
                variant="secondary" 
                onClick={() => setEditMode(false)}
              />
              <FormButton 
                label="SAUVEGARDER" 
                variant="primary" 
                onClick={handleSave}
                disabled={saving}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}