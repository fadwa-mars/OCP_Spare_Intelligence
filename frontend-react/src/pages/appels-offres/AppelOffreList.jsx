// src/pages/appels-offres/AppelOffreList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const AppelOffreList = () => {
  const { user } = useAuth()
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOffreModal, setShowOffreModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedAppel, setSelectedAppel] = useState(null)
  const [appelToClose, setAppelToClose] = useState(null)
  const [offreData, setOffreData] = useState({
    prix_unitaire: '',
    delai_livraison: '',
    garantie: '',
    frais_livraison: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const itemsPerPage = 10

  // Permissions par rôle
  const canManage = user?.role === 'admin' || user?.role === 'acheteur'
  const canSubmitOffer = user?.role === 'admin' || user?.role === 'fournisseur'

  useEffect(() => {
    fetchAppels()
  }, [])

  const fetchAppels = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/appels-offres', {
        params: { per_page: 100 }
      })
      
      let appelsData = []
      if (response.data.data && response.data.data.data) {
        appelsData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        appelsData = response.data.data
      }
      
      setAppels(appelsData)
    } catch (error) {
      console.error('Erreur chargement appels:', error)
      toast.error('Erreur lors du chargement des appels d\'offres')
    } finally {
      setLoading(false)
    }
  }

  // CORRECTION ICI : Recharger les détails complets depuis l'API
  const openDetailModal = async (appel) => {
    setLoadingDetail(true)
    try {
      const response = await axiosInstance.get(`/appels-offres/${appel.id}`)
      setSelectedAppel(response.data.data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Erreur chargement détail:', error)
      toast.error('Erreur lors du chargement des détails')
    } finally {
      setLoadingDetail(false)
    }
  }

  const openOffreModal = (appel) => {
    if (appel.statut !== 'publie') {
      toast.warning('Cet appel d\'offres n\'est pas ouvert aux soumissions')
      return
    }
    setSelectedAppel(appel)
    setOffreData({
      prix_unitaire: '',
      delai_livraison: '',
      garantie: '',
      frais_livraison: ''
    })
    setShowOffreModal(true)
  }

  const openCloseModal = (appel) => {
    setAppelToClose(appel)
    setShowCloseModal(true)
  }

  const handleOffreChange = (e) => {
    setOffreData({
      ...offreData,
      [e.target.name]: e.target.value
    })
  }

  const submitOffre = async () => {
    if (!offreData.prix_unitaire || offreData.prix_unitaire <= 0) {
      toast.error('Veuillez entrer un prix unitaire valide')
      return
    }
    if (!offreData.delai_livraison || offreData.delai_livraison <= 0) {
      toast.error('Veuillez entrer un délai de livraison valide')
      return
    }

    setSubmitting(true)
    try {
      await axiosInstance.post('/offres', {
        appel_offre_id: selectedAppel.id,
        prix_unitaire: offreData.prix_unitaire,
        delai_livraison: offreData.delai_livraison,
        garantie: offreData.garantie || null,
        frais_livraison: offreData.frais_livraison || 0
      })
      toast.success('Offre soumise avec succès')
      setShowOffreModal(false)
      fetchAppels()
    } catch (error) {
      console.error('Erreur soumission offre:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmClose = async () => {
    if (!appelToClose) return

    setClosing(true)
    try {
      await axiosInstance.post(`/appels-offres/${appelToClose.id}/close`)
      toast.success('Appel d\'offres clôturé')
      setShowCloseModal(false)
      fetchAppels()
    } catch (error) {
      console.error('Erreur clôture:', error)
      toast.error('Erreur lors de la clôture')
    } finally {
      setClosing(false)
      setAppelToClose(null)
    }
  }

  const handleSelectWinner = async (appelId, offreId) => {
    if (window.confirm('Confirmer la sélection de cette offre comme gagnante ? Une commande sera automatiquement créée.')) {
      try {
        const response = await axiosInstance.post(`/appels-offres/${appelId}/select-winner`, { offre_id: offreId })
        toast.success('Offre gagnante sélectionnée. La commande a été créée automatiquement.')
        fetchAppels()
        if (response.data.commande_id) {
          setTimeout(() => {
            window.location.href = `/commandes/${response.data.commande_id}`
          }, 1500)
        }
      } catch (error) {
        console.error('Erreur sélection:', error)
        toast.error(error.response?.data?.message || 'Erreur lors de la sélection')
      }
    }
  }

  const exportToExcel = () => {
    const exportData = filteredAppels.map((appel, index) => ({
      '#': index + 1,
      'Objet': appel.objet,
      'Article': appel.demande_achat?.article?.designation || '-',
      'Quantité': appel.demande_achat?.quantite || '-',
      'Date lancement': appel.date_lancement?.split('T')[0],
      'Date clôture': appel.date_cloture?.split('T')[0],
      'Statut': appel.statut,
      'Nb offres': appel.offres?.length || 0
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'AppelsOffres')
    XLSX.writeFile(wb, `appels_offres_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedStatut('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const filteredAppels = appels.filter(appel => {
    const matchSearch = search === '' ||
      appel.objet?.toLowerCase().includes(search.toLowerCase()) ||
      appel.demande_achat?.article?.designation?.toLowerCase().includes(search.toLowerCase())
    
    const matchStatut = selectedStatut === '' || appel.statut === selectedStatut
    
    return matchSearch && matchStatut
  })

  const totalItems = filteredAppels.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAppels = filteredAppels.slice(startIndex, startIndex + itemsPerPage)

  const getStatutBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'secondary', text: 'Brouillon' },
      'publie': { class: 'primary', text: 'Publié' },
      'en_cursos': { class: 'info', text: 'En cours' },
      'cloture': { class: 'warning', text: 'Clôturé' },
      'annule': { class: 'danger', text: 'Annulé' },
      'attribue': { class: 'success', text: 'Attribué' }
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
          <h4 className="fw-bold mb-1 text-primary">Appels d'offres</h4>
          <p className="text-secondary small mb-0">Gestion des appels d'offres</p>
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
          {canManage && (
            <Link to="/appels-offres/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>Nouvel appel d'offres
            </Link>
          )}
        </div>
      </div>

      {/* Panneau des filtres */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label small fw-semibold text-secondary">Recherche</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-secondary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Objet ou article..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-semibold text-secondary">Statut</label>
                <select 
                  className="form-select"
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                  <option value="en_cours">En cours</option>
                  <option value="cloture">Clôturé</option>
                  <option value="annule">Annulé</option>
                  <option value="attribue">Attribué</option>
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

      {/* Tableau des appels d'offres */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Objet</th>
                  <th className="py-3">Article</th>
                  <th className="py-3 text-center">Date lancement</th>
                  <th className="py-3 text-center">Date clôture</th>
                  <th className="py-3 text-center">Offres</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppels.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucun appel d'offres trouvé
                    </td>
                  </tr>
                ) : (
                  paginatedAppels.map((appel, index) => (
                    <tr key={appel.id || index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{appel.objet || '-'}</td>
                      <td className="py-3">{appel.demande_achat?.article?.designation || '-'}</td>
                      <td className="py-3 text-center">{appel.date_lancement?.split('T')[0] || '-'}</td>
                      <td className="py-3 text-center">{appel.date_cloture?.split('T')[0] || '-'}</td>
                      <td className="py-3 text-center">
                        <span className="badge bg-light text-secondary">{appel.offres?.length || 0}</span>
                      </td>
                      <td className="py-3 text-center">{getStatutBadge(appel.statut)}</td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            onClick={() => openDetailModal(appel)}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir détail"
                            disabled={loadingDetail}
                          >
                            {loadingDetail ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-eye"></i>}
                          </button>
                          
                          {appel.statut === 'publie' && canSubmitOffer && (
                            <button
                              onClick={() => openOffreModal(appel)}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Soumettre une offre"
                            >
                              <i className="bi bi-send"></i>
                            </button>
                          )}
                          
                          {appel.statut === 'publie' && canManage && (
                            <button
                              onClick={() => openCloseModal(appel)}
                              className="btn btn-sm btn-outline-warning rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Clôturer"
                            >
                              <i className="bi bi-lock"></i>
                            </button>
                          )}
                          
                          {appel.statut === 'cloture' && canManage && (
                            <Link
                              to={`/appels-offres/${appel.id}/selection`}
                              className="btn btn-sm btn-outline-info rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Sélectionner l'offre gagnante"
                            >
                              <i className="bi bi-trophy"></i>
                            </Link>
                          )}
                          
                          {appel.commande_id && (
                            <Link
                              to={`/commandes/${appel.commande_id}`}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Voir la commande"
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

        {totalPages > 1 && (
          <div className="card-footer bg-transparent border-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-secondary">
                <i className="bi bi-database me-1"></i>
                Total: <strong>{totalItems}</strong> appels | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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
      {showDetailModal && selectedAppel && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-megaphone me-2"></i>
                  Détail de l'appel d'offres
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Objet</small>
                      <p className="fw-semibold mb-0">{selectedAppel.objet}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedAppel.demande_achat?.article?.designation}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Quantité</small>
                      <p className="fw-semibold mb-0">{selectedAppel.demande_achat?.quantite} {selectedAppel.demande_achat?.article?.unite_mesure}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date lancement</small>
                      <p className="fw-semibold mb-0">{selectedAppel.date_lancement?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date clôture</small>
                      <p className="fw-semibold mb-0">{selectedAppel.date_cloture?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Statut</small>
                      <p className="fw-semibold mb-0">{getStatutBadge(selectedAppel.statut)}</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Offres reçues ({selectedAppel.offres?.length || 0})</small>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-borderless mb-0">
                          <thead>
                            <tr>
                              <th>Fournisseur</th>
                              <th className="text-center">Prix unitaire</th>
                              <th className="text-center">Délai (jours)</th>
                              <th className="text-center">Garantie</th>
                              <th className="text-end">Montant total</th>
                              {canManage && selectedAppel.statut === 'cloture' && <th className="text-center">Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedAppel.offres?.map((offre, idx) => (
                              <tr key={idx}>
                                <td>{offre.fournisseur?.nom}</td>
                                <td className="text-center">{offre.prix_unitaire} DH</td>
                                <td className="text-center">{offre.delai_livraison}</td>
                                <td className="text-center">{offre.garantie || '-'}</td>
                                <td className="text-end">
                                  {((Number(offre.prix_unitaire) || 0) * (Number(selectedAppel.demande_achat?.quantite) || 0) + (Number(offre.frais_livraison) || 0)).toLocaleString()} DH
                                </td>
                                {canManage && selectedAppel.statut === 'cloture' && (
                                  <td className="text-center">
                                    <button
                                      onClick={() => handleSelectWinner(selectedAppel.id, offre.id)}
                                      className="btn btn-sm btn-outline-success rounded-circle"
                                      style={{ width: '32px', height: '32px' }}
                                      title="Sélectionner cette offre"
                                    >
                                      <i className="bi bi-trophy"></i>
                                    </button>
                                  </td>
                                )}
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

      {/* Modal de soumission d'offre */}
      {showOffreModal && selectedAppel && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-success bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-success fw-bold">
                  <i className="bi bi-send me-2"></i>
                  Soumettre une offre
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowOffreModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-12">
                      <small className="text-muted">Objet</small>
                      <p className="fw-semibold mb-0">{selectedAppel.objet}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedAppel.demande_achat?.article?.designation}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Quantité</small>
                      <p className="fw-semibold mb-0">{selectedAppel.demande_achat?.quantite}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Prix unitaire (DH) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    name="prix_unitaire"
                    className="form-control"
                    placeholder="Prix unitaire"
                    value={offreData.prix_unitaire}
                    onChange={handleOffreChange}
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Délai de livraison (jours) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    name="delai_livraison"
                    className="form-control"
                    placeholder="Délai en jours"
                    value={offreData.delai_livraison}
                    onChange={handleOffreChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Garantie (mois)</label>
                  <input
                    type="number"
                    name="garantie"
                    className="form-control"
                    placeholder="Garantie en mois"
                    value={offreData.garantie}
                    onChange={handleOffreChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Frais de livraison (DH)</label>
                  <input
                    type="number"
                    name="frais_livraison"
                    className="form-control"
                    placeholder="Frais de livraison"
                    value={offreData.frais_livraison}
                    onChange={handleOffreChange}
                    step="0.01"
                  />
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Quantité demandée : <strong>{selectedAppel.demande_achat?.quantite}</strong> {selectedAppel.demande_achat?.article?.unite_mesure}
                  <br />
                  Montant total estimé : <strong>
                    {((Number(offreData.prix_unitaire) || 0) * (Number(selectedAppel.demande_achat?.quantite) || 0) + (Number(offreData.frais_livraison) || 0)).toLocaleString()} DH
                  </strong>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowOffreModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-success px-4" 
                  onClick={submitOffre}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>Soumettre l'offre
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de clôture */}
      {showCloseModal && appelToClose && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-warning bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-warning fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmer la clôture
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCloseModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-lock-fill text-warning" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-semibold">Êtes-vous sûr ?</h5>
                <p className="text-secondary mb-2">
                  Vous allez clôturer l'appel d'offres :<br />
                  <strong>{appelToClose.objet}</strong>
                </p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  Après clôture, plus aucune offre ne pourra être soumise.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowCloseModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-warning px-4" 
                  onClick={confirmClose}
                  disabled={closing}
                >
                  {closing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Clôture...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock me-2"></i>Confirmer la clôture
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

export default AppelOffreList