// src/pages/auth/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="container-fluid" style={{backgroundColor: '#f0f7ff'}}>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
          
          {/* Carte formulaire */}
          <div className="card border-0 shadow-sm rounded-2">
            <div className="card-body p-4 p-sm-5">
              
              {/* Logo et titre */}
              <div className="text-center mb-4">
                <h4 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>OCP Spare Intelligence</h4>
                <p className="text-muted small mb-0">Gestion des pièces de rechange</p>
              </div>

              {/* Badge Connexion */}
              <div className="text-center mb-4">
                <span className="badge px-4 py-2 rounded-pill fw-semibold" style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                  Connexion
                </span>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold mb-1">Email</label>
                  <input
                    type="email"
                    className="form-control py-2"
                    style={{ borderColor: '#e5e7eb', borderRadius: '8px' }}
                    placeholder="admin@ocp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Mot de passe */}
                <div className="mb-2">
                  <label className="form-label small text-secondary fw-semibold mb-1">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control py-2"
                    style={{ borderColor: '#e5e7eb', borderRadius: '8px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Lien mot de passe oublié */}
                <div className="text-end mb-4">
                  <a href="#" className="small text-decoration-none" style={{ color: '#0d6efd' }}>
                    Mot de passe oublié ?
                  </a>
                </div>

                {/* Bouton Se connecter */}
                <button
                  type="submit"
                  className="btn w-100 py-2 fw-semibold rounded-3"
                  style={{ backgroundColor: '#0d6efd', color: 'white', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>

              </form>

              {/* Comptes de test */}
              <div className="mt-4 pt-2 text-center">
                <small className="text-muted">
                  <span className="fw-semibold">Comptes test :</span><br />
                  admin@ocp.com / password
                </small>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login