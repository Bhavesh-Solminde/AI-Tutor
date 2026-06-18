import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  loginWithEmail: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore token + fetch current user from backend
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      authAPI.getMe()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback: token arrives in URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      // Clean token from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Fetch user
      authAPI.getMe()
        .then((data) => setUser(data.user))
        .catch(console.error);
    }
  }, []);

  // Email/password login
  const loginWithEmail = async ({ email, password }) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Email/password register
  const register = async ({ email, password, name }) => {
    const data = await authAPI.register({ email, password, name });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Legacy mock login (kept for compatibility during transition)
  const login = (userData = {}) => {
    const newUser = {
      id: 'mock-user-123',
      name: userData.name || 'Alex Mercer',
      email: userData.email || 'alex@neuralnest.ai',
      avatar: userData.avatar || '',
      explanationLevel: 'beginner',
      onboarded: false,
      ...userData
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithEmail, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
