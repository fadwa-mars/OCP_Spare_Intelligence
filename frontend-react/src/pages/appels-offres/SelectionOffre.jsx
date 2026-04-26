// src/pages/appels-offres/SelectionOffre.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const SelectionOffre = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appel, setAppel] = useState(null)
  const [offres, setOffres] = useState([])
  const [selectedOffre, setSelectedOffre] = useState(null)
  const [selecting, setSelecting] = useState(false)

  const canSelect = user?.role === 'admin' || user?.role === 'acheteur'

  // Rediriger si pas les droits
  if (!canSelect) {
    return <Navigate to="/appels-offres" />
  }

  useEffect(() => {
    fetchAppelAndOffres()
  }, [id])

  const fetchAppelAndOffres = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/appels-offres/${id}`)
      setAppel(response.data.data)
      setOffres(response.data.data.offres || [])
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur lors du chargement')
      navigate('/appels-offres')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectWinner = async () => {
    if (!selectedOffre) {
      toast.error('Veuillez sélectionner une offre')
      return
    }

    setSelecting(true)
    try {
      const response = await axiosInstance.post(`/appels-offres/${id}/select-winner`, { offre_id: selectedOffre })
      toast.success('Offre gagnante sélectionnée. La commande a été créée automatiquement.')
      
      // Rediriger vers la commande créée si disponible
      if (response.data.commande_id) {
        setTimeout(() => {
          navigate(`/commandes/${response.data.commande_id}`)
        }, 1500)
      } else {
        navigate('/appels-offres')
      }
    } catch (error) {
      console.error('Erreur sélection:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la sélection')
    } finally {
      setSelecting(false)
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
        <button onClick={() => navigate('/appels-offres')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
          <h6 className="fw-semibold text-primary mb-0 py-2">Sélection de l'offre gagnante</h6>
        </div>
        <div className="card-body p-4">
          
          {/* Informations de l'appel d'offres */}
          <div className="bg-light rounded-3 p-3 mb-4">
            <div className="row">
              <div className="col-12">
                <small className="text-muted">Objet</small>
                <p className="fw-semibold mb-2">{appel?.objet}</p>
              </div>
              <div className="col-md-4">
                <small className="text-muted">Date clôture</small>
                <p className="fw-semibold mb-0">{appel?.date_cloture?.split('T')[0]}</p>
              </div>
              <div className="col-md-4">
                <small className="text-muted">Article</small>
                <p className="fw-semibold mb-0">{appel?.demande_achat?.article?.designation}</p>
              </div>
              <div className="col-md-4">
                <small className="text-muted">Quantité</small>
                <p className="fw-semibold mb-0">{appel?.demande_achat?.quantite} {appel?.demande_achat?.article?.unite_mesure}</p>
              </div>
            </div>
          </div>

          {/* Tableau des offres */}
          <div className="table-responsive">
            <table className="table table-borderless table-hover">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Fournisseur</th>
                  <th className="text-center">Prix unitaire</th>
                  <th className="text-center">Délai (jours)</th>
                  <th className="text-center">Garantie</th>
                  <th className="text-end">Montant total</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Sélection</th>
                </tr>
              </thead>
              <tbody>
                {offres.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Aucune offre soumise
                    </td>
                  </tr>
                ) : (
                  offres.map((offre, idx) => {
                    const montantTotal = offre.prix_unitaire * appel?.demande_achat?.quantite + (offre.frais_livraison || 0)
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td className="py-3 px-3 fw-semibold">{offre.fournisseur?.nom}</td>
                        <td className="text-center">{offre.prix_unitaire.toLocaleString()} DH</td>
                        <td className="text-center">{offre.delai_livraison}</td>
                        <td className="text-center">{offre.garantie || '-'}</td>
                        <td className="text-end">{montantTotal.toLocaleString()} DH</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{offre.score_calcule || 0}</span>
                        </td>
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="offre"
                              value={offre.id}
                              checked={selectedOffre == offre.id}
                              onChange={() => setSelectedOffre(offre.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Message si aucune offre */}
          {offres.length === 0 && (
            <div className="alert alert-warning text-center mt-3">
              <i className="bi bi-info-circle me-2"></i>
              Aucune offre n'a été soumise pour cet appel d'offres.
            </div>
          )}

          {/* Boutons d'action */}
          <div className="d-flex gap-3 justify-content-end mt-5">
            <button 
              type="button" 
              onClick={() => navigate('/appels-offres')} 
              className="btn btn-outline-secondary px-4"
            >
              Annuler
            </button>
            <button 
              type="button"
              className="btn btn-primary px-4" 
              onClick={handleSelectWinner}
              disabled={!selectedOffre || selecting || offres.length === 0}
            >
              {selecting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Validation...
                </>
              ) : (
                <>
                  <i className="bi bi-trophy me-2"></i>Sélectionner l'offre gagnante
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SelectionOffre