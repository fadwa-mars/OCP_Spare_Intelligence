// src/components/StatCard.jsx
import React from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - title : string - Titre de la statistique (ex: "Stock total")
 *  - value : string|number - Valeur principale
 *  - icon : string - Nom de l'icône Material Symbols
 *  - trend : number - Tendance en pourcentage (ex: +12, -5)
 *  - subtitle : string - Texte secondaire (ex: "vs mois dernier")
 *  - color : string - Couleur de l'icône (primary, warning, negative, info)
 *  - onClick : func - Optionnel, rend la carte cliquable
 */
export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle, 
  color = 'primary',
  onClick 
}) {
  const getColorClass = () => {
    switch (color) {
      case 'warning': return 'stat-card--warning';
      case 'negative': return 'stat-card--negative';
      case 'info': return 'stat-card--info';
      default: return 'stat-card--primary';
    }
  };

  const getTrendIcon = () => {
    if (trend > 0) return 'arrow_upward';
    if (trend < 0) return 'arrow_downward';
    return 'trending_flat';
  };

  const getTrendColor = () => {
    if (trend > 0) return 'trend-positive';
    if (trend < 0) return 'trend-negative';
    return 'trend-neutral';
  };

  return (
    <div className={`stat-card ${getColorClass()}`} onClick={onClick} role={onClick ? 'button' : 'article'}>
      <div className="stat-card__header">
        <div className="stat-card__icon">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`stat-card__trend ${getTrendColor()}`}>
            <span className="material-symbols-outlined">{getTrendIcon()}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__title">{title}</div>
      {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
    </div>
  );
}