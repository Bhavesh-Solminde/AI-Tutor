import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axiosClient';

/**
 * Poll /api/sessions/:id/topics every 3s until topics appear (max 3 min).
 * Resolves with the topics array when ready.
 */
async function pollForTopics(sessionId, onTopicsReady) {
  const MAX_ATTEMPTS = 60; // 60 × 3s = 3 minutes
  let attempts = 0;
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await api.get(`/api/sessions/${sessionId}/topics`, { _silent: true });
        const topics = data.topics || [];
        if (topics.length > 0) {
          clearInterval(interval);
          onTopicsReady(topics);
          resolve(topics);
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          resolve([]);
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          resolve([]);
        }
      }
    }, 3000);
  });
}

const useSessionStore = create(
  persist(
    (set, get) => ({
      currentSession: null,
      allSessions: [],       // all non-deleted sessions for the switcher UI
      topics: [],
      roadmapNodes: [],
      roadmapEdges: [],
      uploading: false,
      topicsProcessing: false,
      loading: false,
      error: null,
      uploadedFile: null,

      // Upload PDF / text file → embed in Pinecone → topics extracted in background
      uploadFile: async (formData) => {
        set({ uploading: true, error: null, topicsProcessing: false });
        try {
          const { data } = await api.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120_000, // 2 min for Cloudinary + Pinecone embed
          });
          const session = { _id: data.sessionId, name: data.sessionName || formData.get('sessionName') || 'Uploaded Notes' };
          set({ currentSession: session, topics: data.topics || [], roadmapNodes: data.roadmapNodes || [], uploading: false });

          // Background extraction in progress — poll for topics
          if (data.processing) {
            set({ topicsProcessing: true });
            pollForTopics(data.sessionId, (topics) => {
              const nodes = topics.map((t, i) => ({
                id: t._id, label: t.name, status: 'unstarted',
                position: { x: 250, y: i * 150 }, difficulty: t.difficulty,
                estimatedMinutes: t.estimatedMinutes,
              }));
              set({ topics, roadmapNodes: nodes, topicsProcessing: false });
            });
          }
          return data;
        } catch (err) {
          set({ uploading: false, topicsProcessing: false, error: err.userMessage || 'Upload failed.' });
          throw err;
        }
      },

      // Paste raw notes text
      uploadText: async (rawText, sessionName) => {
        set({ uploading: true, error: null, topicsProcessing: false });
        try {
          const { data } = await api.post('/api/upload', { rawText, sessionName }, { timeout: 120_000 });
          const session = { _id: data.sessionId, name: data.sessionName || sessionName || 'Pasted Notes' };
          set({ currentSession: session, topics: data.topics || [], roadmapNodes: data.roadmapNodes || [], uploading: false });

          if (data.processing) {
            set({ topicsProcessing: true });
            pollForTopics(data.sessionId, (topics) => {
              const nodes = topics.map((t, i) => ({
                id: t._id, label: t.name, status: 'unstarted',
                position: { x: 250, y: i * 150 }, difficulty: t.difficulty,
                estimatedMinutes: t.estimatedMinutes,
              }));
              set({ topics, roadmapNodes: nodes, topicsProcessing: false });
            });
          }
          return data;
        } catch (err) {
          set({ uploading: false, topicsProcessing: false, error: err.userMessage || 'Failed to process notes.' });
          throw err;
        }
      },

      // Open topic mode (no file, just a topic name)
      openSession: async ({ inputType, content, sessionName }) => {
        set({ uploading: true, error: null });
        try {
          const { data } = await api.post('/api/tutor/open', { inputType, content, sessionName });
          set({
            currentSession: { _id: data.sessionId, name: sessionName || content || 'Open Session' },
            topics: data.topics || [],
            uploading: false,
          });
          return data;
        } catch (err) {
          set({ uploading: false, error: err.userMessage || 'Failed to start session.' });
          throw err;
        }
      },

      // Save baseline self-ratings from onboarding step 3
      saveBaseline: async (ratings, explanationLevel) => {
        const ratingsArray = Object.entries(ratings).map(([topicId, selfRating]) => ({
          topicId,
          selfRating,
        }));
        const { data } = await api.post('/api/topics/baseline', { ratings: ratingsArray, explanationLevel });
        return data; // { success, updated, user }
      },

      // Fetch React Flow roadmap for a session
      fetchRoadmap: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get(`/api/roadmap/${sessionId}`);
          set({
            roadmapNodes: data.nodes || [],
            roadmapEdges: data.edges || [],
            currentSession: data.session || get().currentSession,
            loading: false,
          });
          return data;
        } catch (err) {
          set({ loading: false, error: err.userMessage || 'Failed to load roadmap.' });
          throw err;
        }
      },

      // Fetch topics for a session
      fetchSessionTopics: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get(`/api/sessions/${sessionId}/topics`);
          set({ topics: data.topics || [], currentSession: data.session, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: err.userMessage || 'Failed to load topics.' });
          throw err;
        }
      },

      setCurrentSession: (session) => set({ currentSession: session }),
      setTopics: (topics) => set({ topics }),
      clearSession: () => set({ currentSession: null, topics: [], roadmapNodes: [], roadmapEdges: [] }),

      // Fetch all non-deleted sessions for the session switcher dropdown
      fetchUserSessions: async () => {
        try {
          const { data } = await api.get('/api/sessions/user', { _silent: true });
          set({ allSessions: data.sessions || [] });
        } catch {}
      },

      // Switch the active session and load its roadmap
      switchSession: (session) => {
        set({ currentSession: session, roadmapNodes: [], roadmapEdges: [], topics: [] });
      },

      // Soft-delete current session: archives topics, clears local state
      deleteCurrentSession: async (sessionId) => {
        try {
          await api.delete(`/api/sessions/${sessionId}`);
          set((state) => ({
            currentSession: null,
            roadmapNodes: [],
            roadmapEdges: [],
            topics: [],
            allSessions: state.allSessions.filter((s) => s._id !== sessionId),
          }));
        } catch (err) {
          throw err;
        }
      },
    }),
    {
      name: 'neuralnest-session',
      partialize: (state) => ({ currentSession: state.currentSession }),
    }
  )
);

export default useSessionStore;
