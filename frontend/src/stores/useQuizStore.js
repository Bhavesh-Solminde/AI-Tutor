import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';
import useAuthStore from './useAuthStore';
import useProgressStore from './useProgressStore';
import useSessionStore from './useSessionStore';

const useQuizStore = create(
  persist(
    (set, get) => ({
      questions: [],
      timeLimit: 600,
      loading: false,
      submitting: false,
      error: null,
      result: null,        // Last quiz submit result (mastery, XP, etc.)
      quizHistory: [],
      activeQuizzes: [],

      // Generate 10 questions from backend
      generateQuiz: async (topicId) => {
        set({ loading: true, error: null, questions: [], result: null });
        try {
          const { data } = await api.post('/api/quiz/generate', { topicId });
          if (!data.questions || data.questions.length === 0) {
            throw new Error('No questions returned from AI. Please try again.');
          }
          set({
            questions: data.questions,
            timeLimit: data.timeLimit || 600,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.userMessage || err.message || "Couldn't generate quiz questions. The AI is busy — try again.";
          set({ loading: false, error: msg });
          throw err;
        }
      },

      // Submit quiz answers
      submitQuiz: async ({ topicId, answers, questions, selfRatingAfter = 5, sessionDurationMinutes = 15, examDate, timeTaken = 0 }) => {
        set({ submitting: true, error: null });
        try {
          const { data } = await api.post('/api/quiz/submit', {
            topicId, answers, questions, selfRatingAfter, sessionDurationMinutes, examDate, timeTaken,
          });
          set({ result: data, submitting: false });

          const userId = useAuthStore.getState().user?._id;
          const sessionId = useSessionStore.getState().currentSession?._id;

          await Promise.allSettled([
            userId ? useProgressStore.getState().fetchProgress(userId) : Promise.resolve(),
            sessionId ? useSessionStore.getState().fetchRoadmap(sessionId) : Promise.resolve(),
          ]);

          // XP toast
          if (data.xpEarned) {
            toast.success(`+${data.xpEarned} XP earned! ${data.passed ? '🎉 Topic mastered!' : '📚 Keep studying!'}`, { duration: 4000 });
          }
          return data;
        } catch (err) {
          set({ submitting: false, error: err.userMessage || 'Failed to submit quiz. Your answers are saved locally.' });
          throw err;
        }
      },

      // Fetch quiz history
      fetchQuizHistory: async (userId) => {
        try {
          const { data } = await api.get(`/api/quiz/history/${userId}`);
          set({ quizHistory: data.history || [] });
        } catch {}
      },

      // Fetch active (in-progress) quizzes
      fetchActiveQuizzes: async (userId) => {
        try {
          const { data } = await api.get(`/api/quiz/active/${userId}`);
          set({ activeQuizzes: data.active || [] });
        } catch {}
      },

      fetchQuizResult: async (resultId) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get(`/api/quiz/result/${resultId}`);
          set({ loading: false });
          return data.result;
        } catch (err) {
          const msg = err.userMessage || err.message || "Failed to load quiz results.";
          set({ loading: false, error: msg });
          throw err;
        }
      },

      clearResult: () => set({ result: null }),
    }),
    {
      name: 'neuralnest-quiz',
      partialize: (state) => ({ result: state.result }),
    }
  )
);

export default useQuizStore;
