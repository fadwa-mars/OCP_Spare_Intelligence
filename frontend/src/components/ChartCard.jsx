// src/components/ChartCard.jsx
import React from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - title : string - Titre du graphique
 *  - children : ReactNode - Le graphique (Recharts, etc.)
 *  - actions : ReactNode - Boutons d'action (export, filtres)
 *  - height : number - Hauteur du graphique (défaut: 300)
 */
export default function ChartCard({ title, children, actions, height = 300 }) {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
        {actions && <div className="chart-card__actions">{actions}</div>}
      </div>
      <div className="chart-card__body" style={{ height }}>
        {children}
      </div>
    </div>
  );
}