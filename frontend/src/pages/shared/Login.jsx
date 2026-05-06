// src/pages/shared/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormCard, { Field, CheckboxField, FormButton, FormLink } from '../../components/FormCard';
import '../../styles/design-system.css';

// Route de redirection selon le rôle
const ROLE_REDIRECT = {
  magasinier:  '/magasinier/dashboard',
  acheteur:    '/acheteur/dashboard',
  pi:          '/pi/dashboard',
  admin:       '/admin/dashboard',
  fournisseur: '/fournisseur/dashboard',
};

export default function Login() {
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = () => {
    setError('');
    const result = login(email, password);
    if (result.success) {
      navigate(ROLE_REDIRECT[result.role] || '/');
    } else {
      setError(result.error);
    }
  };

  return (
    <FormCard
      centered
      maxWidth="440px"
      icon="inventory_2"
      title="OCP Spare Intelligence"
      description="Plateforme de gestion intelligente des pièces de rechange"
      footer={
        <span>
          Un problème ?{' '}
          <FormLink href="mailto:admin@ocp.ma">
            Contacter votre administrateur
          </FormLink>
        </span>
      }
    >
      <Field
        id="email"
        label="Adresse e-mail"
        type="email"
        placeholder="vous@ocp.ma"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon="mail"
        autoComplete="email"
      />

      <Field
        id="password"
        label="Mot de passe"
        type={showPass ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon="lock"
        autoComplete="current-password"
        error={error}
        rightElement={
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShowPass((v) => !v)}
          >
            <span className="material-symbols-outlined">
              {showPass ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <div className="fc-inline-row">
        <CheckboxField
          id="remember"
          label="Se souvenir de moi"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <FormLink href="#">Mot de passe oublié ?</FormLink>
      </div>

      <FormButton
        label="CONNEXION"
        icon="login"
        variant="primary"
        fullWidth
        onClick={handleSubmit}
      />
    </FormCard>
  );
}