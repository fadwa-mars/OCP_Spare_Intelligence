// src/pages/simulations/SimulationList.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const SimulationList = () => {
  const { user } = useAuth()
  const [simulations, setSimulations] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedSimulation, setSelectedSimulation] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    type: 'whatif',
    article_id: '',
    parametres: {
      variation_prix: 0,
      variation_demande: 0,
      variation_delai: 0,
      nouveau_seuil_min: null,
      nouveau_seuil_securite: null
    }
  })

  const canManage = user?.role === 'admin' || user?.role === 'planificateur'

  useEffect(() => {
    fetchSimulations()
    fetchArticles()
  }, [])

  const fetchSimulations = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/simulations')
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setSimulations(data)
    } catch (error) {
      console.error('Erreur chargement simulations:', error)
      toast.error('Erreur lors du chargement des simulations')
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const response = await axiosInstance.get('/articles', {
        params: { per_page: 100 }
      })
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setArticles(data)
    } catch (error) {
      console.error('Erreur chargement articles:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleParamChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      parametres: {
        ...prev.parametres,
        [name]: parseFloat(value) || 0
      }
    }))
  }

  const createSimulation = async () => {
    if (!formData.nom || !formData.article_id) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setExecuting(true)
    try {
      const response = await axiosInstance.post('/simulations', {
        nom: formData.nom,
        type: formData.type,
        article_id: formData.article_id,
        parametres: formData.parametres
      })
      toast.success('Simulation créée avec succès')
      setShowCreateModal(false)
      setFormData({
        nom: '',
        type: 'whatif',
        article_id: '',
        parametres: {
          variation_prix: 0,
          variation_demande: 0,
          variation_delai: 0,
          nouveau_seuil_min: null,
          nouveau_seuil_securite: null
        }
      })
      fetchSimulations()
    } catch (error) {
      console.error('Erreur création:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setExecuting(false)
    }
  }

  const executeSimulation = async (simulation) => {
    setExecuting(true)
    try {
      const response = await axiosInstance.post(`/simulations/${simulation.id}/execute`)
      toast.success('Simulation exécutée avec succès')
      setResultData(response.data.data)
      setSelectedSimulation(simulation)
      setShowResultModal(true)
      fetchSimulations()
    } catch (error) {
      console.error('Erreur exécution:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'exécution')
    } finally {
      setExecuting(false)
    }
  }

  const duplicateSimulation = async (simulation) => {
    try {
      const response = await axiosInstance.post(`/simulations/${simulation.id}/duplicate`)
      toast.success('Simulation dupliquée avec succès')
      fetchSimulations()
    } catch (error) {
      console.error('Erreur duplication:', error)
      toast.error('Erreur lors de la duplication')
    }
  }

  const deleteSimulation = async (id) => {
    if (window.confirm('Confirmer la suppression de cette simulation ?')) {
      try {
        await axiosInstance.delete(`/simulations/${id}`)
        toast.success('Simulation supprimée')
        fetchSimulations()
      } catch (error) {
        console.error('Erreur suppression:', error)
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const exportToExcel = () => {
    const exportData = simulations.map((sim, index) => ({
      '#': index + 1,
      'Nom': sim.nom,
      'Type': sim.type === 'whatif' ? 'What-If' : 'Optimisation',
      'Article': sim.article?.designation,
      'Statut': sim.statut === 'completed' ? 'Complété' : (sim.statut === 'running' ? 'En cours' : 'En attente'),
      'Date création': new Date(sim.created_at).toLocaleDateString(),
      'Résultat': sim.resultat ? `${sim.resultat.nouveau_stock || '-'}` : '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Simulations')
    XLSX.writeFile(wb, `simulations_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { class: 'secondary', text: 'En attente' },
      'running': { class: 'info', text: 'En cours' },
      'completed': { class: 'success', text: 'Complété' },
      'failed': { class: 'danger', text: 'Échoué' }
    }
    const b = badges[status] || { class: 'secondary', text: status }
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
          <h4 className="fw-bold mb-1 text-primary">
            <i className="bi bi-cpu me-2"></i>
            Simulations
          </h4>
          <p className="text-secondary small mb-0">Simulations What-If et optimisation des stocks</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-secondary" onClick={exportToExcel}>
            <i className="bi bi-download me-2"></i>Exporter
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>Nouvelle simulation
            </button>
          )}
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-cpu text-primary" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{simulations.length}</h3>
            <small className="text-muted">Total simulations</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{simulations.filter(s => s.statut === 'completed').length}</h3>
            <small className="text-muted">Simulations complétées</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{simulations.filter(s => s.statut === 'pending').length}</h3>
            <small className="text-muted">En attente</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-arrow-repeat text-info" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{simulations.filter(s => s.statut === 'running').length}</h3>
            <small className="text-muted">En cours</small>
          </div>
        </div>
      </div>

      {/* Tableau des simulations */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Nom</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Article</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Date création</th>
                  <th className="py-3 text-center">Dernière exécution</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {simulations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune simulation trouvée
                      {canManage && (
                        <div className="mt-3">
                          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                            <i className="bi bi-plus-lg me-1"></i>Créer une simulation
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  simulations.map((sim) => (
                    <tr key={sim.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{sim.nom}</td>
                      <td className="py-3">
                        {sim.type === 'whatif' ? (
                          <span className="badge bg-info bg-opacity-10 text-info">What-If</span>
                        ) : (
                          <span className="badge bg-primary bg-opacity-10 text-primary">Optimisation</span>
                        )}
                      </td>
                      <td className="py-3">{sim.article?.designation || '-'}</td>
                      <td className="py-3 text-center">{getStatusBadge(sim.statut)}</td>
                      <td className="py-3 text-center">{new Date(sim.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-center">
                        {sim.last_executed_at ? new Date(sim.last_executed_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {sim.statut !== 'running' && (
                            <button
                              onClick={() => executeSimulation(sim)}
                              className="btn btn-sm btn-outline-success rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Exécuter"
                              disabled={executing}
                            >
                              <i className="bi bi-play-fill"></i>
                            </button>
                          )}
                          <button
                            onClick={() => duplicateSimulation(sim)}
                            className="btn btn-sm btn-outline-info rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Dupliquer"
                          >
                            <i className="bi bi-files"></i>
                          </button>
                          <button
                            onClick={() => deleteSimulation(sim.id)}
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Supprimer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal création simulation */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-plus-circle me-2"></i>
                  Nouvelle simulation
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Nom de la simulation <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="nom"
                      className="form-control"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Ex: Simulation stock sécurité"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Type de simulation</label>
                    <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                      <option value="whatif">What-If (Scénario)</option>
                      <option value="optimisation">Optimisation</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Article <span className="text-danger">*</span></label>
                    <select name="article_id" className="form-select" value={formData.article_id} onChange={handleChange}>
                      <option value="">Sélectionner un article</option>
                      {articles.map(article => (
                        <option key={article.id} value={article.id}>
                          {article.code_sap} - {article.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-semibold text-primary mb-3">Paramètres de simulation</h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Variation prix (%)</label>
                    <input
                      type="number"
                      name="variation_prix"
                      className="form-control"
                      value={formData.parametres.variation_prix}
                      onChange={handleParamChange}
                      step="5"
                    />
                    <small className="text-muted">Ex: +10 pour augmentation de 10%</small>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Variation demande (%)</label>
                    <input
                      type="number"
                      name="variation_demande"
                      className="form-control"
                      value={formData.parametres.variation_demande}
                      onChange={handleParamChange}
                      step="5"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Variation délai (%)</label>
                    <input
                      type="number"
                      name="variation_delai"
                      className="form-control"
                      value={formData.parametres.variation_delai}
                      onChange={handleParamChange}
                      step="5"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nouveau seuil minimum</label>
                    <input
                      type="number"
                      name="nouveau_seuil_min"
                      className="form-control"
                      value={formData.parametres.nouveau_seuil_min || ''}
                      onChange={handleParamChange}
                      placeholder="Laisser vide pour conserver"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nouveau seuil sécurité</label>
                    <input
                      type="number"
                      name="nouveau_seuil_securite"
                      className="form-control"
                      value={formData.parametres.nouveau_seuil_securite || ''}
                      onChange={handleParamChange}
                      placeholder="Laisser vide pour conserver"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary px-4" onClick={createSimulation} disabled={executing}>
                  {executing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>Créer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal résultats */}
      {showResultModal && selectedSimulation && resultData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-success bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-success fw-bold">
                  <i className="bi bi-bar-chart-steps me-2"></i>
                  Résultats de la simulation
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowResultModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">Simulation</small>
                      <p className="fw-semibold mb-0">{selectedSimulation.nom}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Article</small>
                      <p className="fw-semibold mb-0">{selectedSimulation.article?.designation}</p>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <small className="text-muted">Stock actuel</small>
                        <h3 className="text-primary mb-0">{resultData.stock_actuel || '-'}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <small className="text-muted">Nouveau stock projeté</small>
                        <h3 className="text-success mb-0">{resultData.nouveau_stock || '-'}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <small className="text-muted">Impact financier</small>
                        <h3 className="text-warning mb-0">{resultData.impact_financier?.toLocaleString() || '0'} DH</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <small className="text-muted">Niveau de risque</small>
                        <h3 className="text-danger mb-0">{resultData.niveau_risque || '-'}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {resultData.recommandations && resultData.recommandations.length > 0 && (
                  <div className="mt-3">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted fw-semibold">Recommandations</small>
                      <ul className="mb-0 mt-2">
                        {resultData.recommandations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowResultModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimulationList