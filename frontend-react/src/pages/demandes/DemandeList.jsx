// src/pages/demandes/DemandeList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const DemandeList = () => {
  const { user } = useAuth()
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')
  const [selectedUrgence, setSelectedUrgence] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [showTenderModal, setShowTenderModal] = useState(false)
  const [tenderData, setTenderData] = useState({
    date_cloture: '',
    objet: ''
  })
  const [creatingTender, setCreatingTender] = useState(false)
  const [approving, setApproving] = useState(false)
  const itemsPerPage = 10

  // Permissions par rôle
  const canEdit = user?.role === 'admin' || user?.role === 'acheteur'
  const canCreate = user?.role === 'admin' || user?.role === 'planificateur'
  const canApprove = user?.role === 'admin' || user?.role === 'acheteur'
  const canSubmit = user?.role === 'admin' || user?.role === 'planificateur'
  const canLaunchTender = user?.role === 'admin' || user?.role === 'acheteur'

  useEffect(() => {
    fetchDemandes()
  }, [])

  const fetchDemandes = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/demandes', {
        params: { per_page: 100 }
      })
      
      let demandesData = []
      if (response.data.data && response.data.data.data) {
        demandesData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        demandesData = response.data.data
      }
      
      setDemandes(demandesData)
    } catch (error) {
      console.error('Erreur chargement demandes:', error)
      toast.error('Erreur lors du chargement des demandes')
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (demande) => {
    setSelectedDemande(demande)
    setShowDetailModal(true)
  }

  const openTenderModal = (demande) => {
    setSelectedDemande(demande)
    setTenderData({
      date_cloture: '',
      objet: `Appel d'offres pour ${demande.article?.designation}`
    })
    setShowTenderModal(true)
  }

  const handleTenderChange = (e) => {
    setTenderData({
      ...tenderData,
      [e.target.name]: e.target.value
    })
  }

  const createTender = async () => {
    if (!tenderData.date_cloture) {
      toast.error('Veuillez entrer une date de clôture')
      return
    }

    setCreatingTender(true)
    try {
      await axiosInstance.post('/appels-offres', {
        demande_achat_id: selectedDemande.id,
        date_cloture: tenderData.date_cloture,
        objet: tenderData.objet
      })
      toast.success('Appel d\'offres créé avec succès')
      setShowTenderModal(false)
      fetchDemandes()
    } catch (error) {
      console.error('Erreur création appel offres:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setCreatingTender(false)
    }
  }

  const handleSubmit = async (demandeId) => {
    try {
      await axiosInstance.post(`/demandes/${demandeId}/submit`)
      toast.success('Demande soumise avec succès')
      fetchDemandes()
    } catch (error) {
      console.error('Erreur soumission:', error)
      toast.error('Erreur lors de la soumission')
    }
  }

  const handleApprove = async (demandeId) => {
    setApproving(true)
    try {
      await axiosInstance.post(`/demandes/${demandeId}/approve`)
      toast.success('Demande approuvée avec succès')
      fetchDemandes()
    } catch (error) {
      console.error('Erreur approbation:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async (demandeId) => {
    if (window.confirm('Confirmer le rejet de cette demande ?')) {
      try {
        await axiosInstance.post(`/demandes/${demandeId}/reject`)
        toast.success('Demande rejetée')
        fetchDemandes()
      } catch (error) {
        console.error('Erreur rejet:', error)
        toast.error('Erreur lors du rejet')
      }
    }
  }

  const exportToExcel = () => {
    const exportData = filteredDemandes.map((demande, index) => ({
      '#': index + 1,
      'Article': demande.article?.designation || '-',
      'Code SAP': demande.article?.code_sap || '-',
      'Quantité': demande.quantite,
      'Date demande': demande.date_demande?.split('T')[0],
      'Date besoin': demande.date_besoin?.split('T')[0],
      'Urgence': demande.urgence,
      'Statut': demande.statut,
      'Demandeur': demande.user?.name || '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Demandes')
    XLSX.writeFile(wb, `demandes_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedStatut('')
    setSelectedUrgence('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const filteredDemandes = demandes.filter(demande => {
    const matchSearch = search === '' ||
      demande.article?.designation?.toLowerCase().includes(search.toLowerCase()) ||
      demande.article?.code_sap?.toLowerCase().includes(search.toLowerCase())
    
    const matchStatut = selectedStatut === '' || demande.statut === selectedStatut
    const matchUrgence = selectedUrgence === '' || demande.urgence === selectedUrgence
    
    return matchSearch && matchStatut && matchUrgence
  })

  const totalItems = filteredDemandes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDemandes = filteredDemandes.slice(startIndex, startIndex + itemsPerPage)

  const getStatutBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'secondary', text: 'Brouillon' },
      'soumise': { class: 'primary', text: 'Soumise' },
      'approuvee': { class: 'success', text: 'Approuvée' },
      'rejetee': { class: 'danger', text: 'Rejetée' },
      'en_appel_offres': { class: 'info', text: 'En appel d\'offres' },
      'transformee_en_commande': { class: 'success', text: 'Transformée en commande' }
    }
    const b = badges[statut] || { class: 'secondary', text: statut }
    return <span className={`badge bg-${b.class} bg-opacity-10 text-${b.class}`}>{b.text}</span>
  }

  const getUrgenceBadge = (urgence) => {
    const badges = {
      'basse': { class: 'secondary', text: 'Basse' },
      'moyenne': { class: 'primary', text: 'Moyenne' },
      'haute': { class: 'warning', text: 'Haute' },
      'critique': { class: 'danger', text: 'Critique' }
    }
    const u = badges[urgence] || { class: 'secondary', text: urgence }
    return <span className={`badge bg-${u.class} bg-opacity-10 text-${u.class}`}>{u.text}</span>
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
          <h4 className="fw-bold mb-1 text-primary">Demandes d'achat</h4>
          <p className="text-secondary small mb-0">Gestion des demandes d'achat</p>
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
          {canCreate && (
            <Link to="/demandes/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>Nouvelle demande
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
                    placeholder="Article ou Code SAP..."
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
                  <option value="brouillon">Brouillon</option>
                  <option value="soumise">Soumise</option>
                  <option value="approuvee">Approuvée</option>
                  <option value="rejetee">Rejetée</option>
                  <option value="en_appel_offres">En appel d'offres</option>
                  <option value="transformee_en_commande">Transformée en commande</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Urgence</label>
                <select 
                  className="form-select"
                  value={selectedUrgence}
                  onChange={(e) => setSelectedUrgence(e.target.value)}
                >
                  <option value="">Toutes urgences</option>
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
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

      {/* Tableau des demandes */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Article</th>
                  <th className="py-3">Code SAP</th>
                  <th className="py-3 text-center">Quantité</th>
                  <th className="py-3 text-center">Date besoin</th>
                  <th className="py-3 text-center">Urgence</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDemandes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune demande trouvée
                    </td>
                  </tr>
                ) : (
                  paginatedDemandes.map((demande, index) => (
                    <tr key={demande.id || index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{demande.article?.designation || '-'}</td>
                      <td className="py-3">{demande.article?.code_sap || '-'}</td>
                      <td className="py-3 text-center">{demande.quantite} {demande.article?.unite_mesure || ''}</td>
                      <td className="py-3 text-center">{demande.date_besoin?.split('T')[0] || '-'}</td>
                      <td className="py-3 text-center">{getUrgenceBadge(demande.urgence)}</td>
                      <td className="py-3 text-center">{getStatutBadge(demande.statut)}</td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {/* Voir détail - tous les rôles */}
                          <button
                            onClick={() => openDetailModal(demande)}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir détail"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          
                          {/* Soumettre - uniquement pour PI (statut brouillon) */}
                          {demande.statut === 'brouillon' && canSubmit && (
                            <button
                              onClick={() => handleSubmit(demande.id)}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Soumettre"
                            >
                              <i className="bi bi-send"></i>
                            </button>
                          )}
                          
                          {/* Approuver/Rejeter - uniquement pour Acheteur (statut soumise) */}
                          {demande.statut === 'soumise' && canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(demande.id)}
                                className="btn btn-sm btn-outline-success rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Approuver"
                                disabled={approving}
                              >
                                {approving ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-check-lg"></i>
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(demande.id)}
                                className="btn btn-sm btn-outline-danger rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Rejeter"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                          
                          {/* Lancer appel d'offres - uniquement pour Acheteur (statut approuvee et pas d'appel existant) */}
                          {demande.statut === 'approuvee' && canLaunchTender && !demande.appel_offre_id && (
                            <button
                              onClick={() => openTenderModal(demande)}
                              className="btn btn-sm btn-outline-info rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Lancer appel d'offres"
                            >
                              <i className="bi bi-megaphone"></i>
                            </button>
                          )}
                          
                          {/* Lien vers appel d'offres existant */}
                          {demande.appel_offre_id && (
                            <Link
                              to={`/appels-offres/${demande.appel_offre_id}`}
                              className="btn btn-sm btn-outline-secondary rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Voir appel d'offres"
                            >
                              <i className="bi bi-megaphone"></i>
                            </Link>
                          )}
                          
                          {/* Lien vers commande existante */}
                          {demande.commande_id && (
                            <Link
                              to={`/commandes/${demande.commande_id}`}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Voir commande"
                            >
                              <i className="bi bi-cart"></i>
                            </Link>
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
                Total: <strong>{totalItems}</strong> demandes | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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
      {showDetailModal && selectedDemande && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-file-text me-2"></i>
                  Détail de la demande
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedDemande.article?.designation}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Code SAP</small>
                      <p className="fw-semibold mb-0">{selectedDemande.article?.code_sap}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Quantité</small>
                      <p className="fw-semibold mb-0">{selectedDemande.quantite} {selectedDemande.article?.unite_mesure}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date demande</small>
                      <p className="fw-semibold mb-0">{selectedDemande.date_demande?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date besoin</small>
                      <p className="fw-semibold mb-0">{selectedDemande.date_besoin?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Urgence</small>
                      <p className="fw-semibold mb-0">{getUrgenceBadge(selectedDemande.urgence)}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Statut</small>
                      <p className="fw-semibold mb-0">{getStatutBadge(selectedDemande.statut)}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Demandeur</small>
                      <p className="fw-semibold mb-0">{selectedDemande.user?.name} ({selectedDemande.user?.role})</p>
                    </div>
                  </div>
                  {selectedDemande.appel_offre_id && (
                    <div className="col-12">
                      <div className="bg-light rounded-3 p-3">
                        <small className="text-muted">Appel d'offres associé</small>
                        <p className="fw-semibold mb-0">
                          <Link to={`/appels-offres/${selectedDemande.appel_offre_id}`} className="text-primary">
                            Voir l'appel d'offres N°{selectedDemande.appel_offre_id}
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDemande.commande_id && (
                    <div className="col-12">
                      <div className="bg-light rounded-3 p-3">
                        <small className="text-muted">Commande associée</small>
                        <p className="fw-semibold mb-0">
                          <Link to={`/commandes/${selectedDemande.commande_id}`} className="text-primary">
                            Voir la commande N°{selectedDemande.commande_id}
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}
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

      {/* Modal de création d'appel d'offres */}
      {showTenderModal && selectedDemande && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-info bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-info fw-bold">
                  <i className="bi bi-megaphone me-2"></i>
                  Lancer un appel d'offres
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowTenderModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-12">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedDemande.article?.designation}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Quantité</small>
                      <p className="fw-semibold mb-0">{selectedDemande.quantite}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Date de clôture <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="date_cloture"
                    className="form-control"
                    value={tenderData.date_cloture}
                    onChange={handleTenderChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Objet</label>
                  <input
                    type="text"
                    name="objet"
                    className="form-control"
                    value={tenderData.objet}
                    onChange={handleTenderChange}
                  />
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Une fois l'appel d'offres créé, les fournisseurs pourront soumettre leurs offres.
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowTenderModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-info px-4" 
                  onClick={createTender}
                  disabled={creatingTender}
                >
                  {creatingTender ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-megaphone me-2"></i>Lancer l'appel d'offres
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

export default DemandeList