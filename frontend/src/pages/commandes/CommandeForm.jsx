// src/pages/commandes/CommandeForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const CommandeForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [demandes, setDemandes] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [selectedDemande, setSelectedDemande] = useState(null)
  
  const canCreate = user?.role === 'admin' || user?.role === 'acheteur'

  // Rediriger si pas les droits
  if (!canCreate) {
    return <Navigate to="/commandes" />
  }

  const [formData, setFormData] = useState({
    demande_achat_id: '',
    fournisseur_id: '',
    date_livraison_prevue: '',
    lignes: []
  })

  useEffect(() => {
    fetchDemandesApprouvees()
    fetchFournisseurs()
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

  const fetchFournisseurs = async () => {
    try {
      const response = await axiosInstance.get('/fournisseurs', {
        params: { per_page: 100 }
      })
      let fournisseursData = []
      if (response.data.data && response.data.data.data) {
        fournisseursData = response.data.data.data
      }
      setFournisseurs(fournisseursData)
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
    }
  }

  const handleDemandeChange = (e) => {
    const demandeId = e.target.value
    const demande = demandes.find(d => d.id == demandeId)
    setSelectedDemande(demande)
    setFormData({
      ...formData,
      demande_achat_id: demandeId,
      lignes: demande ? [{
        article_id: demande.article_id,
        quantite: demande.quantite,
        prix_unitaire: 0
      }] : []
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePrixChange = (e) => {
    const prix = parseFloat(e.target.value)
    setFormData({
      ...formData,
      lignes: [{
        ...formData.lignes[0],
        prix_unitaire: prix
      }]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.demande_achat_id) {
      toast.error('Veuillez sélectionner une demande approuvée')
      return
    }
    if (!formData.fournisseur_id) {
      toast.error('Veuillez sélectionner un fournisseur')
      return
    }
    if (!formData.date_livraison_prevue) {
      toast.error('Veuillez entrer une date de livraison prévue')
      return
    }

    setSaving(true)
    try {
      await axiosInstance.post('/commandes', formData)
      toast.success('Commande créée avec succès')
      navigate('/commandes')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
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

  const montantTotal = formData.lignes[0]?.quantite * (formData.lignes[0]?.prix_unitaire || 0) || 0

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/commandes')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
          <h6 className="fw-semibold text-primary mb-0 py-2">Nouvelle commande</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Demande d'achat approuvée <span className="text-danger">*</span></label>
                <select
                  name="demande_achat_id"
                  className="form-select"
                  value={formData.demande_achat_id}
                  onChange={handleDemandeChange}
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
                <label className="form-label fw-semibold">Fournisseur <span className="text-danger">*</span></label>
                <select
                  name="fournisseur_id"
                  className="form-select"
                  value={formData.fournisseur_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Date livraison prévue <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="date_livraison_prevue"
                  className="form-control"
                  value={formData.date_livraison_prevue}
                  onChange={handleChange}
                  required
                />
              </div>

              {selectedDemande && (
                <>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Quantité</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedDemande.quantite}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Prix unitaire (€)</label>
                    <input
                      type="number"
                      name="prix_unitaire"
                      className="form-control"
                      placeholder="Prix unitaire"
                      value={formData.lignes[0]?.prix_unitaire || ''}
                      onChange={handlePrixChange}
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-12">
                    <div className="bg-light rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">Montant total estimé :</span>
                        <span className="fw-bold text-primary fs-5">{montantTotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="d-flex gap-3 justify-content-end mt-5">
              <button type="button" onClick={() => navigate('/commandes')} className="btn btn-outline-secondary px-4">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CommandeForm