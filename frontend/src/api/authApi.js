// src/api/authApi.js
import axiosInstance from './axiosConfig'

export const authApi = {
  // Connexion
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
  },

  // Inscription
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData)
    return response.data
  },

  // Déconnexion
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },

  // Récupérer l'utilisateur connecté
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me')
    return response.data
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/auth/profile', data)
    return response.data
  },
}