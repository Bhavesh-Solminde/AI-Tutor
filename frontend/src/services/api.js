/**
 * Centralized API service for NeuralNest frontend.
 * All backend calls go through here — base URL from .env
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ─── Helper ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),
  // OAuth — redirect browser directly
  googleLogin: () => { window.location.href = `${BASE_URL}/api/auth/google`; },
  githubLogin: () => { window.location.href = `${BASE_URL}/api/auth/github`; },
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadFile: (formData) =>
    fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData, // multer — do NOT set Content-Type
    }).then((r) => r.json()),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessionAPI = {
  create: (data) => request('/api/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getTopics: (sessionId) => request(`/api/sessions/${sessionId}/topics`),
  getRoadmap: (sessionId) => request(`/api/roadmap/${sessionId}`),
};

// ─── Topics ───────────────────────────────────────────────────────────────────
export const topicAPI = {
  saveBaseline: (data) => request('/api/topics/baseline', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Tutor (SSE streaming) ────────────────────────────────────────────────────
export const tutorAPI = {
  /**
   * Opens an SSE stream to /api/tutor/chat.
   * onToken(token) called for each word, onDone(meta) called at completion.
   * Returns a controller to abort the stream.
   */
  chat: ({ topicId, message, type, chatHistoryId }, onToken, onDone) => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/api/tutor/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ topicId, message, type, chatHistoryId }),
      signal: controller.signal,
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) onToken(parsed.token);
            if (parsed.done) onDone(parsed);
          } catch {}
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') console.error('SSE error:', err);
    });

    return controller;
  },

  openSession: (data) => request('/api/tutor/open', { method: 'POST', body: JSON.stringify(data) }),
  saveRating: (data) => request('/api/tutor/rating', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const quizAPI = {
  generate: (data) => request('/api/quiz/generate', { method: 'POST', body: JSON.stringify(data) }),
  submit: (data) => request('/api/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
  get: (userId) => request(`/api/progress/${userId}`),
  update: (data) => request('/api/progress/update', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Study Plan ───────────────────────────────────────────────────────────────
export const studyPlanAPI = {
  generate: (data) => request('/api/studyplan/generate', { method: 'POST', body: JSON.stringify(data) }),
  get: (userId) => request(`/api/studyplan/${userId}`),
  markDayComplete: (dayId, data) => request(`/api/studyplan/day/${dayId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Exam ─────────────────────────────────────────────────────────────────────
export const examAPI = {
  setup: (data) => request('/api/exam/setup', { method: 'POST', body: JSON.stringify(data) }),
  uploadSyllabus: (formData) =>
    fetch(`${BASE_URL}/api/exam/upload-syllabus`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then((r) => r.json()),
  uploadPYQ: (formData) =>
    fetch(`${BASE_URL}/api/exam/upload-pyq`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then((r) => r.json()),
  get: (userId) => request(`/api/exam/${userId}`),
};

// ─── Chat History ─────────────────────────────────────────────────────────────
export const chatHistoryAPI = {
  get: (userId) => request(`/api/chat-history/${userId}`),
  create: (data) => request('/api/chat-history', { method: 'POST', body: JSON.stringify(data) }),
  delete: (chatId) => request(`/api/chat-history/${chatId}`, { method: 'DELETE' }),
};
