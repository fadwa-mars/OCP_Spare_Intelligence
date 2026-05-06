// src/components/ConfirmDialog.jsx pour la confirmation de suppression
import React from 'react';
import Modal from './Modal';
import { FormButton } from './FormCard';
import '../styles/design-system.css';

/**
 * Props :
 *  - isOpen : bool - Ouvre/ferme le dialogue
 *  - onClose : func - Fermeture
 *  - onConfirm : func - Action de confirmation
 *  - title : string - Titre (défaut: "Confirmer")
 *  - message : string - Message de confirmation
 *  - confirmText : string - Texte bouton confirm (défaut: "Confirmer")
 *  - cancelText : string - Texte bouton annuler (défaut: "Annuler")
 *  - variant : string - 'danger' | 'primary' (défaut: 'primary')
 */
export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmer',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'primary'
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <FormButton 
            label={cancelText} 
            variant="secondary" 
            onClick={onClose} 
          />
          <FormButton 
            label={confirmText} 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={handleConfirm} 
          />
        </>
      }
    >
      <div className="confirm-dialog__message">{message}</div>
    </Modal>
  );
}