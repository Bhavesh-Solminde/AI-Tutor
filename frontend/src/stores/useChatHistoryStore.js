import { create } from 'zustand';
import api from '../lib/axiosClient';

const useChatHistoryStore = create((set, get) => ({
  chatHistory: { exam: [], roadmap: [], other: [] },
  loading: false,
  error: null,

  fetchChatHistory: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/api/chat-history/${userId}`, { _silent: true });
      set({
        chatHistory: {
          exam: data.chatHistory?.exam || [],
          roadmap: data.chatHistory?.roadmap || [],
          other: data.chatHistory?.other || [],
        },
        loading: false,
      });
    } catch {
      set({ loading: false, chatHistory: { exam: [], roadmap: [], other: [] } });
    }
  },

  // Find an existing chat for a topicId (avoids creating duplicates on each visit)
  findChatByTopicId: async (topicId) => {
    if (!topicId || topicId === 'new') return null;
    try {
      const { data } = await api.get(`/api/chat-history/by-topic/${topicId}`, { _silent: true });
      return data.chat || null;
    } catch {
      return null;
    }
  },

  createChat: async ({ sessionId, topicId, section, title }) => {
    try {
      const { data } = await api.post('/api/chat-history', { sessionId, topicId, section, title });
      // Prepend to correct section
      set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [section]: [data.chat, ...(state.chatHistory[section] || [])],
        },
      }));
      return data.chat;
    } catch {
      return null;
    }
  },

  deleteChat: async (chatId, section) => {
    try {
      await api.delete(`/api/chat-history/${chatId}`);
      set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [section]: state.chatHistory[section].filter((c) => c._id !== chatId),
        },
      }));
    } catch {}
  },
}));

export default useChatHistoryStore;
