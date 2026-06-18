import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      error: null,

      // Called on app mount — restore session from token
      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) { set({ loading: false }); return; }
        try {
          const { data } = await api.get('/api/auth/me', { _silent: true });
          set({ user: data.user, token, loading: false, error: null });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, loading: false });
        }
      },

      // Email/password register
      register: async ({ email, password, name }) => {
        set({ error: null });
        const { data } = await api.post('/api/auth/register', { email, password, name });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, error: null });
        return data.user;
      },

      // Email/password login
      loginWithEmail: async ({ email, password }) => {
        set({ error: null });
        const { data } = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, error: null });
        return data.user;
      },

      // Google OAuth redirect
      loginWithGoogle: () => {
        window.location.href = `${BASE_URL}/api/auth/google`;
      },

      // GitHub OAuth redirect
      loginWithGithub: () => {
        window.location.href = `${BASE_URL}/api/auth/github`;
      },

      // Called from OAuth callback page — token arrives in URL query param
      handleOAuthCallback: async (token) => {
        localStorage.setItem('token', token);
        set({ token });
        const { data } = await api.get('/api/auth/me');
        set({ user: data.user, loading: false });
        return data.user;
      },

      // Update local user (for explanation level, onboarded flag, etc.)
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
        window.location.href = '/';
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'neuralnest-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Listen for 401 events from axiosClient
window.addEventListener('neuralnest:unauthorized', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
