// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Layout from './components/Layout/Layout'
import ArticleList from './pages/articles/ArticleList'
import ArticleForm from './pages/articles/ArticleForm'
import ArticleDetail from './pages/articles/ArticleDetail'
import StockList from './pages/stocks/StockList'
import DemandeList from './pages/demandes/DemandeList'
import DemandeForm from './pages/demandes/DemandeForm'
import CommandeList from './pages/commandes/CommandeList'
import CommandeForm from './pages/commandes/CommandeForm'
import AppelOffreList from './pages/appels-offres/AppelOffreList'
import AppelOffreForm from './pages/appels-offres/AppelOffreForm'
import SelectionOffre from './pages/appels-offres/SelectionOffre'
import Dashboard from './pages/Dashboard'
import Profile from './pages/profile/Profile'

// ========== IMPORTS FOURNISSEUR ==========
import AppelsOffresFournisseur from './pages/fournisseur/AppelsOffres'
import MesOffres from './pages/fournisseur/MesOffres'
import MesCommandes from './pages/fournisseur/MesCommandes'
// ==========================================

// ========== IMPORTS FOURNISSEURS (CRUD) ==========
import FournisseurList from './pages/fournisseurs/FournisseurList'
import FournisseurForm from './pages/fournisseurs/FournisseurForm'
import FournisseurDetail from './pages/fournisseurs/FournisseurDetail'
// =================================================

// ========== IMPORTS ALERTES ==========
import AlerteList from './pages/alertes/AlerteList'
// =====================================

// ========== IMPORTS RAPPORTS ==========
import ReportingList from './pages/reportings/ReportingList'
// ======================================

// ========== IMPORTS CLASSIFICATIONS ==========
import ClassificationList from './pages/classifications/ClassificationList'
// =============================================

// ========== IMPORTS SIMULATIONS ==========
import SimulationList from './pages/simulations/SimulationList'
// =========================================

import './App.css'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* Routes protegees avec Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Routes Articles */}
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/new" element={<ArticleForm />} />
        <Route path="articles/:id" element={<ArticleDetail />} />
        <Route path="articles/edit/:id" element={<ArticleForm />} />
        
        {/* Routes Stocks */}
        <Route path="stocks" element={<StockList />} />
        
        {/* Routes Demandes d'achat */}
        <Route path="demandes" element={<DemandeList />} />
        <Route path="demandes/new" element={<DemandeForm />} />
        <Route path="demandes/edit/:id" element={<DemandeForm />} />
        
        {/* Routes Commandes */}
        <Route path="commandes" element={<CommandeList />} />
        <Route path="commandes/new" element={<CommandeForm />} />
        
        {/* Routes Appels d'offres (admin, acheteur) */}
        <Route path="appels-offres" element={<AppelOffreList />} />
        <Route path="appels-offres/new" element={<AppelOffreForm />} />
        <Route path="appels-offres/:id/selection" element={<SelectionOffre />} />
        
        {/* Routes Alertes */}
        <Route path="alertes" element={<AlerteList />} />
        
        {/* Routes Rapports */}
        <Route path="reportings" element={<ReportingList />} />
        
        {/* Routes Classifications */}
        <Route path="classifications" element={<ClassificationList />} />
        
        {/* Routes Simulations */}
        <Route path="simulations" element={<SimulationList />} />
        
        {/* Routes Profil */}
        <Route path="profile" element={<Profile />} />
        
        {/* ========== ROUTES FOURNISSEUR (PROFIL) ========== */}
        <Route path="fournisseur/appels-offres" element={<AppelsOffresFournisseur />} />
        <Route path="fournisseur/mes-offres" element={<MesOffres />} />
        <Route path="fournisseur/mes-commandes" element={<MesCommandes />} />
        {/* ================================================ */}
        
        {/* ========== ROUTES FOURNISSEURS (CRUD) ========== */}
        <Route path="fournisseurs" element={<FournisseurList />} />
        <Route path="fournisseurs/new" element={<FournisseurForm />} />
        <Route path="fournisseurs/:id" element={<FournisseurDetail />} />
        <Route path="fournisseurs/edit/:id" element={<FournisseurForm />} />
        {/* ================================================ */}
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App