// src/components/FormCard.jsx
import React from 'react';
import '../styles/design-system.css';

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

// ── Champ input ───────────────────────────────────────────────
export function Field({
  id, label, type = 'text', placeholder,
  value, onChange, icon, rightElement, error, autoComplete,
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <div className="field__input-wrapper">
        {icon && <span className="material-symbols-outlined field__icon">{icon}</span>}
        <input
          id={id}
          className={[
            'field__input',
            icon          ? 'field__input--with-icon'   : '',
            rightElement  ? 'field__input--with-toggle' : '',
          ].join(' ')}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {rightElement}
      </div>
      {error && (
        <span className="field__error-msg">
          <span className="material-symbols-outlined">error</span>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function SelectField({ id, label, value, onChange, options = [], icon, error }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <div className="field__input-wrapper">
        {icon && <span className="material-symbols-outlined field__icon">{icon}</span>}
        <select
          id={id}
          className={`field__input field__select ${icon ? 'field__input--with-icon' : ''}`}
          value={value}
          onChange={onChange}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="material-symbols-outlined field__select-arrow">expand_more</span>
      </div>
      {error && (
        <span className="field__error-msg">
          <span className="material-symbols-outlined">error</span>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function TextareaField({ id, label, placeholder, value, onChange, rows = 4, error }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className="field__input field__textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
      />
      {error && (
        <span className="field__error-msg">
          <span className="material-symbols-outlined">error</span>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────
export function CheckboxField({ id, label, checked, onChange }) {
  return (
    <label className="checkbox-label" htmlFor={id}>
      <input id={id} type="checkbox" className="checkbox-input" checked={checked} onChange={onChange} />
      <span className="checkbox-custom" />
      <span className="checkbox-text">{label}</span>
    </label>
  );
}

// ── Bouton ────────────────────────────────────────────────────
export function FormButton({ label, icon, onClick, type = 'button', variant = 'primary', fullWidth = false, disabled = false }) {
  return (
    <button
      type={type}
      className={['fc-btn', `fc-btn--${variant}`, fullWidth ? 'fc-btn--full' : ''].join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {label}
    </button>
  );
}

// ── Grille 2 colonnes ─────────────────────────────────────────
export function FormRow({ children }) {
  return <div className="form-row">{children}</div>;
}

// ── Diviseur ──────────────────────────────────────────────────
export function FormDivider() {
  return <div className="form-divider" />;
}

// ── Label de section ──────────────────────────────────────────
export function FormSectionLabel({ children }) {
  return <p className="form-section-label">{children}</p>;
}

// ── Lien texte ────────────────────────────────────────────────
export function FormLink({ href = '#', onClick, children }) {
  return <a href={href} className="fc-link" onClick={onClick}>{children}</a>;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
/**
 * Props :
 *   title       string      — titre
 *   description string      — sous-titre
 *   icon        string      — icône Material Symbols
 *   children    ReactNode   — champs
 *   actions     ReactNode   — boutons footer (CRUD)
 *   footer      ReactNode   — contenu footer alternatif (login)
 *   centered    bool        — mode plein écran centré (login)
 *   maxWidth    string      — largeur max de la card
 */
export default function FormCard({
  title, description, icon,
  children, actions, footer,
  centered = false,
  maxWidth = '480px',
}) {
  const card = (
    <div className="fc-card" style={{ maxWidth, width: '100%' }}>

      {/* Header */}
      {(icon || title || description) && (
        <div className={`fc-header ${centered ? 'fc-header--centered' : ''}`}>
          {icon && (
            <div className="fc-header__icon">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          )}
          <div className="fc-header__text">
            {title       && <h1 className="fc-header__title">{title}</h1>}
            {description && <p  className="fc-header__desc">{description}</p>}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="fc-body">{children}</div>

      {/* Footer */}
      {(actions || footer) && (
        <div className={`fc-footer ${centered ? 'fc-footer--centered' : ''}`}>
          {actions ?? footer}
        </div>
      )}
    </div>
  );

  return centered
    ? <div className="login-page">{card}</div>
    : <div className="formcard-wrapper">{card}</div>;
}