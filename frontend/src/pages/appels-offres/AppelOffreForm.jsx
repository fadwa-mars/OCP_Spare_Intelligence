// src/pages/appels-offres/AppelOffreForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const AppelOffreForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [demandes, setDemandes] = useState([])
  
  const canCreate = user?.role === 'admin' || user?.role === 'acheteur'

  if (!canCreate) {
    return <Navigate to="/appels-offres" />
  }

  const [formData, setFormData] = useState({
    demande_achat_id: '',
    date_cloture: '',
    objet: ''
  })

  useEffect(() => {
    fetchDemandesApprouvees()
  }, [])

  const fetchDemandesApprouvees = async () => {
    try {
      const response = await axiosInstance.get('/demandes', {
        params: { statut: 'approuvee', per_page: 100 }
      })
      let demandesData = []
      if (response.data.data && response.data.data.data) {
        demandesData = response.data.data.data
      }
      setDemandes(demandesData)
    } catch (error) {
      console.error('Erreur chargement demandes:', error)
      toast.error('Erreur lors du chargement des demandes')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.demande_achat_id) {
      toast.error('Veuillez sélectionner une demande approuvée')
      return
    }
    if (!formData.date_cloture) {
      toast.error('Veuillez entrer une date de clôture')
      return
    }
    if (!formData.objet) {
      toast.error('Veuillez entrer un objet')
      return
    }

    setSaving(true)
    try {
      await axiosInstance.post('/appels-offres', formData)
      toast.success('Appel d\'offres créé avec succès')
      navigate('/appels-offres')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/appels-offres')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
          <h6 className="fw-semibold text-primary mb-0 py-2">Nouvel appel d'offres</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-12">
                <label className="form-label fw-semibold">Demande d'achat approuvée <span className="text-danger">*</span></label>
                <select
                  name="demande_achat_id"
                  className="form-select"
                  value={formData.demande_achat_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une demande</option>
                  {demandes.map(demande => (
                    <option key={demande.id} value={demande.id}>
                      {demande.article?.code_sap} - {demande.article?.designation} ({demande.quantite} {demande.article?.unite_mesure})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Date de clôture <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="date_cloture"
                  className="form-control"
                  value={formData.date_cloture}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Objet <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="objet"
                  className="form-control"
                  placeholder="Objet de l'appel d'offres"
                  value={formData.objet}
                  onChange={handleChange}
                  required
                />
              </div>

              {formData.demande_achat_id && (
                <div className="col-12">
                  <div className="bg-light rounded-3 p-3">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">Article</small>
                        <p className="fw-semibold mb-0">
                          {demandes.find(d => d.id == formData.demande_achat_id)?.article?.designation}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Quantité</small>
                        <p className="fw-semibold mb-0">
                          {demandes.find(d => d.id == formData.demande_achat_id)?.quantite}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex gap-3 justify-content-end mt-5">
              <button type="button" onClick={() => navigate('/appels-offres')} className="btn btn-outline-secondary px-4">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Créer l\'appel d\'offres'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AppelOffreForm