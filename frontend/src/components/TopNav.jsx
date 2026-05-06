// src/components/TopNav.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MonProfil from './MonProfil';
import '../styles/design-system.css';

export default function TopNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profilOpen, setProfilOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="topnav">
        <span className="topnav__brand">OCP Spare Intelligence</span>

        <div className="topnav__actions">
          <button className="topnav__icon-btn" aria-label="notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button 
            className="topnav__icon-btn topnav__user" 
            aria-label="profil"
            onClick={() => setProfilOpen(true)}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>

          <button className="topnav__icon-btn" aria-label="déconnexion" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </nav>

      <MonProfil isOpen={profilOpen} onClose={() => setProfilOpen(false)} />
    </>
  );
}