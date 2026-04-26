// src/pages/classifications/ClassificationList.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const ClassificationList = () => {
  const { user } = useAuth()
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stats, setStats] = useState({
    A: 0, B: 0, C: 0,
    X: 0, Y: 0, Z: 0
  })

  const canManage = user?.role === 'admin' || user?.role === 'planificateur'

  useEffect(() => {
    fetchClassifications()
  }, [])

  const fetchClassifications = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/classifications')
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setClassifications(data)
      calculateStats(data)
    } catch (error) {
      console.error('Erreur chargement classifications:', error)
      toast.error('Erreur lors du chargement des classifications')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const abcCount = { A: 0, B: 0, C: 0 }
    const xyzCount = { X: 0, Y: 0, Z: 0 }
    
    data.forEach(item => {
      if (item.classe_abc) abcCount[item.classe_abc]++
      if (item.classe_xyz) xyzCount[item.classe_xyz]++
    })
    
    setStats({
      A: abcCount.A, B: abcCount.B, C: abcCount.C,
      X: xyzCount.X, Y: xyzCount.Y, Z: xyzCount.Z
    })
  }

  const generateClassification = async () => {
    setGenerating(true)
    try {
      await axiosInstance.post('/classifications/generate')
      toast.success('Classification générée avec succès')
      fetchClassifications()
    } catch (error) {
      console.error('Erreur génération:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredClassifications.map((item, index) => ({
      '#': index + 1,
      'Code SAP': item.article?.code_sap,
      'Article': item.article?.designation,
      'Classification ABC': item.classe_abc,
      'Classification XYZ': item.classe_xyz,
      'Classe complète': `${item.classe_abc}${item.classe_xyz}`,
      'Valeur': item.valeur_consommation,
      'Date calcul': new Date(item.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Classifications')
    XLSX.writeFile(wb, `classifications_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const getABCBadge = (abc) => {
    const colors = {
      'A': { class: 'danger', text: 'A - Très important' },
      'B': { class: 'warning', text: 'B - Important' },
      'C': { class: 'success', text: 'C - Peu important' }
    }
    const c = colors[abc] || { class: 'secondary', text: abc }
    return <span className={`badge bg-${c.class} bg-opacity-10 text-${c.class}`}>{c.text}</span>
  }

  const getXYZBadge = (xyz) => {
    const colors = {
      'X': { class: 'danger', text: 'X - Très régulier' },
      'Y': { class: 'warning', text: 'Y - Moyennement régulier' },
      'Z': { class: 'success', text: 'Z - Irrégulier' }
    }
    const c = colors[xyz] || { class: 'secondary', text: xyz }
    return <span className={`badge bg-${c.class} bg-opacity-10 text-${c.class}`}>{c.text}</span>
  }

  const getFullBadge = (abc, xyz) => {
    const colors = {
      'AX': 'danger', 'AY': 'danger', 'AZ': 'warning',
      'BX': 'warning', 'BY': 'warning', 'BZ': 'info',
      'CX': 'success', 'CY': 'success', 'CZ': 'secondary'
    }
    const color = colors[`${abc}${xyz}`] || 'secondary'
    return <span className={`badge bg-${color} bg-opacity-10 text-${color}`}>{abc}{xyz}</span>
  }

  const filteredClassifications = classifications.filter(item => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'A') return item.classe_abc === 'A'
    if (selectedCategory === 'B') return item.classe_abc === 'B'
    if (selectedCategory === 'C') return item.classe_abc === 'C'
    if (selectedCategory === 'X') return item.classe_xyz === 'X'
    if (selectedCategory === 'Y') return item.classe_xyz === 'Y'
    if (selectedCategory === 'Z') return item.classe_xyz === 'Z'
    return true
  })

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
            <i className="bi bi-pie-chart me-2"></i>
            Classification ABC/XYZ
          </h4>
          <p className="text-secondary small mb-0">Analyse de la criticité et régularité des articles</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-secondary" onClick={exportToExcel}>
            <i className="bi bi-download me-2"></i>Exporter
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={generateClassification} disabled={generating}>
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Génération...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat me-2"></i>Générer
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cartes statistiques ABC */}
      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <h6 className="fw-semibold text-primary mb-2">Analyse ABC (Valeur de consommation)</h6>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #dc3545' }}>
            <h2 className="text-danger mb-0">{stats.A}</h2>
            <small className="text-muted">Articles Classe A (70% valeur)</small>
            <div className="progress mt-2" style={{ height: '8px' }}>
              <div className="progress-bar bg-danger" style={{ width: `${(stats.A / classifications.length) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #ffc107' }}>
            <h2 className="text-warning mb-0">{stats.B}</h2>
            <small className="text-muted">Articles Classe B (20% valeur)</small>
            <div className="progress mt-2" style={{ height: '8px' }}>
              <div className="progress-bar bg-warning" style={{ width: `${(stats.B / classifications.length) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #198754' }}>
            <h2 className="text-success mb-0">{stats.C}</h2>
            <small className="text-muted">Articles Classe C (10% valeur)</small>
            <div className="progress mt-2" style={{ height: '8px' }}>
              <div className="progress-bar bg-success" style={{ width: `${(stats.C / classifications.length) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes statistiques XYZ */}
      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <h6 className="fw-semibold text-primary mb-2">Analyse XYZ (Régularité de consommation)</h6>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #dc3545' }}>
            <h2 className="text-danger mb-0">{stats.X}</h2>
            <small className="text-muted">Articles Classe X (Très régulier)</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #ffc107' }}>
            <h2 className="text-warning mb-0">{stats.Y}</h2>
            <small className="text-muted">Articles Classe Y (Moyennement régulier)</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3" style={{ borderLeft: '4px solid #198754' }}>
            <h2 className="text-success mb-0">{stats.Z}</h2>
            <small className="text-muted">Articles Classe Z (Irrégulier / Occasionnel)</small>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label small fw-semibold text-secondary">Filtrer par classe</label>
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Tous
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'A' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setSelectedCategory('A')}
                >
                  Classe A
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'B' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setSelectedCategory('B')}
                >
                  Classe B
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'C' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setSelectedCategory('C')}
                >
                  Classe C
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'X' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setSelectedCategory('X')}
                >
                  Classe X
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'Y' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setSelectedCategory('Y')}
                >
                  Classe Y
                </button>
                <button 
                  className={`btn btn-sm ${selectedCategory === 'Z' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setSelectedCategory('Z')}
                >
                  Classe Z
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des classifications */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Code SAP</th>
                  <th className="py-3">Article</th>
                  <th className="py-3 text-center">ABC</th>
                  <th className="py-3 text-center">XYZ</th>
                  <th className="py-3 text-center">Classe</th>
                  <th className="py-3 text-center">Valeur (DH)</th>
                  <th className="py-3 text-center">Date calcul</th>
                </tr>
              </thead>
              <tbody>
                {filteredClassifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune classification trouvée
                      {canManage && (
                        <div className="mt-3">
                          <button className="btn btn-primary btn-sm" onClick={generateClassification}>
                            <i className="bi bi-arrow-repeat me-1"></i>Générer la classification
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredClassifications.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3 fw-semibold">{item.article?.code_sap || '-'}</td>
                      <td className="py-3">{item.article?.designation || '-'}</td>
                      <td className="py-3 text-center">{getABCBadge(item.classe_abc)}</td>
                      <td className="py-3 text-center">{getXYZBadge(item.classe_xyz)}</td>
                      <td className="py-3 text-center">{getFullBadge(item.classe_abc, item.classe_xyz)}</td>
                      <td className="py-3 text-center">{item.valeur_consommation?.toLocaleString() || '-'} DH</td>
                      <td className="py-3 text-center">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Matrice stratégique */}
      {classifications.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 mt-4">
          <div className="card-header border-0" style={{ backgroundColor: '#f0f7ff' }}>
            <h6 className="fw-semibold text-primary mb-0 py-2">
              <i className="bi bi-grid-3x3-gap-fill me-2"></i>
              Matrice stratégique ABC/XYZ
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr className="bg-light">
                        <th></th>
                        <th className="text-danger">A (Valeur élevée)</th>
                        <th className="text-warning">B (Valeur moyenne)</th>
                        <th className="text-success">C (Valeur faible)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="bg-light text-danger">X (Très régulier)</th>
                        <td className="bg-danger bg-opacity-10">
                          <strong>AX</strong><br />
                          <small>Stratégie : Stock de sécurité minimisé, réapprovisionnement fréquent</small>
                        </td>
                        <td className="bg-warning bg-opacity-10">
                          <strong>BX</strong><br />
                          <small>Stratégie : Suivi régulier, réapprovisionnement planifié</small>
                        </td>
                        <td className="bg-success bg-opacity-10">
                          <strong>CX</strong><br />
                          <small>Stratégie : Stock minimal, commandes groupées</small>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-warning">Y (Moyennement régulier)</th>
                        <td className="bg-danger bg-opacity-10">
                          <strong>AY</strong><br />
                          <small>Stratégie : Stock de sécurité modéré, suivi rapproché</small>
                        </td>
                        <td className="bg-warning bg-opacity-10">
                          <strong>BY</strong><br />
                          <small>Stratégie : Gestion par quantité économique</small>
                        </td>
                        <td className="bg-success bg-opacity-10">
                          <strong>CY</strong><br />
                          <small>Stratégie : Réapprovisionnement simple</small>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-success">Z (Irrégulier)</th>
                        <td className="bg-danger bg-opacity-10">
                          <strong>AZ</strong><br />
                          <small>Stratégie : Stock de sécurité élevé, suivi permanent</small>
                        </td>
                        <td className="bg-warning bg-opacity-10">
                          <strong>BZ</strong><br />
                          <small>Stratégie : Réapprovisionnement à la commande</small>
                        </td>
                        <td className="bg-success bg-opacity-10">
                          <strong>CZ</strong><br />
                          <small>Stratégie : Commande ponctuelle, pas de stock</small>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassificationList