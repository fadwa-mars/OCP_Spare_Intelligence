// src/components/AlertBanner.jsx
import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - type : string - 'info' | 'success' | 'warning' | 'error'
 *  - title : string - Titre de l'alerte
 *  - message : string - Message détaillé
 *  - dismissible : bool - Afficher le bouton de fermeture (défaut: true)
 *  - onDismiss : func - Callback à la fermeture
 *  - actions : ReactNode - Boutons d'action (ex: "Voir détails")
 */
export default function AlertBanner({ 
  type = 'info', 
  title, 
  message, 
  dismissible = true, 
  onDismiss,
  actions 
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const typeClass = {
    info: 'alert-banner--info',
    success: 'alert-banner--success',
    warning: 'alert-banner--warning',
    error: 'alert-banner--error'
  }[type];

  return (
    <div className={`alert-banner ${typeClass}`}>
      <div className="alert-banner__icon">
        <span className="material-symbols-outlined">{getIcon()}</span>
      </div>
      <div className="alert-banner__content">
        <div className="alert-banner__title">{title}</div>
        <div className="alert-banner__message">{message}</div>
        {actions && <div className="alert-banner__actions">{actions}</div>}
      </div>
      {dismissible && (
        <button className="alert-banner__dismiss" onClick={handleDismiss}>
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}