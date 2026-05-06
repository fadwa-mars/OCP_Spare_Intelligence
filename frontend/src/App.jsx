// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Landing page
import Landing from './pages/Landing';

// Shared
import Login    from './pages/shared/Login';
import NotFound from './pages/shared/NotFound';

// Magasinier
import DashMagasinier from './pages/magasinier/DashMagasinier';
import ListeStock     from './pages/magasinier/ListeStock';
import Mouvement      from './pages/magasinier/Mouvement';
import Reception      from './pages/magasinier/Reception';

// Acheteur
import DashAcheteur      from './pages/acheteur/DashAcheteur';
import DemandesAchat     from './pages/acheteur/DemandesAchat';
import AppelsOffres      from './pages/acheteur/AppelsOffres';
import Commandes         from './pages/acheteur/Commandes';
import Fournisseurs      from './pages/acheteur/Fournisseurs';

// PI
import DashPi            from './pages/pi/DashPi';
import StockAlertes      from './pages/pi/StockAlertes';
import SeuilsMinMax      from './pages/pi/SeuilsMinMax';
import Reporting         from './pages/pi/Reporting';
import StockMort         from './pages/pi/StockMort';

// Admin
import DashAdmin         from './pages/admin/DashAdmin';
import Utilisateurs      from './pages/admin/Utilisateurs';
import RolesDroits       from './pages/admin/RolesDroits';
import Logs              from './pages/admin/Logs';

// Fournisseur
import DashFournisseur   from './pages/fournisseur/DashFournisseur';
import MesAppelsOffres   from './pages/fournisseur/MesAppelsOffres';
import MesOffres         from './pages/fournisseur/MesOffres';
import MesCommandes      from './pages/fournisseur/MesCommandes';

// Guard : redirige vers login si non connecté
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ==================== MAGASINIER ==================== */}
      <Route path="/magasinier/dashboard" element={
        <PrivateRoute allowedRoles={['magasinier']}>
          <DashMagasinier />
        </PrivateRoute>
      } />
      <Route path="/magasinier/stock" element={
        <PrivateRoute allowedRoles={['magasinier']}>
          <ListeStock />
        </PrivateRoute>
      } />
      <Route path="/magasinier/mouvement" element={
        <PrivateRoute allowedRoles={['magasinier']}>
          <Mouvement />
        </PrivateRoute>
      } />
      <Route path="/magasinier/reception" element={
        <PrivateRoute allowedRoles={['magasinier']}>
          <Reception />
        </PrivateRoute>
      } />

      {/* ==================== ACHETEUR ==================== */}
      <Route path="/acheteur/dashboard" element={
        <PrivateRoute allowedRoles={['acheteur']}>
          <DashAcheteur />
        </PrivateRoute>
      } />
      <Route path="/acheteur/demandes" element={
        <PrivateRoute allowedRoles={['acheteur']}>
          <DemandesAchat />
        </PrivateRoute>
      } />
      <Route path="/acheteur/appels-offres" element={
        <PrivateRoute allowedRoles={['acheteur']}>
          <AppelsOffres />
        </PrivateRoute>
      } />
      <Route path="/acheteur/commandes" element={
        <PrivateRoute allowedRoles={['acheteur']}>
          <Commandes />
        </PrivateRoute>
      } />
      <Route path="/acheteur/fournisseurs" element={
        <PrivateRoute allowedRoles={['acheteur']}>
          <Fournisseurs />
        </PrivateRoute>
      } />

      {/* ==================== PI ==================== */}
      <Route path="/pi/dashboard" element={
        <PrivateRoute allowedRoles={['pi']}>
          <DashPi />
        </PrivateRoute>
      } />
      <Route path="/pi/stock" element={
        <PrivateRoute allowedRoles={['pi']}>
          <StockAlertes />
        </PrivateRoute>
      } />
      <Route path="/pi/seuils" element={
        <PrivateRoute allowedRoles={['pi']}>
          <SeuilsMinMax />
        </PrivateRoute>
      } />
      <Route path="/pi/reporting" element={
        <PrivateRoute allowedRoles={['pi']}>
          <Reporting />
        </PrivateRoute>
      } />
      <Route path="/pi/stock-mort" element={
        <PrivateRoute allowedRoles={['pi']}>
          <StockMort />
        </PrivateRoute>
      } />

      {/* ==================== ADMIN ==================== */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute allowedRoles={['admin']}>
          <DashAdmin />
        </PrivateRoute>
      } />
      <Route path="/admin/utilisateurs" element={
        <PrivateRoute allowedRoles={['admin']}>
          <Utilisateurs />
        </PrivateRoute>
      } />
      <Route path="/admin/roles" element={
        <PrivateRoute allowedRoles={['admin']}>
          <RolesDroits />
        </PrivateRoute>
      } />
      <Route path="/admin/logs" element={
        <PrivateRoute allowedRoles={['admin']}>
          <Logs />
        </PrivateRoute>
      } />

      {/* ==================== FOURNISSEUR ==================== */}
      <Route path="/fournisseur/dashboard" element={
        <PrivateRoute allowedRoles={['fournisseur']}>
          <DashFournisseur />
        </PrivateRoute>
      } />
      <Route path="/fournisseur/appels-offres" element={
        <PrivateRoute allowedRoles={['fournisseur']}>
          <MesAppelsOffres />
        </PrivateRoute>
      } />
      <Route path="/fournisseur/offres" element={
        <PrivateRoute allowedRoles={['fournisseur']}>
          <MesOffres />
        </PrivateRoute>
      } />
      <Route path="/fournisseur/commandes" element={
        <PrivateRoute allowedRoles={['fournisseur']}>
          <MesCommandes />
        </PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;