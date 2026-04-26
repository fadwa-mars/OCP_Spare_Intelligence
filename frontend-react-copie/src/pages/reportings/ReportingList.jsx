// src/pages/reportings/ReportingList.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const ReportingList = () => {
  const { user } = useAuth()
  const [reportings, setReportings] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState('weekly')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const canManage = user?.role === 'admin' || user?.role === 'planificateur'

  useEffect(() => {
    fetchReportings()
  }, [])

  const fetchReportings = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/reportings', {
        params: { per_page: 100 }
      })
      
      let data = []
      if (response.data.data && response.data.data.data) {
        data = response.data.data.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data
      }
      
      setReportings(data)
    } catch (error) {
      console.error('Erreur chargement reportings:', error)
      toast.error('Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      let endpoint = ''
      if (selectedType === 'weekly') {
        endpoint = '/reports/weekly'
      } else {
        endpoint = '/reports/monthly'
      }
      
      const response = await axiosInstance.post(endpoint)
      toast.success('Rapport généré avec succès')
      setShowGenerateModal(false)
      fetchReportings()
    } catch (error) {
      console.error('Erreur génération:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const exportToExcel = () => {
    const exportData = reportings.map((r, index) => ({
      '#': index + 1,
      'Type': r.type === 'weekly' ? 'Hebdomadaire' : 'Mensuel',
      'Période': r.period,
      'Statut': r.status,
      'Créé le': new Date(r.created_at).toLocaleDateString(),
      'Téléchargements': r.download_count || 0
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rapports')
    XLSX.writeFile(wb, `rapports_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export Excel réussi')
  }

  const exportPDF = async (report) => {
    try {
      const response = await axiosInstance.get(`/reports/${report.id}/export-pdf`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_${report.type}_${report.period}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF téléchargé avec succès')
    } catch (error) {
      console.error('Erreur export PDF:', error)
      toast.error('Erreur lors du téléchargement du PDF')
    }
  }

  const openDetailModal = async (report) => {
    setSelectedReport(report)
    setShowDetailModal(true)
  }

  const getTypeBadge = (type) => {
    if (type === 'weekly') {
      return <span className="badge bg-primary bg-opacity-10 text-primary">Hebdomadaire</span>
    }
    return <span className="badge bg-success bg-opacity-10 text-success">Mensuel</span>
  }

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="badge bg-success bg-opacity-10 text-success">Complété</span>
    }
    return <span className="badge bg-warning bg-opacity-10 text-warning">En cours</span>
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
            <i className="bi bi-file-text me-2"></i>
            Rapports
          </h4>
          <p className="text-secondary small mb-0">Génération et consultation des rapports</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-secondary" onClick={exportToExcel}>
            <i className="bi bi-download me-2"></i>Exporter
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>Nouveau rapport
            </button>
          )}
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-calendar-week text-primary" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{reportings.filter(r => r.type === 'weekly').length}</h3>
            <small className="text-muted">Rapports hebdomadaires</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-calendar-month text-success" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{reportings.filter(r => r.type === 'monthly').length}</h3>
            <small className="text-muted">Rapports mensuels</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-download text-info" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{reportings.reduce((sum, r) => sum + (r.download_count || 0), 0)}</h3>
            <small className="text-muted">Téléchargements</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 text-center p-3">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
            <h3 className="mt-2 mb-0">{reportings.filter(r => r.status === 'completed').length}</h3>
            <small className="text-muted">Rapports générés</small>
          </div>
        </div>
      </div>

      {/* Tableau des rapports */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3">Période</th>
                  <th className="py-3 text-center">Date génération</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Téléchargements</th>
                  <th className="py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucun rapport trouvé
                    </td>
                  </tr>
                ) : (
                  reportings.map((report) => (
                    <tr key={report.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3">{getTypeBadge(report.type)}</td>
                      <td className="py-3 fw-semibold">{report.period}</td>
                      <td className="py-3 text-center">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-center">{getStatusBadge(report.status)}</td>
                      <td className="py-3 text-center">
                        <span className="badge bg-light text-secondary">{report.download_count || 0}</span>
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            onClick={() => openDetailModal(report)}
                            className="btn btn-sm btn-outline-primary rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Voir détail"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            onClick={() => exportPDF(report)}
                            className="btn btn-sm btn-outline-success rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                            title="Télécharger PDF"
                          >
                            <i className="bi bi-file-pdf"></i>
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

      {/* Modal de génération */}
      {showGenerateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-plus-circle me-2"></i>
                  Générer un rapport
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Type de rapport</label>
                  <select 
                    className="form-select" 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="weekly">Rapport hebdomadaire</option>
                    <option value="monthly">Rapport mensuel</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Le rapport sera généré avec les dernières données disponibles.
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowGenerateModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-primary px-4" 
                  onClick={generateReport}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-text me-2"></i>Générer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {showDetailModal && selectedReport && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 shadow-lg">
              <div className="modal-header bg-primary bg-opacity-10 border-bottom-0">
                <h5 className="modal-title text-primary fw-bold">
                  <i className="bi bi-file-text me-2"></i>
                  Détail du rapport
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Type</small>
                      <p className="fw-semibold mb-0">{getTypeBadge(selectedReport.type)}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Période</small>
                      <p className="fw-semibold mb-0">{selectedReport.period}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Date de génération</small>
                      <p className="fw-semibold mb-0">{new Date(selectedReport.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Dernière modification</small>
                      <p className="fw-semibold mb-0">{new Date(selectedReport.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Statut</small>
                      <p className="mb-0">{getStatusBadge(selectedReport.status)}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted">Nombre de téléchargements</small>
                      <p className="fw-semibold mb-0">{selectedReport.download_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </button>
                <button 
                  className="btn btn-success px-4" 
                  onClick={() => {
                    exportPDF(selectedReport)
                    setShowDetailModal(false)
                  }}
                >
                  <i className="bi bi-file-pdf me-2"></i>Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportingList