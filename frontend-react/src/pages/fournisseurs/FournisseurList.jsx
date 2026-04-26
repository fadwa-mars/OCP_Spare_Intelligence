// src/pages/fournisseurs/FournisseurList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const FournisseurList = () => {
  const { user } = useAuth()
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFournisseur, setSelectedFournisseur] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const itemsPerPage = 10

  const canManage = user?.role === 'admin' || user?.role === 'acheteur'

  useEffect(() => {
    fetchFournisseurs()
  }, [])

  const fetchFournisseurs = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/fournisseurs', {
        params: { per_page: 100 }
      })
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setFournisseurs(data)
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
      toast.error('Erreur lors du chargement des fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedFournisseur) return
    
    setDeleting(true)
    try {
      await axiosInstance.delete(`/fournisseurs/${selectedFournisseur.id}`)
      toast.success('Fournisseur supprimé avec succès')
      setShowDeleteModal(false)
      fetchFournisseurs()
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
      setSelectedFournisseur(null)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredFournisseurs.map((f, index) => ({
      '#': index + 1,
      'Nom': f.nom,
      'Email': f.email_contact || '-',
      'Téléphone': f.telephone || '-',
      'Ville': f.adresse?.split(',')[0] || '-',
      'Score': f.score_global || 0,
      'Commandes': f.nb_commandes || 0,
      'Conformité': f.taux_conformite || 0,
      'Statut': f.est_actif ? 'Actif' : 'Inactif'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Fournisseurs')
    XLSX.writeFile(wb, `fournisseurs_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const resetFilters = () => {
    setSearch('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const filteredFournisseurs = fournisseurs.filter(f => {
    const matchSearch = search === '' ||
      f.nom?.toLowerCase().includes(search.toLowerCase()) ||
      f.email_contact?.toLowerCase().includes(search.toLowerCase()) ||
      f.telephone?.includes(search)
    return matchSearch
  })

  const totalItems = filteredFournisseurs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedFournisseurs = filteredFournisseurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  return (
    <div>
      {/* En-tête */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">Fournisseurs</h4>
          <p className="text-secondary small mb-0">Gestion des fournisseurs</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-secondary" onClick={exportToExcel}>
            <i className="bi bi-download me-2"></i>Exporter
          </button>
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-1"></i>Filtres
          </button>
          {canManage && (
            <Link to="/fournisseurs/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>Nouveau fournisseur
            </Link>
          )}
        </div>
      </div>

      {/* Panneau des filtres */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label small fw-semibold text-secondary">Recherche</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-secondary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Nom, email ou téléphone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
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

      {/* Tableau des fournisseurs */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Nom</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3">Score</th>
                  <th className="py-3 text-center">Commandes</th>
                  <th className="py-3 text-center">Conformité</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFournisseurs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucun fournisseur trouvé
                    </td>
                  </tr>
                ) : (
                  paginatedFournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{fournisseur.nom}</td>
                      <td className="py-3">
                        <div className="small">
                          {fournisseur.email_contact && (
                            <div><i className="bi bi-envelope me-1 text-muted"></i>{fournisseur.email_contact}</div>
                          )}
                          {fournisseur.telephone && (
                            <div><i className="bi bi-telephone me-1 text-muted"></i>{fournisseur.telephone}</div>
                          )}
                        </div>
                       </td>
                      <td className="py-3">{getScoreBadge(fournisseur.score_global)}</td>
                      <td className="py-3 text-center">{fournisseur.nb_commandes || 0}</td>
                      <td className="py-3 text-center">{fournisseur.taux_conformite || 0}%</td>
                      <td className="py-3 text-center">
                        {fournisseur.est_actif ? (
                          <span className="badge bg-success bg-opacity-10 text-success">Actif</span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger">Inactif</span>
                        )}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Link
                            to={`/fournisseurs/${fournisseur.id}`}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir détail"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          {canManage && (
                            <>
                              <Link
                                to={`/fournisseurs/edit/${fournisseur.id}`}
                                className="btn btn-sm btn-outline-warning rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Modifier"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedFournisseur(fournisseur)
                                  setShowDeleteModal(true)
                                }}
                                className="btn btn-sm btn-outline-danger rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
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
                Total: <strong>{totalItems}</strong> fournisseurs | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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
                  {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
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
          </div>
        )}
      </div>

      {/* Modal de confirmation suppression */}
      {showDeleteModal && selectedFournisseur && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmer la suppression
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-semibold">Êtes-vous sûr ?</h5>
                <p className="text-secondary mb-2">
                  Vous allez supprimer le fournisseur :<br />
                  <strong>{selectedFournisseur.nom}</strong>
                </p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  Cette action est irréversible.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-danger px-4" onClick={handleDelete} disabled={deleting}>
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>Confirmer
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

export default FournisseurList