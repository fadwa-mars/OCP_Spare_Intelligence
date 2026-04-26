// src/pages/demandes/DemandeForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const DemandeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [articles, setArticles] = useState([])
  
  const canCreate = user?.role === 'admin' || user?.role === 'planificateur'

  // Rediriger si pas les droits
  if (!canCreate) {
    return <Navigate to="/demandes" />
  }

  const [formData, setFormData] = useState({
    article_id: '',
    quantite: '',
    date_besoin: '',
    urgence: 'moyenne'
  })

  useEffect(() => {
    fetchArticles()
    if (id) {
      fetchDemande()
    }
  }, [id])

  const fetchArticles = async () => {
    try {
      const response = await axiosInstance.get('/articles', { params: { per_page: 100 } })
      let articlesData = []
      if (response.data.data && response.data.data.data) {
        articlesData = response.data.data.data
      }
      setArticles(articlesData)
    } catch (error) {
      console.error('Erreur chargement articles:', error)
      toast.error('Erreur lors du chargement des articles')
    }
  }

  const fetchDemande = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/demandes/${id}`)
      const demande = response.data.data
      setFormData({
        article_id: demande.article_id,
        quantite: demande.quantite,
        date_besoin: demande.date_besoin?.split('T')[0],
        urgence: demande.urgence
      })
    } catch (error) {
      console.error('Erreur chargement demande:', error)
      toast.error('Demande non trouvée')
      navigate('/demandes')
    } finally {
      setLoading(false)
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
    if (!formData.article_id) {
      toast.error('Veuillez sélectionner un article')
      return
    }
    if (!formData.quantite || formData.quantite <= 0) {
      toast.error('Veuillez entrer une quantité valide')
      return
    }
    if (!formData.date_besoin) {
      toast.error('Veuillez entrer une date de besoin')
      return
    }

    setSaving(true)
    try {
      if (id) {
        await axiosInstance.put(`/demandes/${id}`, formData)
        toast.success('Demande modifiée avec succès')
      } else {
        await axiosInstance.post('/demandes', formData)
        toast.success('Demande créée avec succès')
      }
      navigate('/demandes')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
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
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/demandes')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
          <h6 className="fw-semibold text-primary mb-0 py-2">{id ? 'Modifier' : 'Nouvelle'} demande d'achat</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Article <span className="text-danger">*</span></label>
                <select
                  name="article_id"
                  className="form-select"
                  value={formData.article_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un article</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.code_sap} - {article.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Quantité <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="quantite"
                  className="form-control"
                  placeholder="Quantité"
                  value={formData.quantite}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Date de besoin <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="date_besoin"
                  className="form-control"
                  value={formData.date_besoin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Urgence</label>
                <select
                  name="urgence"
                  className="form-select"
                  value={formData.urgence}
                  onChange={handleChange}
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end mt-5">
              <button type="button" onClick={() => navigate('/demandes')} className="btn btn-outline-secondary px-4">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Enregistrement...' : (id ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DemandeForm