// src/pages/stocks/StockList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const StockList = () => {
  const { user } = useAuth()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [movementData, setMovementData] = useState({
    type: 'sortie',
    quantite: '',
    commentaire: ''
  })
  const [movementLoading, setMovementLoading] = useState(false)
  const itemsPerPage = 10

  const canEdit = user?.role === 'admin' || user?.role === 'magasinier'
  const canView = user?.role === 'planificateur' || user?.role === 'acheteur'

  // Filtrage des stocks
  const filteredStocks = stocks.filter(stock => {
    const matchSearch = search === '' ||
      stock.article?.code_sap?.toLowerCase().includes(search.toLowerCase()) ||
      stock.article?.designation?.toLowerCase().includes(search.toLowerCase())
    
    const matchCategorie = selectedCategorie === '' || stock.article?.categorie === selectedCategorie
    
    return matchSearch && matchCategorie
  })

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    if (stocks.length > 0) {
      const uniqueCategories = [...new Set(stocks.map(s => s.article?.categorie).filter(c => c))]
      setCategories(uniqueCategories)
    }
  }, [stocks])

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/stocks', {
        params: { per_page: 100 }
      })
      
      let stocksData = []
      if (response.data.data && response.data.data.data) {
        stocksData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        stocksData = response.data.data
      } else if (Array.isArray(response.data)) {
        stocksData = response.data
      }
      
      setStocks(stocksData)
    } catch (error) {
      console.error('Erreur chargement stocks:', error)
      toast.error('Erreur lors du chargement des stocks')
    } finally {
      setLoading(false)
    }
  }

  const openMovementModal = (stock) => {
    setSelectedStock(stock)
    setMovementData({ type: 'sortie', quantite: '', commentaire: '' })
    setShowMovementModal(true)
  }

  const handleMovementChange = (e) => {
    setMovementData({
      ...movementData,
      [e.target.name]: e.target.value
    })
  }

  const submitMovement = async () => {
    if (!movementData.quantite || movementData.quantite <= 0) {
      toast.error('Veuillez entrer une quantite valide')
      return
    }

    if (movementData.type === 'sortie' && movementData.quantite > selectedStock.stock_actuel) {
      toast.error('Stock insuffisant')
      return
    }

    setMovementLoading(true)
    try {
      await axiosInstance.post('/stocks/movement', {
        article_id: selectedStock.article_id,
        type_mouvement: movementData.type,
        quantite: movementData.quantite,
        commentaire: movementData.commentaire
      })
      toast.success('Mouvement de stock effectue')
      setShowMovementModal(false)
      fetchStocks()
    } catch (error) {
      console.error('Erreur mouvement:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du mouvement')
    } finally {
      setMovementLoading(false)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredStocks.map((stock, index) => ({
      '#': index + 1,
      'Code SAP': stock.article?.code_sap || '-',
      'Designation': stock.article?.designation || '-',
      'Categorie': stock.article?.categorie || '-',
      'Stock actuel': stock.stock_actuel || 0,
      'Stock reserve': stock.stock_reserve || 0,
      'Stock disponible': stock.stock_disponible || 0,
      'Seuil minimum': stock.article?.seuil_min || 0,
      'Statut': stock.stock_actuel <= (stock.article?.seuil_min || 0) ? 'Critique' : 'Normal',
      'Emplacement': stock.emplacement || '-',
      'Dernier mouvement': stock.date_dernier_mouvement || '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Stocks')
    XLSX.writeFile(wb, `stocks_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel reussi')
    setShowExportMenu(false)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedCategorie('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const totalItems = filteredStocks.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage)

  const getStockStatus = (stock) => {
    const seuil = stock.article?.seuil_min || 0
    if (stock.stock_actuel <= 0) return { label: 'Rupture', class: 'danger' }
    if (stock.stock_actuel <= seuil) return { label: 'Critique', class: 'warning' }
    return { label: 'Normal', class: 'success' }
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
      {/* En-tete */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">Gestion des stocks</h4>
          <p className="text-secondary small mb-0">Visualisation et mouvements de stock</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <i className="bi bi-download me-2"></i>Exporter
            </button>
            {showExportMenu && (
              <div className="dropdown-menu show p-2 shadow-sm" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                <button onClick={exportToExcel} className="dropdown-item rounded-2 mb-1">
                  <i className="bi bi-file-earmark-excel text-success me-2"></i>
                  Export Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-1"></i>
            Filtres
          </button>
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
                    placeholder="Code SAP ou designation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-semibold text-secondary">Categorie</label>
                <select 
                  className="form-select"
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                >
                  <option value="">Toutes les categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
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

      {/* Tableau des stocks */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Code SAP</th>
                  <th className="py-3">Designation</th>
                  <th className="py-3">Categorie</th>
                  <th className="py-3 text-center">Stock</th>
                  <th className="py-3 text-center">Reserve</th>
                  <th className="py-3 text-center">Disponible</th>
                  <th className="py-3 text-center">Seuil</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucun stock trouve
                    </td>
                  </tr>
                ) : (
                  paginatedStocks.map((stock, index) => {
                    const status = getStockStatus(stock)
                    return (
                      <tr key={stock.id || index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td className="py-3 px-3 fw-semibold">{stock.article?.code_sap || '-'}</td>
                        <td className="py-3">{stock.article?.designation || '-'}</td>
                        <td className="py-3">
                          <span className="badge bg-light text-secondary">{stock.article?.categorie || '-'}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`fw-semibold ${status.class === 'danger' ? 'text-danger' : status.class === 'warning' ? 'text-warning' : 'text-success'}`}>
                            {stock.stock_actuel || 0}
                          </span>
                        </td>
                        <td className="py-3 text-center">{stock.stock_reserve || 0}</td>
                        <td className="py-3 text-center">{stock.stock_disponible || 0}</td>
                        <td className="py-3 text-center">{stock.article?.seuil_min || 0}</td>
                        <td className="py-3 text-center">
                          <span className={`badge bg-${status.class === 'danger' ? 'danger' : status.class === 'warning' ? 'warning' : 'success'} bg-opacity-10 text-${status.class === 'danger' ? 'danger' : status.class === 'warning' ? 'warning' : 'success'}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {canEdit && (
                            <button
                              onClick={() => openMovementModal(stock)}
                              className="btn btn-sm btn-outline-primary rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Mouvement de stock"
                            >
                              <i className="bi bi-arrow-left-right"></i>
                            </button>
                          )}
                          <Link
                            to={`/articles/${stock.article_id}`}
                            className="btn btn-sm btn-outline-secondary rounded-circle ms-1"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir l'article"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
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
                Total: <strong>{totalItems}</strong> stocks | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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

      {/* Modal de mouvement de stock */}
      {showMovementModal && selectedStock && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Mouvement de stock
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowMovementModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedStock.article?.designation}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Stock actuel</small>
                      <p className="fw-semibold mb-0 text-primary">{selectedStock.stock_actuel} {selectedStock.article?.unite_mesure}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Type de mouvement</label>
                  <select
                    name="type"
                    className="form-select"
                    value={movementData.type}
                    onChange={handleMovementChange}
                  >
                    <option value="sortie">Sortie (retrait du stock)</option>
                    <option value="entree">Entree (ajout au stock)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Quantite</label>
                  <input
                    type="number"
                    name="quantite"
                    className="form-control"
                    placeholder="Quantite"
                    value={movementData.quantite}
                    onChange={handleMovementChange}
                    step="0.01"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Commentaire (optionnel)</label>
                  <textarea
                    name="commentaire"
                    className="form-control"
                    rows="2"
                    placeholder="Motif du mouvement..."
                    value={movementData.commentaire}
                    onChange={handleMovementChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowMovementModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-primary px-4" 
                  onClick={submitMovement}
                  disabled={movementLoading}
                >
                  {movementLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Valider
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

export default StockList