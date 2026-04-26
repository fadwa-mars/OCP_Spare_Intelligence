// src/pages/fournisseur/AppelsOffres.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const AppelsOffres = () => {
  const { user } = useAuth()
  const [appels, setAppels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOffreModal, setShowOffreModal] = useState(false)
  const [selectedAppel, setSelectedAppel] = useState(null)
  const [offreData, setOffreData] = useState({
    prix_unitaire: '',
    delai_livraison: '',
    garantie: '',
    frais_livraison: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [myOffers, setMyOffers] = useState({})
  const itemsPerPage = 6

  useEffect(() => {
    fetchAppels()
    fetchMyOffers()
  }, [])

  const fetchAppels = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/fournisseur/appels-offres')
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

  const fetchMyOffers = async () => {
    try {
      const response = await axiosInstance.get('/fournisseur/mes-offres')
      let offersData = []
      if (response.data.data && Array.isArray(response.data.data)) {
        offersData = response.data.data
      }
      const offersMap = {}
      offersData.forEach(offer => {
        offersMap[offer.appel_offre_id] = offer
      })
      setMyOffers(offersMap)
    } catch (error) {
      console.error('Erreur chargement mes offres:', error)
    }
  }

  const openDetailModal = (appel) => {
    setSelectedAppel(appel)
    setShowDetailModal(true)
  }

  const openOffreModal = (appel) => {
    if (appel.statut !== 'publie') {
      toast.warning('Cet appel d\'offres n\'est pas ouvert aux soumissions')
      return
    }
    if (myOffers[appel.id]) {
      toast.warning('Vous avez déjà soumis une offre pour cet appel d\'offres')
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
      await axiosInstance.post(`/fournisseur/appels-offres/${selectedAppel.id}/offres`, {
        prix: offreData.prix_unitaire,
        delai_jours: offreData.delai_livraison,
        garantie: offreData.garantie || '12 mois',
        conditions_paiement: null,
        commentaires: null
      })
      toast.success('Offre soumise avec succès')
      setShowOffreModal(false)
      fetchAppels()
      fetchMyOffers()
    } catch (error) {
      console.error('Erreur soumission offre:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'secondary', text: 'Brouillon' },
      'publie': { class: 'primary', text: 'Publié' },
      'en_cours': { class: 'info', text: 'En cours' },
      'cloture': { class: 'warning', text: 'Clôturé' },
      'annule': { class: 'danger', text: 'Annulé' },
      'attribue': { class: 'success', text: 'Attribué' }
    }
    const b = badges[statut] || { class: 'secondary', text: statut }
    return <span className={`badge bg-${b.class} bg-opacity-10 text-${b.class}`}>{b.text}</span>
  }

  const filteredAppels = appels.filter(appel => {
    const matchSearch = search === '' ||
      appel.objet?.toLowerCase().includes(search.toLowerCase()) ||
      appel.demande_achat?.article?.designation?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const totalPages = Math.ceil(filteredAppels.length / itemsPerPage)
  const paginatedAppels = filteredAppels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
          <h4 className="fw-bold mb-1 text-primary">Appels d'offres disponibles</h4>
          <p className="text-secondary small mb-0">Consultez et soumettez vos offres</p>
        </div>
        <div className="mt-3 mt-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '250px' }}
          />
        </div>
      </div>

      {paginatedAppels.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-secondary"></i>
            <p className="text-secondary mt-2">Aucun appel d'offres disponible</p>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            {paginatedAppels.map((appel) => (
              <div className="col-md-6 col-lg-4 mb-4" key={appel.id}>
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-primary mb-0">{appel.objet?.substring(0, 40)}</h6>
                      {getStatutBadge(appel.statut)}
                    </div>
                    <p className="small text-secondary mb-2">
                      <i className="bi bi-box me-1"></i>
                      {appel.demande_achat?.article?.designation || 'Article non spécifié'}
                    </p>
                    <div className="mb-3">
                      <span className="badge bg-light text-dark me-2">
                        <i className="bi bi-sort-numeric-up me-1"></i>
                        Qté: {appel.demande_achat?.quantite || 0}
                      </span>
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-calendar me-1"></i>
                        Clôture: {appel.date_cloture?.split('T')[0]}
                      </span>
                    </div>
                    
                    {myOffers[appel.id] && (
                      <div className="alert alert-success py-1 px-2 mb-0 small">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Offre soumise le {new Date(myOffers[appel.id].created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-transparent border-0 pb-3">
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => openDetailModal(appel)}
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                      >
                        <i className="bi bi-eye me-1"></i>Détails
                      </button>
                      {appel.statut === 'publie' && !myOffers[appel.id] && (
                        <button
                          onClick={() => openOffreModal(appel)}
                          className="btn btn-success btn-sm flex-grow-1"
                        >
                          <i className="bi bi-send me-1"></i>Soumettre
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal Détail */}
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
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date lancement</small>
                      <p className="fw-semibold mb-0">{selectedAppel.date_lancement?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date clôture</small>
                      <p className="fw-semibold mb-0">{selectedAppel.date_cloture?.split('T')[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </button>
                {selectedAppel.statut === 'publie' && !myOffers[selectedAppel.id] && (
                  <button 
                    className="btn btn-success px-4"
                    onClick={() => {
                      setShowDetailModal(false)
                      openOffreModal(selectedAppel)
                    }}
                  >
                    <i className="bi bi-send me-2"></i>Soumettre une offre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Soumission Offre */}
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
                    type="text"
                    name="garantie"
                    className="form-control"
                    placeholder="Ex: 12 mois"
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
                  Quantité : <strong>{selectedAppel.demande_achat?.quantite}</strong> {selectedAppel.demande_achat?.article?.unite_mesure}
                  <br />
                  Montant total estimé : <strong>
                    {(parseFloat(offreData.prix_unitaire || 0) * (selectedAppel.demande_achat?.quantite || 0) + parseFloat(offreData.frais_livraison || 0)).toLocaleString()} DH
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
    </div>
  )
}

export default AppelsOffres