// src/pages/articles/ArticleList.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const ArticleList = () => {
  const { user } = useAuth()
  const [allArticles, setAllArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [selectedStockFilter, setSelectedStockFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  
  // 🔥 MODIFICATION 1 : Changer le nombre d'articles par page (10, 20, 50 ou 100)
  const itemsPerPage = 10  // ← Change cette valeur selon ton besoin

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState(null)

  const canEdit = user?.role === 'admin' || user?.role === 'planificateur'

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = search !== '' || selectedCategorie !== '' || selectedStockFilter !== ''

  // Filtrage des articles
  const filteredArticles = allArticles.filter(article => {
    const matchSearch = search === '' || 
      article.code_sap?.toLowerCase().includes(search.toLowerCase()) ||
      article.designation?.toLowerCase().includes(search.toLowerCase())
    
    const matchCategorie = selectedCategorie === '' || article.categorie === selectedCategorie
    
    let matchStock = true
    const stockActuel = article.stock?.stock_actuel || 0
    const seuilMin = article.seuil_min || 0
    
    if (selectedStockFilter === 'critique') {
      matchStock = stockActuel <= seuilMin
    } else if (selectedStockFilter === 'normal') {
      matchStock = stockActuel > seuilMin
    } else if (selectedStockFilter === 'rupture') {
      matchStock = stockActuel === 0
    } else if (selectedStockFilter === 'faible') {
      matchStock = stockActuel > 0 && stockActuel <= seuilMin * 0.5
    }
    
    return matchSearch && matchCategorie && matchStock
  })

  // Extraire les catégories uniques
  useEffect(() => {
    if (allArticles.length > 0) {
      const uniqueCategories = [...new Set(allArticles.map(a => a.categorie).filter(c => c))]
      setCategories(uniqueCategories)
    }
  }, [allArticles])

  const totalItems = filteredArticles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategorie, selectedStockFilter])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      // 🔥 MODIFICATION 2 : per_page = 10000 pour récupérer TOUS les articles
      const response = await axiosInstance.get('/articles', {
        params: { per_page: 10000 }
      })
      
      let articlesData = []
      if (response.data.data && response.data.data.data) {
        articlesData = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        articlesData = response.data.data
      } else if (Array.isArray(response.data)) {
        articlesData = response.data
      }
      
      // 🔥 DEBUG : Vérifier dans la console le nombre d'articles chargés
      console.log(`✅ ${articlesData.length} articles chargés depuis l'API`)
      
      setAllArticles(articlesData)
    } catch (error) {
      console.error('Erreur chargement articles:', error)
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }

  // Export EXCEL
  const exportToExcel = () => {
    const exportData = filteredArticles.map((article, index) => ({
      '#': index + 1,
      'Code SAP': article.code_sap,
      'Désignation': article.designation,
      'Catégorie': article.categorie || '-',
      'Stock actuel': article.stock?.stock_actuel || 0,
      'Seuil minimum': article.seuil_min || 0,
      'Seuil sécurité': article.seuil_securite || 0,
      'Délai approvisionnement': article.delai_approvisionnement || 0,
      'Unité': article.unite_mesure || '-',
      'Statut': article.etat === 'actif' ? 'Actif' : 'Inactif'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Articles')
    XLSX.writeFile(wb, `articles_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
    setShowExportMenu(false)
  }

  // Télécharger le template d'import
  const downloadTemplate = () => {
    const template = [
      {
        'Code SAP': 'ROU-001',
        'Désignation': 'Roue de secours',
        'Catégorie': 'ROUES',
        'Unité': 'pièce',
        'Seuil minimum': 10,
        'Seuil sécurité': 5,
        'Délai': 15,
        'Statut': 'Actif'
      },
      {
        'Code SAP': 'CONV-002',
        'Désignation': 'Courroie de convoyeur',
        'Catégorie': 'CONVOYEURS',
        'Unité': 'mètre',
        'Seuil minimum': 20,
        'Seuil sécurité': 10,
        'Délai': 10,
        'Statut': 'Actif'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Articles')
    XLSX.writeFile(wb, 'template_import_articles.xlsx')
    toast.success('Template téléchargé')
  }

  const importFromExcel = async () => {
    if (!importFile) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    setImportLoading(true)
    try {
      const data = await importFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      let successCount = 0
      let errorCount = 0
      const errors = []

      const headers = Object.keys(jsonData[0] || {})
      console.log('En-têtes trouvés:', headers)

      for (const item of jsonData) {
        try {
          const codeSap = item['Code SAP'] || item.code_sap || item['CODE SAP'] || item['code_sap'] || item['Code'] || Object.values(item)[0]
          const designation = item['Désignation'] || item.designation || item['DESIGNATION'] || item.name || Object.values(item)[1]
          
          if (!codeSap || !designation) {
            errorCount++
            errors.push(`Ligne ${errorCount + successCount + 1}: Code SAP ou Désignation manquant`)
            continue
          }

          await axiosInstance.post('/articles', {
            code_sap: String(codeSap).trim(),
            designation: String(designation).trim(),
            categorie: item['Catégorie'] || item.categorie || item['CATEGORIE'] || '',
            unite_mesure: item['Unité'] || item.unite_mesure || item['UNITE'] || 'pièce',
            seuil_min: parseFloat(item['Seuil minimum'] || item.seuil_min || item['SEUIL_MIN'] || 10),
            seuil_securite: parseFloat(item['Seuil sécurité'] || item.seuil_securite || item['SEUIL_SECURITE'] || 5),
            delai_approvisionnement: parseInt(item['Délai'] || item.delai_approvisionnement || item['DELAI'] || 15),
            etat: (item['Statut'] || item.statut || item['STATUT'] || 'Actif') === 'Inactif' ? 'inactif' : 'actif'
          })
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`Ligne ${successCount + errorCount}: ${error.response?.data?.message || error.message}`)
        }
      }

      if (errors.length > 0) {
        console.error('Erreurs détaillées:', errors)
      }

      toast.success(`${successCount} articles importés, ${errorCount} erreurs`)
      if (errorCount > 0) {
        toast.warning(`Import partiel : ${errorCount} erreurs. Vérifiez la console pour les détails.`)
      }
      setShowImportModal(false)
      setImportFile(null)
      fetchArticles()
    } catch (error) {
      console.error('Erreur lecture fichier:', error)
      toast.error('Erreur lors de la lecture du fichier')
    } finally {
      setImportLoading(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedCategorie('')
    setSelectedStockFilter('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const openDeleteModal = (article) => {
    setArticleToDelete(article)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setArticleToDelete(null)
  }

  const confirmDelete = async () => {
    if (!articleToDelete) return
    
    try {
      await axiosInstance.delete(`/articles/${articleToDelete.id}`)
      toast.success('Article supprimé')
      closeDeleteModal()
      fetchArticles()
      setCurrentPage(1)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
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
          <h4 className="fw-bold mb-1 text-primary">Articles</h4>
          <p className="text-secondary small mb-0">Gestion des pièces de rechange</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <div className="dropdown">
            <button 
              className="btn btn-success dropdown-toggle"
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
            className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-1"></i>
            Filtres
            {hasActiveFilters && <span className="badge bg-white text-primary ms-2 rounded-pill" style={{ fontSize: '10px' }}>●</span>}
          </button>
          
          {canEdit && (
            <>
              <button 
                className="btn btn-warning"
                onClick={() => setShowImportModal(true)}
              >
                <i className="bi bi-upload me-1"></i>Importer
              </button>
              <Link to="/articles/new" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>Nouvel article
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Panneau des filtres */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Recherche</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-secondary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Code ou désignation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Catégorie</label>
                <select 
                  className="form-select"
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Situation stock</label>
                <select 
                  className="form-select"
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value)}
                >
                  <option value="">Tous les stocks</option>
                  <option value="critique">Stock critique (≤ seuil)</option>
                  <option value="faible">Stock faible (≤ 50% seuil)</option>
                  <option value="rupture">En rupture (stock = 0)</option>
                  <option value="normal">Stock normal (&gt; seuil)</option>
                </select>
              </div>
              
              <div className="col-md-3">
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

      {/* Badges des filtres actifs */}
      {hasActiveFilters && !showFilters && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">
            <i className="bi bi-funnel-fill me-1"></i>Filtres actifs :
          </span>
          {search && (
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
              Recherche : "{search}"
              <button className="btn-close btn-close-sm ms-2" onClick={() => setSearch('')} style={{ fontSize: '8px' }}></button>
            </span>
          )}
          {selectedCategorie && (
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
              Catégorie : {selectedCategorie}
              <button className="btn-close btn-close-sm ms-2" onClick={() => setSelectedCategorie('')}></button>
            </span>
          )}
          {selectedStockFilter && (
            <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
              Stock : {
                selectedStockFilter === 'critique' ? 'Critique (≤ seuil)' :
                selectedStockFilter === 'faible' ? 'Faible (≤ 50% seuil)' :
                selectedStockFilter === 'rupture' ? 'En rupture' : 'Normal (> seuil)'
              }
              <button className="btn-close btn-close-sm ms-2" onClick={() => setSelectedStockFilter('')}></button>
            </span>
          )}
        </div>
      )}

      {/* Tableau */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light"> 
                <tr>
                  <th className="py-3 px-3">Code SAP</th>
                  <th className="py-3">Désignation</th>
                  <th className="py-3">Catégorie</th>
                  <th className="py-3 text-center">Stock</th>
                  <th className="py-3 text-center">Seuil min</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucun article trouvé
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map((article, index) => (
                    <tr key={article.id || index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{article.code_sap}</td>
                      <td className="py-3">{article.designation}</td>
                      <td className="py-3">
                        <span className="badge bg-light text-secondary">{article.categorie || '-'}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`fw-semibold ${(article.stock?.stock_actuel || 0) <= (article.seuil_min || 0) ? 'text-danger' : ''}`}>
                          {article.stock?.stock_actuel || 0}
                        </span>
                      </td>
                      <td className="py-3 text-center">{article.seuil_min || 0}</td>
                      <td className="py-3 text-center">
                        <span className={`badge ${article.etat === 'actif' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${article.etat === 'actif' ? 'success' : 'secondary'}`}>
                          {article.etat === 'actif' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Link to={`/articles/${article.id}`} className="btn btn-sm btn-outline-primary rounded-circle" style={{ width: '32px', height: '32px' }} title="Voir">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {canEdit && (
                            <>
                              <Link to={`/articles/edit/${article.id}`} className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: '32px', height: '32px' }} title="Modifier">
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                onClick={() => openDeleteModal(article)}
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
                <i className="bi bi-database me-1"></i>
                Total: <strong>{totalItems}</strong> articles | Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(1)}>
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  {getVisiblePages().map((page, idx) => (
                    page === '...' ? (
                      <li key={`dots-${idx}`} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    ) : (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    )
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'import Excel */}
      {showImportModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-success bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-success fw-bold">
                  <i className="bi bi-upload me-2"></i>Importer des articles
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowImportModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i className="bi bi-file-earmark-excel text-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="text-secondary text-center mb-3">
                  Importez un fichier Excel (.xlsx) ou CSV contenant les articles
                </p>
                
                <div className="border rounded-3 p-3 text-center bg-light">
                  <input
                    type="file"
                    id="importFile"
                    className="d-none"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                  />
                  <label htmlFor="importFile" className="btn btn-outline-primary">
                    <i className="bi bi-folder2-open me-1"></i>
                    Choisir un fichier
                  </label>
                  {importFile && (
                    <div className="mt-2 text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      {importFile.name}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <button 
                    className="btn btn-link text-primary p-0"
                    onClick={downloadTemplate}
                  >
                    <i className="bi bi-download me-1"></i>
                    Télécharger le template Excel
                  </button>
                </div>

                <div className="alert alert-info mt-3 small">
                  <i className="bi bi-info-circle me-1"></i>
                  Colonnes attendues : Code SAP, Désignation, Catégorie, Unité, Seuil minimum, Seuil sécurité, Délai, Statut
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowImportModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-success px-4" 
                  onClick={importFromExcel}
                  disabled={!importFile || importLoading}
                >
                  {importLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Import...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>Importer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-danger bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmation de suppression
                </h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-trash3-fill text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Êtes-vous sûr ?</h5>
                <p>Supprimer l'article : <strong>{articleToDelete?.designation}</strong></p>
                <p className="text-danger small">Action irréversible !</p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={closeDeleteModal}>Annuler</button>
                <button className="btn btn-danger px-4" onClick={confirmDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleList