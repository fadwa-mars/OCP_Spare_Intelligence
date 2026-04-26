// src/pages/fournisseur/MesCommandes.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const MesCommandes = () => {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedCommande, setSelectedCommande] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)

  useEffect(() => {
    fetchCommandes()
  }, [])

  const fetchCommandes = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/fournisseur/mes-commandes')
      let commandesData = []
      if (response.data.data && response.data.data.data) {
        commandesData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data
      }
      setCommandes(commandesData)
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
      toast.error('Erreur lors du chargement de vos commandes')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedCommande) return
    setCancelling(true)
    try {
      await axiosInstance.delete(`/fournisseur/commandes/${selectedCommande.id}/cancel`)
      toast.success('Commande annulée avec succès')
      setShowCancelModal(false)
      fetchCommandes()
    } catch (error) {
      console.error('Erreur annulation:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation')
    } finally {
      setCancelling(false)
      setSelectedCommande(null)
    }
  }

  const handleConfirm = async (commande) => {
    try {
      await axiosInstance.put(`/fournisseur/commandes/${commande.id}/confirm`)
      toast.success('Commande confirmée avec succès')
      fetchCommandes()
    } catch (error) {
      console.error('Erreur confirmation:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la confirmation')
    }
  }

  const openDetailModal = (commande) => {
    setSelectedDetail(commande)
    setShowDetailModal(true)
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'confirmee': { class: 'primary', text: 'Confirmée' },
      'en_cours_livraison': { class: 'info', text: 'En cours de livraison' },
      'recue': { class: 'success', text: 'Réceptionnée' },
      'annulee': { class: 'danger', text: 'Annulée' }
    }
    const b = badges[statut] || { class: 'secondary', text: statut }
    return <span className={`badge bg-${b.class} bg-opacity-10 text-${b.class}`}>{b.text}</span>
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

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">Mes commandes</h4>
          <p className="text-secondary small mb-0">Commandes gagnées et à livrer</p>
        </div>
      </div>

      {commandes.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <i className="bi bi-cart-x fs-1 text-secondary"></i>
            <p className="text-secondary mt-2">Vous n'avez pas encore de commandes</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => window.location.href = '/fournisseur/appels-offres'}
            >
              <i className="bi bi-megaphone me-2"></i>Consulter les appels d'offres
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {commandes.map((commande) => (
            <div className="col-md-6 mb-4" key={commande.id}>
              <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold text-primary mb-0">Commande #{commande.numero_bc || commande.id}</h6>
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(commande.date_commande).toLocaleDateString()}
                      </small>
                    </div>
                    {getStatutBadge(commande.statut)}
                  </div>
                  
                  <div className="mb-3">
                    <div className="bg-light rounded-3 p-2 mb-2">
                      <small className="text-muted">Appel d'offres</small>
                      <p className="fw-semibold mb-0 small">{commande.offre?.appel_offre?.objet || '-'}</p>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">Montant total</small>
                        <p className="fw-bold text-success mb-0">{commande.montant_total?.toLocaleString()} DH</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Livraison prévue</small>
                        <p className="fw-semibold mb-0">{commande.date_livraison_prevue?.split('T')[0] || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 pb-3">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => openDetailModal(commande)}
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i className="bi bi-eye me-1"></i>Détails
                    </button>
                    {commande.statut === 'confirmee' && (
                      <>
                        <button
                          onClick={() => handleConfirm(commande)}
                          className="btn btn-success btn-sm flex-grow-1"
                        >
                          <i className="bi bi-check-lg me-1"></i>Confirmer
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCommande(commande)
                            setShowCancelModal(true)
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ width: '40px' }}
                          title="Annuler la commande"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </>
                    )}
                    {commande.statut === 'recue' && (
                      <button className="btn btn-info btn-sm flex-grow-1" disabled>
                        <i className="bi bi-check-circle-fill me-1"></i>Livrée
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détail */}
      {showDetailModal && selectedDetail && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-cart me-2"></i>
                  Détail de la commande #{selectedDetail.numero_bc || selectedDetail.id}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date commande</small>
                      <p className="fw-semibold mb-0">{new Date(selectedDetail.date_commande).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Livraison prévue</small>
                      <p className="fw-semibold mb-0">{selectedDetail.date_livraison_prevue?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Montant total</small>
                      <p className="fw-bold text-success mb-0">{selectedDetail.montant_total?.toLocaleString()} DH</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Statut</small>
                      <p className="mb-0">{getStatutBadge(selectedDetail.statut)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </button>
                {selectedDetail.statut === 'confirmee' && (
                  <button 
                    className="btn btn-success px-4"
                    onClick={() => {
                      handleConfirm(selectedDetail)
                      setShowDetailModal(false)
                    }}
                  >
                    <i className="bi bi-check-lg me-2"></i>Confirmer la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Annulation */}
      {showCancelModal && selectedCommande && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Annuler la commande
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-semibold">Êtes-vous sûr ?</h5>
                <p className="text-secondary mb-2">
                  Vous allez annuler la commande #{selectedCommande.numero_bc || selectedCommande.id}
                </p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  Cette action est irréversible.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowCancelModal(false)}>
                  Retour
                </button>
                <button 
                  className="btn btn-danger px-4" 
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Annulation...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Confirmer l'annulation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MesCommandes