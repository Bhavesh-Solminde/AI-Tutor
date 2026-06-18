import { create } from 'zustand';
import api from '../lib/axiosClient';

const useProgressStore = create((set) => ({
  topics: [],
  overallMastery: 0,
  mastered: 0,
  total: 0,
  loading: false,
  error: null,

  fetchProgress: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/api/progress/${userId}`, { _silent: true });
      set({
        topics: data.topics || [],
        overallMastery: data.overallMastery || 0,
        mastered: data.mastered || 0,
        total: data.total || 0,
        loading: false,
      });
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        // New user — no progress yet
        set({ loading: false, topics: [], overallMastery: 0, mastered: 0, total: 0 });
        return null;
      }
      set({ loading: false, error: err.userMessage || 'Failed to load progress data.' });
    }
  },

  updateProgress: async (topicId, masteryScore, status) => {
    try {
      await api.post('/api/progress/update', { topicId, masteryScore, status });
      // Update locally too
      set((state) => ({
        topics: state.topics.map((t) =>
          t._id === topicId ? { ...t, masteryScore, status } : t
        ),
      }));
    } catch {}
  },
}));

export default useProgressStore;
