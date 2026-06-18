import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ─── Human-readable error messages keyed by status code ──────────────────────
const ERROR_MESSAGES = {
  400: (msg) => msg || 'Invalid request. Please check your input.',
  401: () => 'Your session has expired. Please log in again.',
  403: () => "You don't have permission to do this.",
  404: (msg) => msg || "The resource you're looking for doesn't exist.",
  409: (msg) => msg || 'This record already exists.',
  413: () => 'File is too large. Maximum size is 10MB.',
  422: (msg) => msg || 'Validation failed. Please check your input.',
  429: () => 'Too many requests. Please wait a moment and try again.',
  500: (msg, id) => `Server error${id ? ` (ID: ${id})` : ''}. Try again in a few seconds.`,
  502: (msg) => msg || 'AI service is temporarily unavailable. Please try again in a moment.',
  503: () => 'NeuralNest is temporarily unavailable. We are working on it.',
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: inject JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: map errors to human messages ──────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Network / timeout
    if (!error.response) {
      const message = error.code === 'ECONNABORTED'
        ? 'Request timed out. Please check your connection and try again.'
        : 'Unable to reach NeuralNest servers. Check your internet connection.';
      if (!error.config?._silent) toast.error(message, { id: 'network-err' });
      return Promise.reject(new Error(message));
    }

    const { status, data } = error.response;
    const serverMsg = data?.error || data?.message || '';
    const requestId = data?.requestId || '';

    // Build human message
    const messageFn = ERROR_MESSAGES[status];
    const message = messageFn
      ? messageFn(serverMsg, requestId)
      : serverMsg || `Unexpected error (${status}). Please try again.`;

    // 401 → force logout
    if (status === 401) {
      localStorage.removeItem('token');
      // Dispatch a custom event so AuthStore can react
      window.dispatchEvent(new CustomEvent('neuralnest:unauthorized'));
    }

    // Show toast unless caller opts out
    if (!error.config?._silent) {
      toast.error(message, { duration: 5000, id: `err-${status}` });
    }

    // Attach human message to error for local handling
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;

// ─── SSE helper (Fetch-based — Axios doesn't support streaming) ───────────────
export function createSSERequest(endpoint, body) {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
