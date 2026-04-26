// src/pages/articles/ArticleForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const ArticleForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const canEdit = user?.role === 'admin' || user?.role === 'planificateur'

  // Rediriger si pas les droits
  if (!canEdit) {
    return <Navigate to="/articles" />
  }

  const [formData, setFormData] = useState({
    code_sap: '',
    designation: '',
    categorie: '',
    unite_mesure: 'pièce',
    seuil_min: 10,
    seuil_securite: 5,
    delai_approvisionnement: 15,
    etat: 'actif'
  })

  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/articles/${id}`)
      const article = response.data.data
      setFormData({
        code_sap: article.code_sap || '',
        designation: article.designation || '',
        categorie: article.categorie || '',
        unite_mesure: article.unite_mesure || 'pièce',
        seuil_min: article.seuil_min || 10,
        seuil_securite: article.seuil_securite || 5,
        delai_approvisionnement: article.delai_approvisionnement || 15,
        etat: article.etat || 'actif'
      })
    } catch (error) {
      console.error('Erreur chargement article:', error)
      toast.error('Article non trouvé')
      navigate('/articles')
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
    setSaving(true)
    try {
      if (id) {
        await axiosInstance.put(`/articles/${id}`, formData)
        toast.success('Article modifié avec succès')
      } else {
        await axiosInstance.post('/articles', formData)
        toast.success('Article créé avec succès')
      }
      navigate('/articles')
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
        <button onClick={() => navigate('/articles')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0 py-2">{id ? 'Modifier' : 'Nouvel'} article</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Code SAP <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="code_sap"
                  className="form-control"
                  value={formData.code_sap}
                  onChange={handleChange}
                  required
                  placeholder="Ex: ROU-001"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Désignation <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  placeholder="Nom de l'article"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Catégorie</label>
                <input
                  type="text"
                  name="categorie"
                  className="form-control"
                  value={formData.categorie}
                  onChange={handleChange}
                  placeholder="Ex: ROUES, MOTEURS..."
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Unité de mesure</label>
                <select name="unite_mesure" className="form-select" value={formData.unite_mesure} onChange={handleChange}>
                  <option value="pièce">Pièce</option>
                  <option value="mètre">Mètre</option>
                  <option value="kilogramme">Kilogramme</option>
                  <option value="litre">Litre</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Statut</label>
                <select name="etat" className="form-select" value={formData.etat} onChange={handleChange}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="obsolète">Obsolète</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Seuil minimum</label>
                <input
                  type="number"
                  name="seuil_min"
                  className="form-control"
                  value={formData.seuil_min}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Seuil de sécurité</label>
                <input
                  type="number"
                  name="seuil_securite"
                  className="form-control"
                  value={formData.seuil_securite}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Délai approvisionnement (jours)</label>
                <input
                  type="number"
                  name="delai_approvisionnement"
                  className="form-control"
                  value={formData.delai_approvisionnement}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end mt-5">
              <button type="button" onClick={() => navigate('/articles')} className="btn btn-outline-secondary px-4">
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

export default ArticleForm