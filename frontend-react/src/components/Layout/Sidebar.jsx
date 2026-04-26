// src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Détecter le redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsOpen(true) // Sur desktop, sidebar toujours ouverte
      } else {
        setIsOpen(false) // Sur mobile, sidebar fermée par défaut
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const getMenuItems = () => {
    const role = user?.role

    const commonMenus = [
      { path: '/dashboard', name: 'Dashboard', icon: 'bi-speedometer2' }
    ]

    const planificateurMenus = [
      { path: '/articles', name: 'Articles', icon: 'bi-box-seam' },
      { path: '/stocks', name: 'Stocks', icon: 'bi-graph-up' },
      { path: '/demandes', name: 'Demandes d\'achat', icon: 'bi-file-text' },
      { path: '/alertes', name: 'Alertes', icon: 'bi-bell' },
      { path: '/classifications', name: 'ABC/XYZ', icon: 'bi-pie-chart' },
      { path: '/simulations', name: 'Simulations', icon: 'bi-cpu' },
      { path: '/reportings', name: 'Rapports', icon: 'bi-file-earmark-text' }
    ]

    const acheteurMenus = [
      { path: '/articles', name: 'Articles', icon: 'bi-box-seam' },
      { path: '/demandes', name: 'Demandes d\'achat', icon: 'bi-file-text' },
      { path: '/appels-offres', name: 'Appels d\'offres', icon: 'bi-megaphone' },
      { path: '/commandes', name: 'Commandes', icon: 'bi-cart-check' },
      { path: '/fournisseurs', name: 'Fournisseurs', icon: 'bi-truck' },
      { path: '/alertes', name: 'Alertes', icon: 'bi-bell' },
      { path: '/reportings', name: 'Rapports', icon: 'bi-file-earmark-text' }
    ]

    const magasinierMenus = [
      { path: '/articles', name: 'Articles', icon: 'bi-box-seam' },
      { path: '/stocks', name: 'Stocks', icon: 'bi-graph-up' },
      { path: '/alertes', name: 'Alertes', icon: 'bi-bell' }
    ]

    const adminMenus = [
      { path: '/articles', name: 'Articles', icon: 'bi-box-seam' },
      { path: '/stocks', name: 'Stocks', icon: 'bi-graph-up' },
      { path: '/demandes', name: 'Demandes d\'achat', icon: 'bi-file-text' },
      { path: '/appels-offres', name: 'Appels d\'offres', icon: 'bi-megaphone' },
      { path: '/commandes', name: 'Commandes', icon: 'bi-cart-check' },
      { path: '/fournisseurs', name: 'Fournisseurs', icon: 'bi-truck' },
      { path: '/alertes', name: 'Alertes', icon: 'bi-bell' },
      { path: '/classifications', name: 'ABC/XYZ', icon: 'bi-pie-chart' },
      { path: '/simulations', name: 'Simulations', icon: 'bi-cpu' },
      { path: '/admin/users', name: 'Utilisateurs', icon: 'bi-people' },
      { path: '/reportings', name: 'Rapports', icon: 'bi-file-earmark-text' }
    ]

    const fournisseurMenus = [
      { path: '/fournisseur/appels-offres', name: 'Appels d\'offres', icon: 'bi-megaphone' },
      { path: '/fournisseur/mes-offres', name: 'Mes offres', icon: 'bi-send' },
      { path: '/fournisseur/mes-commandes', name: 'Mes commandes', icon: 'bi-cart' }
    ]

    switch (role) {
      case 'planificateur':
        return [...commonMenus, ...planificateurMenus]
      case 'acheteur':
        return [...commonMenus, ...acheteurMenus]
      case 'magasinier':
        return [...commonMenus, ...magasinierMenus]
      case 'admin':
        return [...commonMenus, ...adminMenus]
      case 'fournisseur':
        return [...commonMenus, ...fournisseurMenus]
      default:
        return commonMenus
    }
  }

  const menuItems = getMenuItems()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    if (isMobile) toggleSidebar()
  }

  // Styles pour le bouton hamburger (visible uniquement sur mobile ET quand sidebar est fermée)
  const hamburgerStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1100,
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    display: (isMobile && !isOpen) ? 'flex' : 'none', // ← MODIFICATION ICI
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  }

  // Overlay pour mobile
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1040,
    display: isMobile && isOpen ? 'block' : 'none',
    transition: 'all 0.3s ease'
  }

  // Style principal de la sidebar
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: isMobile ? (isOpen ? '0' : '-300px') : '0',
    width: '280px',
    height: '100vh',
    transition: 'left 0.3s ease-in-out',
    zIndex: 1050,
    backgroundColor: '#ffffff',
    boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.15)' : '2px 0 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e5e7eb'
  }

  return (
    <>
      {/* Bouton hamburger pour mobile - visible seulement quand sidebar est fermée */}
      <button
        onClick={toggleSidebar}
        style={hamburgerStyle}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <FaBars size={22} />
      </button>

      {/* Overlay pour fermer la sidebar sur mobile */}
      <div 
        style={overlayStyle}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Header avec logo */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f0f7ff',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h5 className='fw-bold text-primary'>OCP Spare Intelligence</h5>
            </div>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2'
                  e.currentTarget.style.color = '#dc3545'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6c757d'
                }}
              >
                <FaTimes size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          minHeight: 0
        }}>
          <ul className="nav nav-pills flex-column p-3" style={{ margin: 0, padding: '1rem' }}>
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path} style={{ listStyle: 'none' }}>
                <NavLink
                  to={item.path}
                  onClick={isMobile ? toggleSidebar : undefined}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : 'text-secondary'}`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? '#0d6efd' : 'transparent',
                    color: isActive ? 'white' : '#4a5568',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    padding: '10px 12px',
                    whiteSpace: 'nowrap'
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)'
                      e.currentTarget.style.color = '#0d6efd'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#4a5568'
                    }
                  }}
                >
                  <i className={`${item.icon} fs-6`} style={{ width: '20px' }}></i>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer avec profil utilisateur */}
        <div className="border-top p-3" style={{ flexShrink: 0, backgroundColor: "#f0f7ff" }}>
          <div className="d-flex align-items-center justify-content-between">
            <NavLink
              to="/profile"
              className="d-flex align-items-center gap-2 text-decoration-none"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <i className="bi bi-person-circle fs-4" style={{ color: '#0d6efd' }}></i>
              <div>
                <div className="fw-semibold" style={{ color: '#0d6efd', fontSize: '14px', lineHeight: '1.3', marginBottom: '2px' }}>
                  {user?.name}
                </div>
                <span className="text-muted" style={{ fontSize: '11px', display: 'block', lineHeight: '1.2' }}>
                  {user?.role === 'planificateur' ? 'Planificateur PI' : user?.role === 'fournisseur' ? 'Fournisseur' : user?.role}
                </span>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="btn btn-link text-decoration-none p-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{ color: '#6c757d', width: '36px', height: '36px', transition: 'all 0.2s', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2'
                e.currentTarget.style.color = '#dc3545'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6c757d'
              }}
              title="Déconnexion"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Ajustement du margin-left du contenu principal */}
      <style jsx>{`
        @media (min-width: 768px) {
          .main-content {
            margin-left: 280px;
          }
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar