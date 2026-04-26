// src/pages/commandes/CommandeList.jsx
import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const CommandeList = () => {
  const { user } = useAuth()
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')
  const [selectedFournisseur, setSelectedFournisseur] = useState('')
  const [fournisseurs, setFournisseurs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCommande, setSelectedCommande] = useState(null)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiving, setReceiving] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const itemsPerPage = 10

  // Si l'utilisateur est fournisseur, rediriger vers sa page spécifique
  if (user?.role === 'fournisseur') {
    return <Navigate to="/fournisseur/mes-commandes" replace />
  }

  const canReceive = user?.role === 'admin' || user?.role === 'magasinier'
  const canEdit = user?.role === 'admin' || user?.role === 'acheteur'
  const canViewAll = user?.role === 'admin' || user?.role === 'acheteur' || user?.role === 'magasinier' || user?.role === 'planificateur'

  useEffect(() => {
    fetchCommandes()
    fetchFournisseurs()
  }, [])

  const fetchCommandes = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/commandes', {
        params: { per_page: 100 }
      })
      
      let commandesData = []
      if (response.data.data && response.data.data.data) {
        commandesData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data
      }
      
      setCommandes(commandesData)
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const fetchFournisseurs = async () => {
    try {
      const response = await axiosInstance.get('/fournisseurs', {
        params: { per_page: 100 }
      })
      let fournisseursData = []
      if (response.data.data && response.data.data.data) {
        fournisseursData = response.data.data.data
      }
      setFournisseurs(fournisseursData)
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
    }
  }

 const openDetailModal = async (commande) => {
  setLoadingDetail(true)
  try {
    const response = await axiosInstance.get(`/commandes/${commande.id}`)
    console.log('=== DÉTAIL COMMANDE ===')
    console.log('Réponse complète:', response.data)
    console.log('ligne_commandes:', response.data.data.ligne_commandes)
    setSelectedCommande(response.data.data)
    setShowDetailModal(true)
  } catch (error) {
    console.error('Erreur chargement détail:', error)
    toast.error('Erreur lors du chargement des détails')
  } finally {
    setLoadingDetail(false)
  }
}

  const openReceiveModal = (commande) => {
    setSelectedCommande(commande)
    setShowReceiveModal(true)
  }

  const handleReceive = async () => {
    if (!selectedCommande) return

    setReceiving(true)
    try {
      await axiosInstance.post(`/commandes/${selectedCommande.id}/receive`)
      toast.success('Commande réceptionnée avec succès')
      setShowReceiveModal(false)
      fetchCommandes()
    } catch (error) {
      console.error('Erreur réception:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la réception')
    } finally {
      setReceiving(false)
    }
  }

  const handleCancel = async (commandeId) => {
    if (window.confirm('Confirmer l\'annulation de cette commande ?')) {
      try {
        await axiosInstance.post(`/commandes/${commandeId}/cancel`)
        toast.success('Commande annulée')
        fetchCommandes()
      } catch (error) {
        console.error('Erreur annulation:', error)
        toast.error('Erreur lors de l\'annulation')
      }
    }
  }

  const exportToExcel = () => {
    const exportData = filteredCommandes.map((commande, index) => ({
      '#': index + 1,
      'Numero BC': commande.numero_bc,
      'Fournisseur': commande.fournisseur?.nom || '-',
      'Date commande': commande.date_commande?.split('T')[0],
      'Date livraison prevue': commande.date_livraison_prevue?.split('T')[0],
      'Date livraison reelle': commande.date_livraison_reelle?.split('T')[0] || '-',
      'Statut': commande.statut,
      'Montant total': commande.montant_total + ' €'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes')
    XLSX.writeFile(wb, `commandes_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedStatut('')
    setSelectedFournisseur('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const filteredCommandes = commandes.filter(commande => {
    const matchSearch = search === '' ||
      commande.numero_bc?.toLowerCase().includes(search.toLowerCase()) ||
      commande.fournisseur?.nom?.toLowerCase().includes(search.toLowerCase())
    
    const matchStatut = selectedStatut === '' || commande.statut === selectedStatut
    const matchFournisseur = selectedFournisseur === '' || commande.fournisseur_id == selectedFournisseur
    
    return matchSearch && matchStatut && matchFournisseur
  })

  const totalItems = filteredCommandes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCommandes = filteredCommandes.slice(startIndex, startIndex + itemsPerPage)

  const getStatutBadge = (statut) => {
    const badges = {
      'en_attente': { class: 'secondary', text: 'En attente' },
      'confirmee': { class: 'primary', text: 'Confirmée' },
      'expediee': { class: 'info', text: 'Expédiée' },
      'recue': { class: 'success', text: 'Reçue' },
      'annulee': { class: 'danger', text: 'Annulée' },
      'en_cours_livraison': { class: 'warning', text: 'En cours de livraison' }
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
      {/* En-tête */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">Commandes</h4>
          <p className="text-secondary small mb-0">Gestion des commandes fournisseurs</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button 
            className="btn btn-outline-secondary"
            onClick={exportToExcel}
          >
            <i className="bi bi-download me-2"></i>Exporter
          </button>
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-1"></i>
            Filtres
          </button>
          {canEdit && (
            <Link to="/commandes/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>Nouvelle commande
            </Link>
          )}
        </div>
      </div>

      {/* Panneau des filtres */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">Recherche</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-secondary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Numero BC ou fournisseur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Statut</label>
                <select 
                  className="form-select"
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="confirmee">Confirmée</option>
                  <option value="expediee">Expédiée</option>
                  <option value="recue">Reçue</option>
                  <option value="annulee">Annulée</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Fournisseur</label>
                <select 
                  className="form-select"
                  value={selectedFournisseur}
                  onChange={(e) => setSelectedFournisseur(e.target.value)}
                >
                  <option value="">Tous les fournisseurs</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-danger"
                  onClick={resetFilters}
                >
                  <i className="bi bi-x-octagon"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des commandes */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Numero BC</th>
                  <th className="py-3">Fournisseur</th>
                  <th className="py-3 text-center">Date commande</th>
                  <th className="py-3 text-center">Livraison prevue</th>
                  <th className="py-3 text-center">Montant</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommandes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  paginatedCommandes.map((commande, index) => (
                    <tr key={commande.id || index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{commande.numero_bc || '-'}</td>
                      <td className="py-3">{commande.fournisseur?.nom || '-'}</td>
                      <td className="py-3 text-center">{commande.date_commande?.split('T')[0] || '-'}</td>
                      <td className="py-3 text-center">{commande.date_livraison_prevue?.split('T')[0] || '-'}</td>
                      <td className="py-3 text-center">{commande.montant_total} €</td>
                      <td className="py-3 text-center">{getStatutBadge(commande.statut)}</td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            onClick={() => openDetailModal(commande)}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir détail"
                            disabled={loadingDetail}
                          >
                            {loadingDetail ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-eye"></i>}
                          </button>
                          
                          {canReceive && commande.statut !== 'recue' && commande.statut !== 'annulee' && (
                            <button
                              onClick={() => openReceiveModal(commande)}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Réceptionner"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                          )}
                          
                          {canEdit && commande.statut !== 'recue' && commande.statut !== 'annulee' && (
                            <button
                              onClick={() => handleCancel(commande.id)}
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Annuler"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-transparent border-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-secondary">
                <i className="bi bi-database me-1"></i>
                Total: <strong>{totalItems}</strong> commandes | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)}>
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i
                      if (pageNum > totalPages) return null
                    }
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                          {pageNum}
                        </button>
                      </li>
                    )
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {showDetailModal && selectedCommande && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-receipt me-2"></i>
                  Détail de la commande
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Numero BC</small>
                      <p className="fw-semibold mb-0">{selectedCommande.numero_bc}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Fournisseur</small>
                      <p className="fw-semibold mb-0">{selectedCommande.fournisseur?.nom}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date commande</small>
                      <p className="fw-semibold mb-0">{selectedCommande.date_commande?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Livraison prevue</small>
                      <p className="fw-semibold mb-0">{selectedCommande.date_livraison_prevue?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Livraison réelle</small>
                      <p className="fw-semibold mb-0">{selectedCommande.date_livraison_reelle?.split('T')[0] || '-'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Montant total</small>
                      <p className="fw-semibold mb-0 text-primary">{selectedCommande.montant_total} €</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Statut</small>
                      <p className="fw-semibold mb-0">{getStatutBadge(selectedCommande.statut)}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Lignes de commande</small>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-borderless mb-0">
                          <thead>
                            <tr>
                              <th>Article</th>
                              <th className="text-center">Quantité</th>
                              <th className="text-end">Prix unitaire</th>
                              <th className="text-end">Montant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCommande.ligne_commandes?.map((ligne, idx) => (
                              <tr key={idx}>
                                <td>{ligne.article?.designation || 'Article non trouvé'}</td>
                                <td className="text-center">{ligne.quantite}</td>
                                <td className="text-end">{ligne.prix_unitaire} €</td>
                                <td className="text-end">{ligne.montant_ligne} €</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réception */}
      {showReceiveModal && selectedCommande && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-success bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-success fw-bold">
                  <i className="bi bi-archive me-2"></i>
                  Réceptionner la commande
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReceiveModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Numero BC</small>
                      <p className="fw-semibold mb-0">{selectedCommande.numero_bc}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Fournisseur</small>
                      <p className="fw-semibold mb-0">{selectedCommande.fournisseur?.nom}</p>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  La réception de cette commande va mettre à jour les stocks automatiquement.
                </div>

                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted">Articles à recevoir</small>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-borderless mb-0">
                      <thead>
                        <tr>
                          <th>Article</th>
                          <th className="text-center">Quantité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCommande.ligne_commandes?.map((ligne, idx) => (
                          <tr key={idx}>
                            <td>{ligne.article?.designation || 'Article non trouvé'}</td>
                            <td className="text-center">{ligne.quantite}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowReceiveModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-success px-4" 
                  onClick={handleReceive}
                  disabled={receiving}
                >
                  {receiving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Confirmer la réception
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

export default CommandeList