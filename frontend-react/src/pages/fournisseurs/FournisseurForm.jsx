// src/pages/fournisseurs/FournisseurForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const FournisseurForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isEditMode = id && id !== 'new'
  
  const canManage = user?.role === 'admin' || user?.role === 'acheteur'

  if (!canManage) {
    return <Navigate to="/fournisseurs" />
  }

  const [formData, setFormData] = useState({
    nom: '',
    email_contact: '',
    telephone: '',
    adresse: '',
    est_actif: true,
    score_global: 0,
    nb_commandes: 0,
    nb_livraisons_retard: 0,
    delai_moyen_livraison: 0,
    taux_conformite: 100
  })

  useEffect(() => {
    if (isEditMode) {
      fetchFournisseur()
    }
  }, [id])

  const fetchFournisseur = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/fournisseurs/${id}`)
      const data = response.data.data
      setFormData({
        nom: data.nom || '',
        email_contact: data.email_contact || '',
        telephone: data.telephone || '',
        adresse: data.adresse || '',
        est_actif: data.est_actif === 1,
        score_global: data.score_global || 0,
        nb_commandes: data.nb_commandes || 0,
        nb_livraisons_retard: data.nb_livraisons_retard || 0,
        delai_moyen_livraison: data.delai_moyen_livraison || 0,
        taux_conformite: data.taux_conformite || 100
      })
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur lors du chargement du fournisseur')
      navigate('/fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nom.trim()) {
      toast.error('Le nom du fournisseur est requis')
      return
    }

    setSaving(true)
    try {
      if (isEditMode) {
        await axiosInstance.put(`/fournisseurs/${id}`, formData)
        toast.success('Fournisseur modifié avec succès')
      } else {
        await axiosInstance.post('/fournisseurs', formData)
        toast.success('Fournisseur créé avec succès')
      }
      navigate('/fournisseurs')
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
        <button onClick={() => navigate('/fournisseurs')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header border-0 text-center" style={{ backgroundColor: '#f0f7ff' }}>
          <h6 className="fw-semibold text-primary mb-0 py-2">
            {isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Informations générales */}
              <div className="col-12">
                <h6 className="fw-semibold text-primary mb-3">Informations générales</h6>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Nom du fournisseur <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="nom"
                  className="form-control"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Email de contact</label>
                <input
                  type="email"
                  name="email_contact"
                  className="form-control"
                  value={formData.email_contact}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  className="form-control"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Adresse</label>
                <textarea
                  name="adresse"
                  className="form-control"
                  rows="2"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>

              {/* Évaluation */}
              <div className="col-12 mt-3">
                <h6 className="fw-semibold text-primary mb-3">Évaluation</h6>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Score global (0-100)</label>
                <input
                  type="number"
                  name="score_global"
                  className="form-control"
                  value={formData.score_global}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Taux de conformité (%)</label>
                <input
                  type="number"
                  name="taux_conformite"
                  className="form-control"
                  value={formData.taux_conformite}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Délai moyen livraison (jours)</label>
                <input
                  type="number"
                  name="delai_moyen_livraison"
                  className="form-control"
                  value={formData.delai_moyen_livraison}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Nombre de commandes</label>
                <input
                  type="number"
                  name="nb_commandes"
                  className="form-control"
                  value={formData.nb_commandes}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Livraisons en retard</label>
                <input
                  type="number"
                  name="nb_livraisons_retard"
                  className="form-control"
                  value={formData.nb_livraisons_retard}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-4">
                <div className="form-check form-switch mt-4">
                  <input
                    type="checkbox"
                    name="est_actif"
                    className="form-check-input"
                    style={{ width: '2.5rem', height: '1.3rem', cursor: 'pointer' }}
                    checked={formData.est_actif}
                    onChange={handleChange}
                  />
                  <label className="form-check-label ms-2 fw-semibold">Fournisseur actif</label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end mt-5 pt-3 border-top">
              <button type="button" onClick={() => navigate('/fournisseurs')} className="btn btn-outline-secondary px-4">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    {isEditMode ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FournisseurForm