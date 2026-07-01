import { create } from 'zustand';
import { createSSERequest } from '../lib/axiosClient';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';
import useChatHistoryStore from './useChatHistoryStore';
import useAuthStore from './useAuthStore';

const useTutorStore = create((set, get) => ({
  messages: [],
  agentLogs: [],         // ← real-time agent_log events
  isStreaming: false,
  currentTopic: null,
  chatHistoryId: null,
  checkpointQuestion: '',
  doubtPrompt: 'Do you have any doubts or questions before we move on?',
  nextAction: 'CONTINUE',
  error: null,
  retryPayload: null, // For retry on SSE failure

  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setChatHistoryId: (id) => set({ chatHistoryId: id }),

  // Load saved messages from MongoDB to restore conversation UI
  loadMessages: async (chatHistoryId) => {
    if (!chatHistoryId) return;
    try {
      const { data } = await api.get(`/api/chat-history/messages/${chatHistoryId}`, { _silent: true });
      if (!data.messages || data.messages.length === 0) return;
      // Convert { role, content } → { sender, text } for the UI
      // Only show chips on the last AI message
      const uiMessages = data.messages.map((m, idx) => {
        const isAi = m.role === 'assistant';
        const isSystem = m.role === 'system';
        const isLast = idx === data.messages.length - 1;
        return {
          sender: isAi ? 'ai' : (isSystem ? 'system' : 'user'),
          text: m.content,
          isStreaming: false,
          showChips: isAi && isLast,
        };
      });
      set({ messages: uiMessages });
    } catch {
      // Fail silently — chat will just start fresh
    }
  },

  // Add a user message bubble immediately (optimistic)
  addUserMessage: (text) => {
    set((state) => ({
      messages: [...state.messages, { sender: 'user', text }],
    }));
  },

  // Send message to tutor via SSE stream
  sendMessage: async ({ topicId, message, type = 'teach', chatHistoryId, onChatCreated, materialSessionIds = [], materialSessionSummaries = [] }) => {
    const { isStreaming } = get();
    if (isStreaming) return;

    set({ isStreaming: true, error: null, retryPayload: { topicId, message, type, chatHistoryId } });

    // Add optimistic user bubble
    set((state) => ({
      messages: [...state.messages, { sender: 'user', text: message }],
    }));

    // Add empty AI bubble that will be filled token by token
    const aiMsgIndex = get().messages.length;
    set((state) => ({
      messages: [...state.messages, { sender: 'ai', text: '', isStreaming: true, showChips: false }],
    }));

    let retryCount = 0;
    const maxRetries = 3;

    const attemptStream = async () => {
      try {
        const res = await createSSERequest('/api/tutor/chat', {
          topicId, message, type, chatHistoryId, materialSessionIds, materialSessionSummaries,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
              set((state) => ({
                messages: state.messages.map((m, i) =>
                  i === aiMsgIndex
                    ? { ...m, isStreaming: false, showChips: true }
                    : m
                ),
                isStreaming: false,
                retryPayload: null,
              }));
              return;
            }
            try {
              const parsed = JSON.parse(raw);
              // ── Agent log event ──────────────────────────────────
              if (parsed.type === 'agent_log') {
                set((state) => ({
                  agentLogs: [...state.agentLogs, {
                    timestamp: parsed.timestamp,
                    node: parsed.node,
                    message: parsed.message,
                    logType: parsed.logType || 'info',
                  }],
                }));
                continue;
              }
              // ── Explanation token ─────────────────────────────────
              if (parsed.token) {
                accText += parsed.token;
                const currentText = accText;
                set((state) => ({
                  messages: state.messages.map((m, i) =>
                    i === aiMsgIndex ? { ...m, text: currentText } : m
                  ),
                }));
              }
              // Backend sends chatHistoryId when it auto-creates a chat for open-mode
              if (parsed.chatHistoryId) {
                set({ chatHistoryId: parsed.chatHistoryId });
                // Refresh sidebar so the new auto-created chat appears immediately
                const userId = useAuthStore.getState().user?._id;
                if (userId) useChatHistoryStore.getState().fetchChatHistory(userId);
                if (onChatCreated) onChatCreated(parsed.chatHistoryId);
              }
              if (parsed.done) {
                set({
                  checkpointQuestion: parsed.checkpointQuestion || '',
                  doubtPrompt: parsed.doubtPrompt || 'Do you have any doubts?',
                  nextAction: parsed.nextAction || 'CONTINUE',
                });
              }
            } catch {}
          }
        }
      } catch (err) {
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((r) => setTimeout(r, 1500 * retryCount));
          return attemptStream();
        }
        const userMsg = 'Connection interrupted. Please try sending your message again.';
        set((state) => ({
          messages: state.messages.map((m, i) =>
            i === aiMsgIndex
              ? { ...m, text: '⚠️ Response failed. Please retry.', isStreaming: false, isError: true }
              : m
          ),
          isStreaming: false,
          error: userMsg,
        }));
        toast.error(userMsg);
      }
    };

    await attemptStream();
  },

  // Retry last failed message
  retryLastMessage: () => {
    const { retryPayload } = get();
    if (retryPayload) {
      // Remove last failed AI bubble
      set((state) => ({
        messages: state.messages.filter((m) => !m.isError),
        error: null,
      }));
      get().sendMessage(retryPayload);
    }
  },

  saveRating: async ({ topicId, selfRatingAfter }) => {
    await api.post('/api/tutor/rating', { topicId, selfRatingAfter });
  },

  clearMessages: () => set({
    messages: [],
    agentLogs: [],
    checkpointQuestion: '',
    doubtPrompt: 'Do you have any doubts or questions before we move on?',
    nextAction: 'CONTINUE',
    error: null,
    retryPayload: null,
  }),
}));

export default useTutorStore;
