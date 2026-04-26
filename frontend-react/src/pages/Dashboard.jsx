// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axiosConfig'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Radar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [radarChartLoading, setRadarChartLoading] = useState(true)
  const [radarChartData, setRadarChartData] = useState({ labels: [], values: [] })
  
  // ========== ÉTAT POUR IA ==========
  const [aiData, setAiData] = useState({
    available: false,
    articlesCritiques: [],
    loading: true
  })
  const [predictionData, setPredictionData] = useState(null)
  const [selectedArticleForPrediction, setSelectedArticleForPrediction] = useState(null)
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  // =================================

  const [activeTab, setActiveTab] = useState(() => {
    const role = user?.role
    if (role === 'admin') return 'kpisGeneraux'
    if (role === 'planificateur') return 'kpisStock'
    if (role === 'acheteur') return 'kpisAchats'
    if (role === 'magasinier') return 'kpisStock'
    return 'kpisGeneraux'
  })
  const [dashboardData, setDashboardData] = useState({
    kpisGeneraux: [],
    kpisStock: [],
    kpisAchats: [],
    kpisPrevisions: [],
    kpisFournisseurs: [],
    kpisAlertes: [],
    topArticles: [],
    topFournisseurs: [],
    recentActivities: [],
    stockCritique: [],
    alertesRetards: [],
    stockEvolution: { labels: [], values: [] },
    delaisLivraison: { labels: [], values: [] },
    mouvementsMois: { labels: [], entrants: [], sortants: [] }
  })

  // État pour les alertes masquées
  const [hiddenAlerts, setHiddenAlerts] = useState(() => {
    const saved = localStorage.getItem('hiddenAlerts')
    return saved ? JSON.parse(saved) : []
  })

  // Chargement des données IA
  const loadAIData = async () => {
    setAiData(prev => ({ ...prev, loading: true }))
    try {
      // Vérifier disponibilité IA
      const healthRes = await axiosInstance.get('/ai/health')
      const aiAvailable = healthRes.data.data?.ai_service === 'available'
      
      if (aiAvailable) {
        // Charger les articles critiques
        const criticalRes = await axiosInstance.get('/ai/criticalities')
        const articles = criticalRes.data.data || []
        // Trier par score décroissant et prendre top 5
        const topCritical = [...articles]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
        
        setAiData({
          available: true,
          articlesCritiques: topCritical,
          loading: false
        })
      } else {
        setAiData({
          available: false,
          articlesCritiques: [],
          loading: false
        })
      }
    } catch (error) {
      console.error('Erreur chargement données IA:', error)
      setAiData({
        available: false,
        articlesCritiques: [],
        loading: false
      })
    }
  }

  // Charger la prédiction pour un article
  const loadPrediction = async (articleId, articleName) => {
    setPredictionLoading(true)
    setSelectedArticleForPrediction(articleName)
    try {
      const response = await axiosInstance.get(`/ai/predict/${articleId}?periods=30`)
      const predictions = response.data.data?.predictions || []
      setPredictionData(predictions)
      setShowPredictionModal(true)
    } catch (error) {
      console.error('Erreur chargement prédiction:', error)
      toast.error('Erreur lors du chargement de la prédiction')
    } finally {
      setPredictionLoading(false)
    }
  }

  // Chargement asynchrone des données du graphique Radar
  const loadRadarChartData = async () => {
    setRadarChartLoading(true)
    try {
      const response = await axiosInstance.get('/dashboard/stock-evolution')
      setRadarChartData({
        labels: response.data.data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: response.data.data.values || [65, 59, 80, 81, 56, 55]
      })
    } catch (error) {
      console.error('Erreur chargement graphique radar:', error)
      setRadarChartData({
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: [65, 59, 80, 81, 56, 55]
      })
    } finally {
      setRadarChartLoading(false)
    }
  }

  // Masquer une alerte
  const hideAlert = (alertId) => {
    const newHiddenAlerts = [...hiddenAlerts, alertId]
    setHiddenAlerts(newHiddenAlerts)
    localStorage.setItem('hiddenAlerts', JSON.stringify(newHiddenAlerts))
  }

  useEffect(() => {
    fetchDashboardData()
    loadRadarChartData()
    loadAIData() // Charger les données IA
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [kpisRes, stockEvoRes, consumptionRes, activitiesRes, stockCritiqueRes] = await Promise.all([
        axiosInstance.get('/dashboard/kpis'),
        axiosInstance.get('/dashboard/stock-evolution'),
        axiosInstance.get('/dashboard/consumption-stats'),
        axiosInstance.get('/dashboard/recent-activities'),
        axiosInstance.get('/dashboard/stock-critique')
      ])

      const kpisData = kpisRes.data.data
      const role = user?.role

      if (role === 'admin') {
        setDashboardData(prev => ({
          ...prev,
          kpisGeneraux: [
            { title: 'Utilisateurs', value: kpisData.total_users || 0, change: '+12%', trend: 'up', icon: 'bi-people' },
            { title: 'Articles', value: kpisData.total_articles || 0, change: '+5%', trend: 'up', icon: 'bi-box-seam' },
            { title: 'Commandes', value: kpisData.total_commandes || 0, change: '+8%', trend: 'up', icon: 'bi-cart' },
            { title: 'Fournisseurs', value: kpisData.fournisseurs_actifs || 0, change: '+3%', trend: 'up', icon: 'bi-truck' }
          ],
          kpisStock: [
            { title: 'Stock total', value: `${kpisData.stock_total || 0}€`, change: '-2%', trend: 'down', icon: 'bi-calculator' },
            { title: 'Alertes rouges', value: kpisData.alertes_rouges || 0, change: '+15%', trend: 'up', icon: 'bi-bell-fill' },
            { title: 'Stock critique', value: kpisData.stock_critique || 0, change: '+8%', trend: 'up', icon: 'bi-exclamation-triangle-fill' }
          ],
          kpisAchats: [
            { title: 'CA', value: `${kpisData.chiffre_affaires || 0}€`, change: '+10%', trend: 'up', icon: 'bi-graph-up' },
            { title: 'Commandes cours', value: kpisData.commandes_en_cours || 0, change: '-5%', trend: 'down', icon: 'bi-cart-check' },
            { title: 'Demandes approuvées', value: kpisData.demandes_approuvees || 0, change: '+7%', trend: 'up', icon: 'bi-file-text' }
          ],
          topArticles: consumptionRes.data.data.labels?.map((label, i) => ({ name: label, quantity: consumptionRes.data.data.values[i] })) || [],
          recentActivities: activitiesRes.data.data || [],
          stockCritique: stockCritiqueRes.data.data || [],
          stockEvolution: { labels: stockEvoRes.data.data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], values: stockEvoRes.data.data.values || [65, 59, 80, 81, 56, 55] }
        }))
      }
      else if (role === 'planificateur') {
        setDashboardData(prev => ({
          ...prev,
          kpisStock: [
            { title: 'Total articles', value: kpisData.total_articles || 0, change: '+3%', trend: 'up', icon: 'bi-box-seam' },
            { title: 'Stock critique', value: kpisData.stock_critique || 0, change: '+8%', trend: 'up', icon: 'bi-exclamation-triangle-fill' },
          ],
          kpisPrevisions: [
            { title: 'Simulations', value: kpisData.simulations_realisees || 0, change: '0%', trend: 'up', icon: 'bi-cpu' },
            { title: 'Conso moyenne', value: '145', unit: 'unités/mois', change: '-3%', trend: 'down', icon: 'bi-graph-up' }
          ],
          topArticles: consumptionRes.data.data.labels?.map((label, i) => ({ name: label, quantity: consumptionRes.data.data.values[i] })) || [],
          recentActivities: activitiesRes.data.data || [],
          stockCritique: stockCritiqueRes.data.data || [],
          stockEvolution: { labels: stockEvoRes.data.data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], values: stockEvoRes.data.data.values || [65, 59, 80, 81, 56, 55] }
        }))
      }
      else if (role === 'acheteur') {
        setDashboardData(prev => ({
          ...prev,
          kpisAchats: [
            { title: 'Demandes à traiter', value: kpisData.demandes_approuvees || 0, change: '+12%', trend: 'up', icon: 'bi-file-text' },
            { title: 'Commandes cours', value: kpisData.commandes_en_cours || 0, change: '-8%', trend: 'down', icon: 'bi-cart-check' },
            { title: 'Appels d\'offres', value: kpisData.appels_offres_ouverts || 0, change: '0%', trend: 'neutral', icon: 'bi-megaphone' }
          ],
          kpisFournisseurs: [
            { title: 'Fournisseurs actifs', value: kpisData.fournisseurs_actifs || 0, change: '+5%', trend: 'up', icon: 'bi-truck' },
            { title: 'Délai livraison', value: `${kpisData.delais_livraison_moyen || 0}j`, change: '-10%', trend: 'down', icon: 'bi-clock-history' }
          ],
          topFournisseurs: [
            { name: 'SAP Matériels', score: 92, commandes: 45 },
            { name: 'Equipements Indus', score: 85, commandes: 32 },
            { name: 'Maintenance Pro', score: 78, commandes: 28 }
          ],
          recentActivities: activitiesRes.data.data || [],
          alertesRetards: [{ message: 'Commande #BC-001 en retard de 5 jours', fournisseur: 'SAP Matériels' }],
          delaisLivraison: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], values: [12, 10, 8, 7, 6, 5] }
        }))
      }
      else if (role === 'magasinier') {
        setDashboardData(prev => ({
          ...prev,
          kpisStock: [
            { title: 'Stock total', value: `${kpisData.stock_total || 0} unités`, change: '-5%', trend: 'down', icon: 'bi-box-seam' },
            { title: 'Réceptions mois', value: kpisData.receptions_mois || 0, change: '+18%', trend: 'up', icon: 'bi-archive' },
            { title: 'Sorties mois', value: kpisData.sorties_mois || 0, change: '+7%', trend: 'up', icon: 'bi-box-arrow-right' }
          ],
          kpisAlertes: [
            { title: 'Alertes rouges', value: kpisData.alertes_rouges || 0, change: '+20%', trend: 'up', icon: 'bi-bell-fill' },
            { title: 'Stock critique', value: kpisData.stock_critique || 0, change: '+12%', trend: 'up', icon: 'bi-exclamation-triangle-fill' }
          ],
          recentActivities: activitiesRes.data.data || [],
          stockCritique: stockCritiqueRes.data.data || [],
          mouvementsMois: { 
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            entrants: [45, 52, 48, 60, 55, 62],
            sortants: [38, 42, 40, 50, 48, 55]
          }
        }))
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const role = user?.role

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up': return 'success'
      case 'down': return 'danger'
      default: return 'secondary'
    }
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↑'
      case 'down': return '↓'
      default: return '•'
    }
  }

  const renderKpiCards = (kpis) => {
    if (!kpis || kpis.length === 0) return null
    return (
      <div className="row g-2 g-sm-3">
        {kpis.map((kpi, idx) => (
          <div className="col-6 col-md-4 col-lg-3" key={idx}>
            <div className="card shadow-sm rounded-3 border-0 border-top border-primary border-top-3 h-100">
              <div className="card-body d-flex flex-column p-3 p-sm-4">
                <div className="d-flex justify-content-end mb-2">
                  <span className={`badge bg-${getTrendColor(kpi.trend)} bg-opacity-10 text-${getTrendColor(kpi.trend)} px-2 py-1 rounded-pill`}>
                    {getTrendIcon(kpi.trend)} {kpi.change}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`${kpi.icon} text-secondary fs-6`}></i>
                  <h6 className="text-secondary small mb-0">{kpi.title}</h6>
                </div>
                <div className="mt-auto">
                  <h2 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#212529' }}>{kpi.value}</h2>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Tableau simple avec lien "Voir tout" (sans pagination)
  const renderTableWithSeeAll = (headers, data, renderRow, seeAllLink = null) => {
    if (!data || data.length === 0) {
      return <div className="text-center py-4 text-secondary">Aucune donnée disponible</div>
    }

    const displayData = data.slice(0, 5)

    return (
      <div>
        <div className="table-responsive">
          <table className="table table-borderless table-hover" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                {headers.map((h, i) => (
                  <th key={i} className="text-secondary fw-semibold py-2" style={{ fontSize: '14px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, idx) => (
                <tr key={idx}>
                  {renderRow(item, idx)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {seeAllLink && data.length > 5 && (
          <div className="text-center mt-3">
            <a href={seeAllLink} className="text-decoration-none small text-primary">
              Voir tout ({data.length} éléments) →
            </a>
          </div>
        )}
      </div>
    )
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

  // ============================================
  // ADMIN
  // ============================================
  if (role === 'admin') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-primary">Dashboard</h4>
            <p className="text-secondary small mb-0">Administrateur</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-transparent pt-3 border-bottom-0">
            <ul className="nav nav-pills card-header-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisGeneraux' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisGeneraux')}
                >
                  KPIs Généraux
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisStock' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisStock')}
                >
                  KPIs Stock
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisAchats' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisAchats')}
                >
                  KPIs Achats
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {activeTab === 'kpisGeneraux' && renderKpiCards(dashboardData.kpisGeneraux)}
            {activeTab === 'kpisStock' && renderKpiCards(dashboardData.kpisStock)}
            {activeTab === 'kpisAchats' && renderKpiCards(dashboardData.kpisAchats)}
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-graph-up me-2"></i>Évolution du stock (6 mois)
                </h6>
              </div>
              <div className="card-body">
                {radarChartLoading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '320px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '320px' }}>
                    <Radar 
                      data={{
                        labels: radarChartData.labels,
                        datasets: [{
                          label: 'Stock moyen',
                          data: radarChartData.values,
                          backgroundColor: 'rgba(13, 110, 253, 0.2)',
                          borderColor: 'rgba(13, 110, 253, 0.8)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(13, 110, 253, 0.8)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(13, 110, 253, 0.8)'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header border-0 text-center" style={{ backgroundColor: '#f0f7ff' }}>                
                <h6 className='fw-semibold text-primary mb-0'><i className="bi bi-trophy me-2"></i>Top articles</h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['#', 'Article', 'Quantité'],
                  dashboardData.topArticles,
                  (item, idx) => (
                    <>
                      <td className="py-2 text-secondary" style={{ width: '40px' }}>{idx + 1}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-end">{item.quantity} unités</td>
                    </>
                  ),
                  '/articles'
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-activity me-2"></i>Activités récentes
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['Action', 'Utilisateur', 'Date'],
                  dashboardData.recentActivities,
                  (item) => (
                    <>
                      <td className="py-2">{item.action}</td>
                      <td className="py-2">{item.user}</td>
                      <td className="py-2 text-end text-secondary small">{item.time}</td>
                    </>
                  ),
                  '/activities'
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">                
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>Stock critique
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['Article', 'Stock', 'Seuil'],
                  dashboardData.stockCritique,
                  (item) => (
                    <>
                      <td className="py-2">{item.article_designation}</td>
                      <td className="py-2 text-danger fw-semibold">{item.stock_actuel}</td>
                      <td className="py-2">{item.seuil_min}</td>
                    </>
                  ),
                  '/stocks/critique'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // PLANIFICATEUR PI (AVEC IA INTÉGRÉE)
  // ============================================
    // ============================================
  // PLANIFICATEUR PI (AVEC IA INTÉGRÉE)
  // ============================================
  if (role === 'planificateur') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-primary">Dashboard</h4>
            <p className="text-secondary small mb-0">Planificateur PI</p>
          </div>
        </div>

        {/* Carte IA - Statut du service */}
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-robot fs-3 me-3"></i>
            <div>
              <strong>Service Intelligence Artificielle</strong>
              <span className="ms-2">
                {aiData.available ? (
                  <span className="badge bg-success">Disponible</span>
                ) : (
                  <span className="badge bg-secondary">Indisponible</span>
                )}
              </span>
              <p className="small mb-0 text-muted mt-1">
                {aiData.available 
                  ? "L'IA est opérationnelle pour les prédictions et analyses" 
                  : "Service IA non disponible. Vérifiez que le serveur FastAPI est démarré."}
              </p>
            </div>
          </div>
        </div>

        {/* Articles à risque (score IA) et KPIs & Prévisions IA */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-shield-check me-2"></i>Articles à risque (score IA)
                </h6>
              </div>
              <div className="card-body">
                {aiData.loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  </div>
                ) : aiData.articlesCritiques.length === 0 ? (
                  <div className="text-center py-4 text-secondary">
                    <i className="bi bi-check-circle fs-1"></i>
                    <p className="mt-2 mb-0">Aucun article critique détecté</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-borderless">
                      <thead>
                        <tr className="text-secondary">
                          <th>Article</th>
                          <th className="text-center">Score</th>
                          <th className="text-center">Niveau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiData.articlesCritiques.map((article, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">{article.article}</td>
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center">
                                <div className="progress w-75" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${article.score >= 80 ? 'bg-danger' : article.score >= 60 ? 'bg-warning' : 'bg-info'}`}
                                    style={{ width: `${article.score}%` }}
                                  />
                                </div>
                                <span className="small mt-1">{article.score}%</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`badge ${article.level === 'CRITIQUE' ? 'bg-danger' : article.level === 'ÉLEVÉ' ? 'bg-warning' : 'bg-info'} bg-opacity-10 text-${article.level === 'CRITIQUE' ? 'danger' : article.level === 'ÉLEVÉ' ? 'warning' : 'info'}`}>
                                {article.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-graph-up me-2"></i>KPIs & Prévisions IA
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-3 text-center">
                      <i className="bi bi-cpu fs-2 text-primary"></i>
                      <h3 className="mt-2 mb-0">{dashboardData.kpisPrevisions?.[0]?.value || '0'}</h3>
                      <small className="text-muted">Simulations réalisées</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-3 text-center">
                      <i className="bi bi-arrow-repeat fs-2 text-primary"></i>
                      <h3 className="mt-2 mb-0">{aiData.articlesCritiques.length}</h3>
                      <small className="text-muted">Articles à risque</small>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center text-muted small">
                  <i className="bi bi-robot me-1"></i>
                  Scores calculés par l'IA (Random Forest)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique évolution stock */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-graph-up me-2"></i>Évolution du stock (6 mois)
                </h6>
              </div>
              <div className="card-body">
                {radarChartLoading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '320px' }}>
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : (
                  <div style={{ height: '320px' }}>
                    <Radar 
                      data={{
                        labels: radarChartData.labels,
                        datasets: [{
                          label: 'Stock moyen',
                          data: radarChartData.values,
                          backgroundColor: 'rgba(13, 110, 253, 0.2)',
                          borderColor: 'rgba(13, 110, 253, 0.8)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(13, 110, 253, 0.8)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(13, 110, 253, 0.8)'
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top articles et Activités récentes */}
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0"> 
                  <i className="bi bi-trophy me-2"></i>Top articles
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['#', 'Article', 'Quantité'],
                  dashboardData.topArticles,
                  (item, idx) => (
                    <>
                      <td className="py-2 text-secondary" style={{ width: '40px' }}>{idx + 1}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-end">{item.quantity} unités</td>
                    </>
                  ),
                  '/articles'
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">                 
                  <i className="bi bi-activity me-2"></i>Activités récentes
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['Action', 'Utilisateur', 'Date'],
                  dashboardData.recentActivities,
                  (item) => (
                    <>
                      <td className="py-2">{item.action}</td>
                      <td className="py-2">{item.user}</td>
                      <td className="py-2 text-end text-secondary small">{item.time}</td>
                    </>
                  ),
                  '/activities'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // ACHETEUR
  // ============================================
  if (role === 'acheteur') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-primary">Dashboard</h4>
            <p className="text-secondary small mb-0">Acheteur</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-transparent pt-3 border-bottom-0">
            <ul className="nav nav-pills card-header-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisAchats' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisAchats')}
                >
                  KPIs Achats
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisFournisseurs' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisFournisseurs')}
                >
                  KPIs Fournisseurs
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {activeTab === 'kpisAchats' && renderKpiCards(dashboardData.kpisAchats)}
            {activeTab === 'kpisFournisseurs' && renderKpiCards(dashboardData.kpisFournisseurs)}
          </div>
        </div>

        {/* Alertes Acheteur avec bouton fermer */}
        {dashboardData.alertesRetards
          ?.filter(alerte => !hiddenAlerts.includes(alerte.id || alerte.message))
          .map((alerte, idx) => (
            <div 
              key={idx} 
              className="alert alert-danger d-flex align-items-center justify-content-between mb-3" 
              role="alert"
              style={{ opacity: 0.9 }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{alerte.message} - {alerte.fournisseur}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => hideAlert(alerte.id || alerte.message)}
                aria-label="Fermer"
              ></button>
            </div>
        ))}

        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0"> 
                  <i className="bi bi-calendar-week me-2"></i>Évolution des délais de livraison
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '320px' }}>
                  <Radar 
                    data={{
                      labels: dashboardData.delaisLivraison.labels,
                      datasets: [{
                        label: 'Délais (jours)',
                        data: dashboardData.delaisLivraison.values,
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderColor: 'rgba(13, 110, 253, 0.8)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(13, 110, 253, 0.8)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(13, 110, 253, 0.8)'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">                 
                  <i className="bi bi-truck me-2"></i>Top fournisseurs
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['#', 'Fournisseur', 'Score', 'Commandes'],
                  dashboardData.topFournisseurs,
                  (item, idx) => (
                    <>
                      <td className="py-2 text-secondary" style={{ width: '40px' }}>{idx + 1}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{item.score}%</td>
                      <td className="py-2 text-end">{item.commandes}</td>
                    </>
                  ),
                  '/fournisseurs'
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">                 
                  <i className="bi bi-activity me-2"></i>Activités récentes
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['Action', 'Utilisateur', 'Date'],
                  dashboardData.recentActivities,
                  (item) => (
                    <>
                      <td className="py-2">{item.action}</td>
                      <td className="py-2">{item.user}</td>
                      <td className="py-2 text-end text-secondary small">{item.time}</td>
                    </>
                  ),
                  '/activities'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MAGASINIER
  // ============================================
  if (role === 'magasinier') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-primary">Tableau de bord</h4>
            <p className="text-secondary small mb-0">Magasinier</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-transparent pt-3 border-bottom-0">
            <ul className="nav nav-pills card-header-pills">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisStock' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisStock')}
                >
                  KPIs Stock
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'kpisAlertes' ? 'active bg-primary text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab('kpisAlertes')}
                >
                  KPIs Alertes
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {activeTab === 'kpisStock' && renderKpiCards(dashboardData.kpisStock)}
            {activeTab === 'kpisAlertes' && renderKpiCards(dashboardData.kpisAlertes)}
          </div>
        </div>

        {/* Alertes Magasinier avec bouton fermer */}
        {dashboardData.stockCritique
          ?.filter(item => !hiddenAlerts.includes(item.id))
          .slice(0, 3)
          .map((item, idx) => (
            <div 
              key={idx} 
              className="alert alert-warning d-flex align-items-center justify-content-between mb-3" 
              role="alert"
              style={{ opacity: 0.9 }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>Stock critique : {item.article_designation} (Stock: {item.stock_actuel} / Seuil: {item.seuil_min})</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => hideAlert(item.id)}
                aria-label="Fermer"
              ></button>
            </div>
        ))}

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">
                  <i className="bi bi-arrow-left-right me-2"></i>Mouvements entrants/sortants
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '320px' }}>
                  <Bar 
                    data={{
                      labels: dashboardData.mouvementsMois.labels,
                      datasets: [
                        {
                          label: 'Entrées',
                          data: dashboardData.mouvementsMois.entrants,
                          backgroundColor: 'rgba(13, 110, 253, 0.5)',
                          borderRadius: 8,
                          barPercentage: 0.6
                        },
                        {
                          label: 'Sorties',
                          data: dashboardData.mouvementsMois.sortants,
                          backgroundColor: 'rgba(220, 53, 69, 0.7)',
                          borderRadius: 8,
                          barPercentage: 0.6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className='card-header border-0 text-center' style={{backgroundColor: '#f0f7ff'}}>
                <h6 className="fw-semibold text-primary mb-0">                
                  <i className="bi bi-activity me-2"></i>Activités récentes
                </h6>
              </div>
              <div className="card-body">
                {renderTableWithSeeAll(
                  ['Action', 'Utilisateur', 'Date'],
                  dashboardData.recentActivities,
                  (item) => (
                    <>
                      <td className="py-2">{item.action}</td>
                      <td className="py-2">{item.user}</td>
                      <td className="py-2 text-end text-secondary small">{item.time}</td>
                    </>
                  ),
                  '/activities'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-5">
      <p className="text-secondary">Rôle non reconnu</p>
    </div>
  )
}

export default Dashboard