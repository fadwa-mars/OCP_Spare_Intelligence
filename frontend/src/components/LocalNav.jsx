// src/components/LocalNav.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ROUTES_BY_ROLE } from '../constants/navLinks';
import '../styles/design-system.css';

export default function LocalNav({ links = [], active, onChange }) {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const handleClick = (link) => {
    onChange?.(link);
    const routes = NAV_ROUTES_BY_ROLE[user?.role] || {};
    const route  = routes[link];
    if (route) navigate(route);
  };

  return (
    <div className="localnav">
      <div className="localnav__inner">
        {links.map((link) => (
          <button
            key={link}
            className={`localnav__pill ${active === link ? 'localnav__pill--active' : ''}`}
            onClick={() => handleClick(link)}
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}