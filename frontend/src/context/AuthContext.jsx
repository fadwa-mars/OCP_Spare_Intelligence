// src/context/AuthContext.jsx
// Simule l'authentification — à remplacer par un vrai appel API plus tard
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Utilisateurs de test — à remplacer par JWT + API Laravel
const MOCK_USERS = [
  { id: 1, nom: 'Karim Mansouri',  email: 'magasinier@ocp.ma',  role: 'magasinier'  },
  { id: 2, nom: 'Amina Benali',    email: 'acheteur@ocp.ma',    role: 'acheteur'    },
  { id: 3, nom: 'Youssef El Fassi',email: 'pi@ocp.ma',          role: 'pi'          },
  { id: 4, nom: 'Sara Admin',      email: 'admin@ocp.ma',       role: 'admin'       },
  { id: 5, nom: 'Ali Fournisseur', email: 'fournisseur@ocp.ma', role: 'fournisseur' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Simulation — en prod : appel API POST /api/login
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return { success: true, role: found.role };
    }
    return { success: false, error: 'Email ou mot de passe incorrect.' };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}