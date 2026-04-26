// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../api/authApi'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const response = await authApi.getMe()
      if (response.success) {
        setUser(response.data)
      } else {
        logout()
      }
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password)
      if (response.success) {
        const { access_token, user } = response.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(access_token)
        setUser(user)
        toast.success('Connexion réussie')
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignorer les erreurs
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      toast.info('Déconnexion réussie')
    }
  }

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData)
      if (response.success) {
        toast.success('Inscription réussie')
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      const message = error.response?.data?.message || "Erreur d'inscription"
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}