// src/pages/fournisseur/MesOffres.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const MesOffres = () => {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffres()
  }, [])

  const fetchOffres = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/fournisseur/mes-offres')
      let offersData = []
      if (response.data.data && Array.isArray(response.data.data)) {
        offersData = response.data.data
      }
      setOffres(offersData)
    } catch (error) {
      console.error('Erreur chargement offres:', error)
      toast.error('Erreur lors du chargement de vos offres')
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut) => {
    const badges = {
      'soumise': { class: 'warning', text: 'En attente' },
      'acceptee': { class: 'success', text: '✅ Acceptée - Commande créée' },
      'rejetee': { class: 'danger', text: 'Rejetée' }
    }
    const b = badges[statut] || { class: 'secondary', text: statut || 'Inconnu' }
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">Mes offres soumises</h4>
          <p className="text-secondary small mb-0">Suivez l'état de vos propositions</p>
        </div>
        <button 
          className="btn btn-outline-primary mt-3 mt-md-0"
          onClick={() => window.location.href = '/fournisseur/appels-offres'}
        >
          <i className="bi bi-plus-lg me-2"></i>Nouvelle offre
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Appel d'offres</th>
                  <th className="py-3 text-center">Prix unitaire</th>
                  <th className="py-3 text-center">Délai</th>
                  <th className="py-3 text-center">Montant total</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-center">Date soumission</th>
                </tr>
              </thead>
              <tbody>
                {offres.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Vous n'avez pas encore soumis d'offres
                    </td>
                  </tr>
                ) : (
                  offres.map((offre) => (
                    <tr key={offre.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td className="py-3 px-3">
                        <div className="fw-semibold">{offre.appel_offre?.objet || 'N/A'}</div>
                        <small className="text-muted">
                          {offre.appel_offre?.demande_achat?.article?.designation || 'Article non spécifié'}
                        </small>
                       </td>
                      <td className="py-3 text-center">
                        {(offre.prix_unitaire || 0).toLocaleString()} DH
                      </td>
                      <td className="py-3 text-center">
                        {offre.delai_livraison || 0} jours
                      </td>
                      <td className="py-3 text-center">
                        {(offre.montant_total || 0).toLocaleString()} DH
                      </td>
                      <td className="py-3 text-center">
                        {getStatutBadge(offre.statut)}
                      </td>
                      <td className="py-3 text-center">
                        {new Date(offre.date_soumission || offre.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MesOffres