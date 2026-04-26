// src/pages/profile/Profile.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const getRoleBadge = (role) => {
    const roles = {
      'admin': { class: 'danger', text: 'Administrateur' },
      'acheteur': { class: 'primary', text: 'Acheteur' },
      'planificateur': { class: 'info', text: 'Planificateur PI' },
      'magasinier': { class: 'warning', text: 'Magasinier' },
      'fournisseur': { class: 'success', text: 'Fournisseur' }
    }
    const r = roles[role] || { class: 'secondary', text: role }
    return <span className={`badge bg-${r.class} bg-opacity-10 text-${r.class}`}>{r.text}</span>
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/dashboard')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
          <h6 className="fw-semibold text-primary mb-0 py-2">Mon profil</h6>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            {/* Avatar */}
            <div className="col-md-3 text-center">
              <div 
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto"
                style={{ width: '120px', height: '120px' }}
              >
                <i className="bi bi-person-fill text-primary" style={{ fontSize: '3.5rem' }}></i>
              </div>
              <div className="mt-3">
                {getRoleBadge(user.role)}
              </div>
            </div>

            {/* Informations */}
            <div className="col-md-9">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Nom complet</label>
                  <p className="fw-semibold fs-5 mb-0">{user.name}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Adresse email</label>
                  <p className="fw-semibold fs-5 mb-0">{user.email}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">ID utilisateur</label>
                  <p className="fw-semibold mb-0 text-primary">#{user.id}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Statut du compte</label>
                  <p className="fw-semibold mb-0">
                    <span className="badge bg-success bg-opacity-10 text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>Actif
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Membre depuis</label>
                  <p className="fw-semibold mb-0">
                    <i className="bi bi-calendar me-1 text-muted"></i>
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Dernière connexion</label>
                  <p className="fw-semibold mb-0">
                    <i className="bi bi-clock me-1 text-muted"></i>
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message informatif */}
          <div className="alert alert-info mt-4 mb-0">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>Information :</strong> La modification des informations personnelles est réservée à l'administrateur. Pour toute demande de modification, veuillez contacter votre administrateur.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile