// src/pages/fournisseurs/FournisseurDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const FournisseurDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [fournisseur, setFournisseur] = useState(null)
  const [loading, setLoading] = useState(true)

  const canManage = user?.role === 'admin' || user?.role === 'acheteur'

  useEffect(() => {
    fetchFournisseur()
  }, [id])

  const fetchFournisseur = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/fournisseurs/${id}`)
      setFournisseur(response.data.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur lors du chargement du fournisseur')
      navigate('/fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadge = (score) => {
    if (!score) return <span className="badge bg-secondary">Non évalué</span>
    if (score >= 80) return <span className="badge bg-success">Excellent ({score})</span>
    if (score >= 60) return <span className="badge bg-info">Bon ({score})</span>
    if (score >= 40) return <span className="badge bg-warning">Moyen ({score})</span>
    return <span className="badge bg-danger">Faible ({score})</span>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!fournisseur) return null

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/fournisseurs')} className="btn btn-link text-primary text-decoration-none p-0">
            <i className="bi bi-arrow-left me-2"></i>Retour
          </button>
          <h4 className="fw-bold mb-1 text-primary">Détail du fournisseur</h4>
        </div>
        {canManage && (
          <div className="d-flex gap-2">
            <Link to={`/fournisseurs/edit/${fournisseur.id}`} className="btn btn-warning">
              <i className="bi bi-pencil me-2"></i>Modifier
            </Link>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Informations générales */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header border-0" style={{ backgroundColor: '#f0f7ff' }}>
              <h6 className="fw-semibold text-primary mb-0">
                <i className="bi bi-building me-2"></i>Informations générales
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <small className="text-muted">Nom du fournisseur</small>
                  <p className="fw-semibold fs-5 mb-0">{fournisseur.nom}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Email de contact</small>
                  <p className="fw-semibold mb-0">
                    {fournisseur.email_contact ? (
                      <a href={`mailto:${fournisseur.email_contact}`}>{fournisseur.email_contact}</a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Téléphone</small>
                  <p className="fw-semibold mb-0">
                    {fournisseur.telephone ? (
                      <a href={`tel:${fournisseur.telephone}`}>{fournisseur.telephone}</a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Adresse</small>
                  <p className="fw-semibold mb-0">{fournisseur.adresse || '-'}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Statut</small>
                  <p className="mb-0">
                    {fournisseur.est_actif ? (
                      <span className="badge bg-success">Actif</span>
                    ) : (
                      <span className="badge bg-danger">Inactif</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Évaluation de performance */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header border-0" style={{ backgroundColor: '#f0f7ff' }}>
              <h6 className="fw-semibold text-primary mb-0">
                <i className="bi bi-graph-up me-2"></i>Évaluation de performance
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12 text-center mb-3">
                  <div className="display-4">{getScoreBadge(fournisseur.score_global)}</div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Taux de conformité</small>
                  <p className="fw-semibold mb-0">{fournisseur.taux_conformite || 0}%</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Délai moyen livraison</small>
                  <p className="fw-semibold mb-0">{fournisseur.delai_moyen_livraison || 0} jours</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Nombre de commandes</small>
                  <p className="fw-semibold mb-0">{fournisseur.nb_commandes || 0}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Livraisons en retard</small>
                  <p className="fw-semibold mb-0 text-danger">{fournisseur.nb_livraisons_retard || 0}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Taux de ponctualité</small>
                  <div className="progress mt-1" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ 
                        width: `${fournisseur.nb_commandes > 0 
                          ? ((fournisseur.nb_commandes - (fournisseur.nb_livraisons_retard || 0)) / fournisseur.nb_commandes) * 100 
                          : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Date de création</small>
                  <p className="fw-semibold mb-0">
                    {new Date(fournisseur.created_at).toLocaleDateString()} à {new Date(fournisseur.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Dernière modification</small>
                  <p className="fw-semibold mb-0">
                    {new Date(fournisseur.updated_at).toLocaleDateString()} à {new Date(fournisseur.updated_at).toLocaleTimeString()}
                  </p>
                </div>
                {fournisseur.date_derniere_evaluation && (
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Dernière évaluation</small>
                    <p className="fw-semibold mb-0">{new Date(fournisseur.date_derniere_evaluation).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FournisseurDetail