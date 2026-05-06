// src/components/Modal.jsx
import React, { useEffect } from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - isOpen : bool - Ouvre/ferme la modal
 *  - onClose : func - Fermeture de la modal
 *  - title : string - Titre de la modal
 *  - size : string - 'sm' | 'md' | 'lg' | 'xl' (défaut: 'md')
 *  - children : ReactNode - Contenu
 *  - actions : ReactNode - Boutons d'action (footer)
 *  - closeOnOverlayClick : bool - Fermer en cliquant sur l'overlay (défaut: true)
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  size = 'md', 
  children, 
  actions,
  closeOnOverlayClick = true 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClass = {
    sm: 'modal--sm',
    md: 'modal--md',
    lg: 'modal--lg',
    xl: 'modal--xl'
  }[size];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${sizeClass}`}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
        {actions && (
          <div className="modal__footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}