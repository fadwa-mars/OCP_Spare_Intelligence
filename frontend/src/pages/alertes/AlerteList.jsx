// src/pages/alertes/AlerteList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const AlerteList = () => {
  const { user } = useAuth()
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [showTreatModal, setShowTreatModal] = useState(false)
  const [selectedAlerte, setSelectedAlerte] = useState(null)
  const [treating, setTreating] = useState(false)
  const itemsPerPage = 10

  const canManage = user?.role === 'admin' || user?.role === 'acheteur' || user?.role === 'magasinier'

  useEffect(() => {
    fetchAlertes()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchAlertes, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlertes = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/alertes', {
        params: { per_page: 100 }
      })
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setAlertes(data)
    } catch (error) {
      console.error('Erreur chargement alertes:', error)
      toast.error('Erreur lors du chargement des alertes')
    } finally {
      setLoading(false)
    }
  }

  const handleTreat = async () => {
    if (!selectedAlerte) return
    
    setTreating(true)
    try {
      await axiosInstance.put(`/alertes/${selectedAlerte.id}/treat`)
      toast.success('Alerte traitée avec succès')
      setShowTreatModal(false)
      fetchAlertes()
    } catch (error) {
      console.error('Erreur traitement:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du traitement')
    } finally {
      setTreating(false)
      setSelectedAlerte(null)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredAlertes.map((a, index) => ({
      '#': index + 1,
      'Type': a.type,
      'Message': a.message,
      'Article': a.article?.designation || '-',
      'Niveau': a.niveau,
      'Statut': a.statut === 'traitee' ? 'Traitée' : 'En attente',
      'Date création': new Date(a.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Alertes')
    XLSX.writeFile(wb, `alertes_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedType('')
    setSelectedStatut('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const getTypeBadge = (type) => {
    const badges = {
      'stock': { class: 'info', text: 'Stock' },
      'seuil_min': { class: 'warning', text: 'Seuil minimum' },
      'rupture': { class: 'danger', text: 'Rupture' },
      'expiration': { class: 'secondary', text: 'Expiration' },
      'qualite': { class: 'purple', text: 'Qualité' }
    }
    const b = badges[type] || { class: 'secondary', text: type }
    return <span className={`badge bg-${b.class} bg-opacity-10 text-${b.class}`}>{b.text}</span>
  }

  const getNiveauBadge = (niveau) => {
    const badges = {
      'info': { class: 'info', text: 'Information' },
      'warning': { class: 'warning', text: 'Attention' },
      'critical': { class: 'danger', text: 'Critique' }
    }
    const b = badges[niveau] || { class: 'secondary', text: niveau }
    return <span className={`badge bg-${b.class} bg-opacity-10 text-${b.class}`}>{b.text}</span>
  }

  const filteredAlertes = alertes.filter(a => {
    const matchSearch = search === '' ||
      a.message?.toLowerCase().includes(search.toLowerCase()) ||
      a.article?.designation?.toLowerCase().includes(search.toLowerCase())
    
    const matchType = selectedType === '' || a.type === selectedType
    const matchStatut = selectedStatut === '' || a.statut === selectedStatut
    
    return matchSearch && matchType && matchStatut
  })

  const totalItems = filteredAlertes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedAlertes = filteredAlertes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const nonTraiteesCount = alertes.filter(a => a.statut !== 'traitee').length

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
          <h4 className="fw-bold mb-1 text-primary">
            Alertes
            {nonTraiteesCount > 0 && (
              <span className="badge bg-danger ms-2">{nonTraiteesCount} non traitées</span>
            )}
          </h4>
          <p className="text-secondary small mb-0">Gestion des alertes et notifications</p>
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
                    placeholder="Message ou article..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Type</label>
                <select 
                  className="form-select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="stock">Stock</option>
                  <option value="seuil_min">Seuil minimum</option>
                  <option value="rupture">Rupture</option>
                  <option value="expiration">Expiration</option>
                </select>
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
                  <option value="traitee">Traitée</option>
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

      {/* Résumé */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <h2 className="text-primary mb-0">{alertes.length}</h2>
            <small className="text-muted">Total alertes</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <h2 className="text-warning mb-0">{alertes.filter(a => a.niveau === 'warning' && a.statut !== 'traitee').length}</h2>
            <small className="text-muted">Alertes attention</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <h2 className="text-danger mb-0">{alertes.filter(a => a.niveau === 'critical' && a.statut !== 'traitee').length}</h2>
            <small className="text-muted">Alertes critiques</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <h2 className="text-success mb-0">{alertes.filter(a => a.statut === 'traitee').length}</h2>
            <small className="text-muted">Alertes traitées</small>
          </div>
        </div>
      </div>

      {/* Tableau des alertes */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3">Message</th>
                  <th className="py-3">Article</th>
                  <th className="py-3 text-center">Niveau</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Date</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlertes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune alerte trouvée
                    </td>
                  </tr>
                ) : (
                  paginatedAlertes.map((alerte) => (
                    <tr key={alerte.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3">{getTypeBadge(alerte.type)}</td>
                      <td className="py-3">
                        <div className="fw-semibold">{alerte.message}</div>
                        {alerte.description && (
                          <small className="text-muted">{alerte.description}</small>
                        )}
                       </td>
                      <td className="py-3">{alerte.article?.designation || '-'}</td>
                      <td className="py-3 text-center">{getNiveauBadge(alerte.niveau)}</td>
                      <td className="py-3 text-center">
                        {alerte.statut === 'traitee' ? (
                          <span className="badge bg-success bg-opacity-10 text-success">Traitée</span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning">En attente</span>
                        )}
                       </td>
                      <td className="py-3 text-center">
                        {new Date(alerte.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {alerte.statut !== 'traitee' && canManage && (
                            <button
                              onClick={() => {
                                setSelectedAlerte(alerte)
                                setShowTreatModal(true)
                              }}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Marquer comme traitée"
                            >
                              <i className="bi bi-check-lg"></i>
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
                Total: <strong>{totalItems}</strong> alertes | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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

      {/* Modal de confirmation traitement */}
      {showTreatModal && selectedAlerte && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-success bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-success fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Marquer comme traitée
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowTreatModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-bell-check text-success" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-semibold">Confirmer le traitement</h5>
                <p className="text-secondary mb-2">
                  Alerte : <strong>{selectedAlerte.message}</strong>
                </p>
                <p className="text-muted small">
                  Cette alerte sera marquée comme traitée.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowTreatModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-success px-4" 
                  onClick={handleTreat}
                  disabled={treating}
                >
                  {treating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Confirmer
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

export default AlerteList