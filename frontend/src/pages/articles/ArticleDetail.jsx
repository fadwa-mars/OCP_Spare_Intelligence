// src/pages/articles/ArticleDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../api/axiosConfig'
import { toast } from 'react-toastify'

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState(null)

  const canEdit = user?.role === 'admin' || user?.role === 'planificateur'

  useEffect(() => {
    fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/articles/${id}`)
      setArticle(response.data.data)
    } catch (error) {
      console.error('Erreur chargement article:', error)
      toast.error('Article non trouvé')
      navigate('/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Supprimer l'article "${article?.designation}" ?`)) {
      try {
        await axiosInstance.delete(`/articles/${id}`)
        toast.success('Article supprimé avec succès')
        navigate('/articles')
      } catch (error) {
        console.error('Erreur suppression:', error)
        toast.error('Erreur lors de la suppression')
      }
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

  if (!article) return null

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/articles')} className="btn btn-link text-primary text-decoration-none p-0">
          <i className="bi bi-arrow-left me-2"></i>Retour
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0 py-2">Détail de l'article</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-bold mb-1">{article.designation}</h5>
                  <span className="badge bg-light text-secondary">Code SAP: {article.code_sap}</span>
                </div>
                <span className={`badge ${article.etat === 'actif' ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                  {article.etat === 'actif' ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <hr />

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-secondary">Catégorie</span>
                    <span className="fw-semibold">{article.categorie || '-'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-top">
                    <span className="text-secondary">Unité de mesure</span>
                    <span className="fw-semibold">{article.unite_mesure || '-'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-top">
                    <span className="text-secondary">Délai approvisionnement</span>
                    <span className="fw-semibold">{article.delai_approvisionnement} jours</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-secondary">Seuil minimum</span>
                    <span className="fw-semibold">{article.seuil_min}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-top">
                    <span className="text-secondary">Seuil de sécurité</span>
                    <span className="fw-semibold">{article.seuil_securite}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-top">
                    <span className="text-secondary">Stock actuel</span>
                    <span className={`fw-semibold ${article.stock?.stock_actuel <= article.seuil_min ? 'text-danger' : ''}`}>
                      {article.stock?.stock_actuel || 0} {article.unite_mesure}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h6 className="fw-semibold mb-3">Actions</h6>
              <div className="d-grid gap-2">
                {canEdit ? (
                  <>
                    <Link to={`/articles/edit/${article.id}`} className="btn btn-outline-primary">
                      <i className="bi bi-pencil me-2"></i>Modifier
                    </Link>
                    <button onClick={handleDelete} className="btn btn-outline-danger">
                      <i className="bi bi-trash me-2"></i>Supprimer
                    </button>
                  </>
                ) : (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-lock fs-4 d-block mb-2"></i>
                    <small>Vous n'avez pas les droits de modification</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleDetail